import axios, { type AxiosInstance } from 'axios';
import type {
  ApiResponse,
  DownloadOptions,
  HttpInstance,
  HttpOptions,
  HttpRequestConfig,
  UploadOptions,
} from './types';
import { setupInterceptors } from './interceptors';
import { PendingRequestManager } from './pending';
import { downloadFile, uploadFile } from './file-transfer';

/** 默认接口基础地址（与 vite proxy / mock 的 /api 前缀对齐） */
const DEFAULT_BASE_URL = '/api';
/** 默认超时时间 */
const DEFAULT_TIMEOUT = 10000;

/**
 * 创建一个 HTTP 封装实例。
 *
 * 默认挂载拦截器：token 自动注入、业务信封解包、401/超时/网络错误统一处理。
 * 可选启用 cancelPrevious：相同请求（method+url+params+data）自动取消旧的，消除 Race Condition。
 *
 * 除 get/post/put/delete 外，还内置 download / upload 文件传输方法。
 *
 * 扩展用法：
 * 1. 多实例 —— 对接不同后端时创建独立实例：
 *    `const payHttp = createHttp({ baseURL: '/payment-api' })`
 * 2. 完全自定义 —— 关闭默认拦截器后自行组装：
 *    `const h = createHttp({ withDefaultInterceptors: false }); h.axios.interceptors...`
 * 3. 防竞态 —— 查询/搜索类接口开启重复取消：
 *    `const searchHttp = createHttp({ cancelPrevious: true })`
 */
export function createHttp(options: HttpOptions = {}): HttpInstance {
  const {
    baseURL = DEFAULT_BASE_URL,
    timeout = DEFAULT_TIMEOUT,
    headers,
    withDefaultInterceptors = true,
    cancelPrevious = false,
  } = options;

  // 1) 创建底层 axios 实例
  const axiosInstance: AxiosInstance = axios.create({
    baseURL,
    timeout,
    headers,
  });

  // 2) 挂载默认拦截器（可关闭）
  if (withDefaultInterceptors) {
    // 每个实例持有独立的 pending 管理器，避免多实例之间互相误取消
    const manager = new PendingRequestManager();
    setupInterceptors(axiosInstance, { manager, cancelPrevious });
  }

  // 3) 基于拦截器解包后的返回值，提供「类型安全」的便捷方法。
  //    说明：axios 原生 .get/.post 的类型签名仍假定返回 AxiosResponse<T>，
  //    但我们已在响应拦截器中把返回值替换为 ApiResponse<T>，
  //    这里通过 as 显式收窄类型，使调用方拿到与运行时一致的业务数据类型。
  const instance: HttpInstance = {
    axios: axiosInstance,
    get: <T = unknown>(url: string, config?: HttpRequestConfig) =>
      axiosInstance.get<ApiResponse<T>>(url, config) as unknown as Promise<ApiResponse<T>>,
    post: <T = unknown>(url: string, data?: unknown, config?: HttpRequestConfig) =>
      axiosInstance.post<ApiResponse<T>>(url, data, config) as unknown as Promise<ApiResponse<T>>,
    put: <T = unknown>(url: string, data?: unknown, config?: HttpRequestConfig) =>
      axiosInstance.put<ApiResponse<T>>(url, data, config) as unknown as Promise<ApiResponse<T>>,
    delete: <T = unknown>(url: string, config?: HttpRequestConfig) =>
      axiosInstance.delete<ApiResponse<T>>(url, config) as unknown as Promise<ApiResponse<T>>,
    // 文件下载：blob 错误检测 + 文件名提取 + 浏览器保存
    download: (url: string, options?: DownloadOptions) => downloadFile(axiosInstance, url, options),
    // 文件上传：FormData 进度上传，响应走业务信封解包
    upload: <T = unknown>(
      url: string,
      data: FormData | Record<string, unknown>,
      options?: UploadOptions,
    ) => uploadFile<T>(axiosInstance, url, data, options),
  };

  return instance;
}

/**
 * 默认 HTTP 实例（baseURL=/api）。
 *
 * 绝大多数业务接口直接复用本实例即可，无需各自 axios.create。
 * @example
 *   export const getUser = (id: string) => request.get<User>(`/users/${id}`)
 *   const res = await getUser('1')  // res: ApiResponse<User>
 */
export const request = createHttp();
