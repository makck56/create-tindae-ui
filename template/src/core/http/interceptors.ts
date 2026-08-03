import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, HttpRequestConfig } from './types';
import { HttpError, RequestCanceledError } from './error';
import { getHttpRuntimeConfig } from './config';
import { PendingRequestManager, buildRequestKey } from './pending';
import { tokenRefreshCoordinator } from './token-refresh';

/** 带 pending 内部字段的 config 类型 */
type PendingAwareConfig = InternalAxiosRequestConfig & {
  __pendingKey?: string;
  __pendingController?: AbortController;
};

/** setupInterceptors 的可选项 */
export interface InterceptorOptions {
  /** 进行中请求管理器（cancelPrevious 启用时传入） */
  manager?: PendingRequestManager;
  /** 是否启用「相同请求自动取消」 */
  cancelPrevious?: boolean;
}

/** 判断是否为 refresh 请求自身（避免对它再做 refresh 处理，防递归） */
function isRefreshRequest(config: HttpRequestConfig | undefined): boolean {
  return !!config?.skipRefresh;
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
  const custom = config as InternalAxiosRequestConfig & HttpRequestConfig;
  if (custom.skipAuth) return config;

  const token = getHttpRuntimeConfig().getToken?.();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
}

/**
 * 响应拦截器（成功分支）：解包业务信封。
 */
export function unwrapBusinessEnvelope(response: AxiosResponse<ApiResponse>): ApiResponse {
  const custom = response.config as HttpRequestConfig;
  if (custom.rawResponse) {
    return response as unknown as ApiResponse;
  }
  return response.data;
}

/**
 * 响应拦截器（失败分支）：统一 HTTP 错误处理（**不含 401 续期重试**，那段在 setupInterceptors 的 onRejected 优先处理）。
 *
 * 本函数负责：请求取消（静默）、超时 / 网络错误、refresh 请求自身的 401、未启用续期时的普通 401、其它状态码。
 */
export function handleResponseError(error: unknown): never {
  const axErr = error as {
    code?: string;
    message?: string;
    response?: { status: number; data?: ApiResponse };
    config?: HttpRequestConfig;
  };

  // 请求被取消：静默失败
  if (axErr.code === 'ERR_CANCELED') {
    throw new RequestCanceledError();
  }

  const config: HttpRequestConfig = (axErr.config ?? {}) as HttpRequestConfig;
  const runtime = getHttpRuntimeConfig();

  const isTimeout = axErr.code === 'ECONNABORTED' || /timeout/i.test(axErr.message ?? '');
  const isNetwork = !axErr.response && !isTimeout;

  if (isTimeout || isNetwork) {
    const httpError = new HttpError({
      message: isTimeout ? '请求超时，请稍后重试' : '网络异常，请检查网络连接',
      isTimeout,
      isNetworkError: isNetwork,
    });
    if (!config.skipErrorHandler) runtime.onNetworkError?.(httpError);
    throw httpError;
  }

  const status = axErr.response?.status ?? 0;
  const biz = axErr.response?.data;

  // 401 且未 skipErrorHandler → 触发 onUnauthorized。
  // 续期场景下普通请求的 401 已在 onRejected 中被 retryWithRefresh 拦截，不会走到这里；
  // 走到这里的是：refresh 请求自身 401（skipErrorHandler，不触发）、或未启用续期的普通 401。
  if (status === 401 && !config.skipErrorHandler) {
    runtime.onUnauthorized?.();
  }

  throw new HttpError({
    message: biz?.message || `请求失败（${status}）`,
    status,
    response: biz ? { code: biz.code, message: biz.message } : undefined,
  });
}

/** 清理 config 对应的 pending 登记（按 controller 身份删除，防误删覆盖它的新请求）。 */
function cleanupPending(
  config: InternalAxiosRequestConfig | undefined,
  manager?: PendingRequestManager,
): void {
  if (!config || !manager) return;
  const aware = config as PendingAwareConfig;
  if (aware.__pendingKey && aware.__pendingController) {
    manager.remove(aware.__pendingKey, aware.__pendingController);
  }
}

/**
 * 一键为 axios 实例挂载全部默认拦截器：
 * - 请求拦截器（async）：主动 token 刷新 → 附加 Authorization → cancelPrevious 登记；
 * - 响应拦截器：401 续期重试 → 解包信封 → 错误归一。
 *
 * 业务若需要更精细的控制，可在 createHttp({ withDefaultInterceptors: false }) 后，
 * 自行调用 instance.axios.interceptors.xxx.use(...) 组装。
 */
export function setupInterceptors(instance: AxiosInstance, options: InterceptorOptions = {}): void {
  const { manager, cancelPrevious = false } = options;

  instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const custom = config as InternalAxiosRequestConfig & HttpRequestConfig;

    // 1) 主动刷新（方案 B）：非匿名、非 refresh 请求、token 临过期 → 先刷新再发。
    //    这样「活跃用户」的请求带的一定是新鲜 token，根本不会触发 401。
    if (!custom.skipAuth && !custom.skipRefresh) {
      try {
        await tokenRefreshCoordinator.ensureFreshToken();
      } catch {
        // 刷新失败：不阻断请求，继续用旧 token 发出，交给响应 401 兜底处理
      }
    }

    // 2) 附加 Authorization 头（若刚 refresh 成功，本地 token 已是最新）
    attachAuthHeader(config);

    // 3) cancelPrevious 登记（仅启用且本请求未 skipCancel 时）
    if (cancelPrevious && manager && !custom.skipCancel) {
      const aware = config as PendingAwareConfig;
      const key = buildRequestKey(config);
      aware.__pendingKey = key;
      aware.__pendingController = manager.add(key, config);
    }
    return config;
  });

  instance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      cleanupPending(response.config, manager);
      return unwrapBusinessEnvelope(response);
    },
    async (error: unknown) => {
      const axErr = error as {
        code?: string;
        response?: { status: number; data?: ApiResponse };
        config?: InternalAxiosRequestConfig;
      };
      cleanupPending(axErr.config, manager);

      // 请求被取消：静默
      if (axErr.code === 'ERR_CANCELED') {
        throw new RequestCanceledError();
      }

      const config = axErr.config as (InternalAxiosRequestConfig & HttpRequestConfig) | undefined;
      const status = axErr.response?.status;
      const runtime = getHttpRuntimeConfig();

      // 401 兜底（方案 C）：普通请求 401 且已启用续期 → refresh 后重试原请求。
      // refresh 请求自身的 401（isRefreshRequest）不进此分支，交给 handleResponseError。
      if (status === 401 && config && !isRefreshRequest(config) && runtime.refreshAccessToken) {
        try {
          return await tokenRefreshCoordinator.retryWithRefresh({ config }, instance);
        } catch {
          // refresh 失败 / 重试仍 401：refresh_token 也失效，终止会话
          runtime.onUnauthorized?.();
          throw new HttpError({
            message: axErr.response?.data?.message || '登录已过期，请重新登录',
            status: 401,
            response: axErr.response?.data
              ? { code: axErr.response.data.code, message: axErr.response.data.message }
              : undefined,
          });
        }
      }

      // 其余错误（refresh 请求自身的 401 / 超时 / 网络 / 其它状态码）走标准处理
      return handleResponseError(error);
    },
  );
}
