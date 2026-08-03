/**
 * HTTP 封装统一出口。
 *
 * 设计目标：
 * 1. 统一实例与拦截器 —— 消除各 api 文件重复的 axios.create 与样板代码；
 * 2. 类型安全 —— 请求方法返回 Promise<ApiResponse<T>>，业务层直拿 data；
 * 3. 可扩展 —— createHttp 多实例 / configureHttp 运行时依赖注入 / 底层 axios 自定义拦截器；
 * 4. 防竞态 —— cancelPrevious 相同请求自动取消，消除 Race Condition。
 *
 * ── 典型用法 ────────────────────────────────────────────────
 * // 1) bootstrap 阶段注入运行时依赖（token、401 跳转、错误提示）
 * configureHttp({
 *   getToken: () => localStorage.getItem('token'),
 *   onUnauthorized: () => { useAuthStore().logout(); router.push('/login') },
 *   onNetworkError: (e) => message.error(e.message),
 * })
 *
 * // 2) api 文件直接使用默认实例
 * export const getUser = (id: string) => request.get<User>(`/users/${id}`)
 *
 * // 3) 调用方
 * const res = await getUser('1')   // res: ApiResponse<User>
 * if (res.code !== 0) throw new Error(res.message)
 * console.log(res.data)           // User
 */
export { request, createHttp } from './instance';
export { configureHttp, getHttpRuntimeConfig } from './config';
export type { HttpRuntimeConfig } from './config';
export {
  setupInterceptors,
  attachAuthHeader,
  unwrapBusinessEnvelope,
  handleResponseError,
} from './interceptors';
export type { InterceptorOptions } from './interceptors';
export { HttpError, RequestCanceledError } from './error';
export { PendingRequestManager, buildRequestKey } from './pending';
export { tokenRefreshCoordinator, TokenRefreshCoordinator } from './token-refresh';
export { saveBlob, extractFilename } from './file-transfer';
export type { RefreshedTokens } from './config';
export type {
  ApiResponse,
  HttpRequestConfig,
  HttpInstance,
  HttpOptions,
  DownloadOptions,
  UploadOptions,
} from './types';
