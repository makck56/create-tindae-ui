import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse, HttpRequestConfig } from './types'
import { HttpError, RequestCanceledError } from './error'
import { getHttpRuntimeConfig } from './config'
import { PendingRequestManager, buildRequestKey } from './pending'

/** 暂存到 config 上的内部字段名（供响应拦截器按身份清理 pending） */
const PENDING_KEY = '__pendingKey'
const PENDING_CTRL = '__pendingController'

/** 带 pending 内部字段的 config 类型 */
type PendingAwareConfig = InternalAxiosRequestConfig & {
  __pendingKey?: string
  __pendingController?: AbortController
}

/** setupInterceptors 的可选项 */
export interface InterceptorOptions {
  /** 进行中请求管理器（cancelPrevious 启用时传入） */
  manager?: PendingRequestManager
  /** 是否启用「相同请求自动取消」 */
  cancelPrevious?: boolean
}

/**
 * 请求拦截器：自动附加 Authorization 头。
 *
 * 规则：
 * 1. 配置了 skipAuth（匿名接口）→ 跳过；
 * 2. 运行时 getToken() 返回 null（未登录）→ 跳过；
 * 3. 否则附加 `Bearer <token>`。
 */
export function attachAuthHeader(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const custom = config as InternalAxiosRequestConfig & HttpRequestConfig
  if (custom.skipAuth) return config

  const token = getHttpRuntimeConfig().getToken?.()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
}

/**
 * 响应拦截器（成功分支）：解包业务信封。
 *
 * 将 AxiosResponse<ApiResponse<T>> 转为 ApiResponse<T>，
 * 使封装后的请求方法直接返回业务数据对象（去掉传输层外壳）。
 *
 * 注意：此处只做「解壳」，不因 code !== 0 抛错——
 * 业务错误的处理时机因场景而异，保留给调用方判断；如需全局兜底，用 onBusinessError。
 */
export function unwrapBusinessEnvelope(response: AxiosResponse<ApiResponse>): ApiResponse {
  const custom = response.config as HttpRequestConfig
  if (custom.rawResponse) {
    return response as unknown as ApiResponse
  }
  return response.data
}

/**
 * 响应拦截器（失败分支）：统一 HTTP 错误处理。
 *
 * 优先识别「请求被取消」（ERR_CANCELED）→ 抛 RequestCanceledError，静默、不触发任何全局回调；
 * 其余按 超时 / 网络中断 / HTTP 状态码 归一为 HttpError，并按需触发 onNetworkError / onUnauthorized。
 */
export function handleResponseError(error: unknown): never {
  const axErr = error as {
    code?: string
    message?: string
    response?: { status: number; data?: ApiResponse }
    config?: HttpRequestConfig
  }

  // 0) 请求被取消（cancelPrevious 取代或手动 abort）：静默失败，不触发全局回调
  if (axErr.code === 'ERR_CANCELED') {
    throw new RequestCanceledError()
  }

  // 统一收敛为 HttpRequestConfig 类型，便于安全访问 skipAuth / skipErrorHandler 等扩展字段
  const config: HttpRequestConfig = (axErr.config ?? {}) as HttpRequestConfig
  const runtime = getHttpRuntimeConfig()

  // 1) 请求超时（ECONNABORTED 是 axios 的超时错误码）
  const isTimeout = axErr.code === 'ECONNABORTED' || /timeout/i.test(axErr.message ?? '')
  // 2) 网络中断：无 response 且非超时（断网 / DNS 失败 / CORS 等）
  const isNetwork = !axErr.response && !isTimeout

  if (isTimeout || isNetwork) {
    const httpError = new HttpError({
      message: isTimeout ? '请求超时，请稍后重试' : '网络异常，请检查网络连接',
      isTimeout,
      isNetworkError: isNetwork,
    })
    if (!config.skipErrorHandler) runtime.onNetworkError?.(httpError)
    throw httpError
  }

  const status = axErr.response?.status ?? 0
  const biz = axErr.response?.data

  // 3) 401 未授权：清态 + 跳登录（由业务注入的具体逻辑决定）
  if (status === 401 && !config.skipErrorHandler) {
    runtime.onUnauthorized?.()
  }

  throw new HttpError({
    message: biz?.message || `请求失败（${status}）`,
    status,
    response: biz ? { code: biz.code, message: biz.message } : undefined,
  })
}

/**
 * 清理 config 对应的 pending 登记（请求结束时调用）。
 * 按 controller 身份删除，避免被取消的旧请求误删已覆盖它的新请求。
 */
function cleanupPending(
  config: InternalAxiosRequestConfig | undefined,
  manager?: PendingRequestManager,
): void {
  if (!config || !manager) return
  const aware = config as PendingAwareConfig
  if (aware.__pendingKey && aware.__pendingController) {
    manager.remove(aware.__pendingKey, aware.__pendingController)
  }
}

/**
 * 一键为 axios 实例挂载全部默认拦截器（含可选的 cancelPrevious 管理）。
 *
 * 业务若需要更精细的控制，可在 createHttp({ withDefaultInterceptors: false }) 后，
 * 自行调用 instance.axios.interceptors.xxx.use(...) 组装。
 */
export function setupInterceptors(
  instance: AxiosInstance,
  options: InterceptorOptions = {},
): void {
  const { manager, cancelPrevious = false } = options

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    attachAuthHeader(config)

    // 登记进行中请求：相同 key 自动取消旧的（仅 cancelPrevious 启用且本请求未 skipCancel 时）
    if (cancelPrevious && manager) {
      const custom = config as InternalAxiosRequestConfig & HttpRequestConfig
      if (!custom.skipCancel) {
        const aware = config as PendingAwareConfig
        const key = buildRequestKey(config)
        aware.__pendingKey = key
        aware.__pendingController = manager.add(key, config)
      }
    }
    return config
  })

  instance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      cleanupPending(response.config, manager)
      return unwrapBusinessEnvelope(response)
    },
    (error: unknown) => {
      cleanupPending((error as { config?: InternalAxiosRequestConfig }).config, manager)
      return handleResponseError(error)
    },
  )
}
