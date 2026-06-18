import type { HttpError } from './error'

/**
 * 运行时可注入配置接口。
 *
 * core/http 被设计为「零业务依赖」的底层模块——它不直接 import router / pinia，
 * 否则会形成「http → store → api → http」的循环依赖。
 *
 * 取而代之的是：应用在 bootstrap 阶段通过 configureHttp() 把
 * token 获取、未授权跳转、错误提示等「业务能力」以回调形式注入进来。
 */
export interface HttpRuntimeConfig {
  /** 获取访问令牌；返回 null 时本次请求不附加 Authorization 头 */
  getToken?: () => string | null
  /** 收到 401 / 未授权时的回调（通常：登出 + 跳登录页） */
  onUnauthorized?: () => void
  /** 网络错误 / 超时时的全局提示回调（如 message.error） */
  onNetworkError?: (error: HttpError) => void
  /** 业务错误（HTTP 成功但 code !== 0）的全局提示回调 */
  onBusinessError?: (response: { code: number; message?: string }) => void
}

/**
 * 默认运行时配置。
 * - getToken 默认从 localStorage 读取 'token'，业务可在 configureHttp 中覆盖。
 * - 其余回调默认为空操作，由业务按需注入。
 */
const defaultConfig: HttpRuntimeConfig = {
  getToken: () => {
    try {
      return localStorage.getItem('token')
    } catch {
      // localStorage 不可用（如隐私模式 / SSR）时安全降级
      return null
    }
  },
}

let runtimeConfig: HttpRuntimeConfig = { ...defaultConfig }

/**
 * 注入运行时配置（合并式，可多次调用渐进配置）。
 *
 * @example
 * configureHttp({
 *   getToken: () => localStorage.getItem('token'),
 *   onUnauthorized: () => { useAuthStore().logout(); router.push('/login') },
 *   onNetworkError: (e) => message.error(e.message),
 * })
 */
export function configureHttp(partial: Partial<HttpRuntimeConfig>): void {
  runtimeConfig = { ...runtimeConfig, ...partial }
}

/** 读取当前运行时配置（拦截器内部使用） */
export function getHttpRuntimeConfig(): HttpRuntimeConfig {
  return runtimeConfig
}
