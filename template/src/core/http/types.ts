import type { AxiosRequestConfig, AxiosInstance } from 'axios';

/**
 * 后端统一业务响应信封。
 *
 * 约定：所有接口最外层结构固定为 { code, data, message }，
 * 这样前端只需在一处（响应拦截器）解包，业务层直接拿到 data。
 *
 * - code: 业务状态码，0 表示成功，非 0 表示业务错误（如 40001 验证码错误）
 * - data: 业务数据负载，类型由具体接口的泛型 T 决定
 * - message: 可选的提示文案，常用于错误时展示给用户
 */
export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message?: string;
}

/**
 * 封装层扩展的请求配置。
 *
 * 继承 axios 原生配置，并新增若干控制开关，
 * 让业务在「单次请求」粒度上关闭默认行为，无需为特例另建实例。
 */
export interface HttpRequestConfig extends AxiosRequestConfig {
  /** 是否跳过自动附加 Authorization 头（如登录、验证码等匿名接口） */
  skipAuth?: boolean;
  /** 是否跳过响应错误的统一处理（调用方想自行 catch 并定制提示时使用） */
  skipErrorHandler?: boolean;
  /** 是否保留原始 AxiosResponse、跳过业务信封解包（如文件下载） */
  rawResponse?: boolean;
  /** 是否跳过 cancelPrevious 的自动取消（即使实例开启了 cancelPrevious，本请求也不取消旧请求） */
  skipCancel?: boolean;
  /** 是否跳过主动 token 刷新（refresh 请求自身需设置，防止递归刷新） */
  skipRefresh?: boolean;
}

/** 文件下载选项 */
export interface DownloadOptions {
  /** query 参数 */
  params?: Record<string, unknown>;
  /** 指定保存文件名；默认从响应头 content-disposition 提取 */
  filename?: string;
  /** 下载进度回调（0-100） */
  onProgress?: (percent: number) => void;
  /** 是否自动触发浏览器保存，默认 true；设 false 仅返回 blob（用于预览 / 二次处理） */
  autoSave?: boolean;
  /** 跳过 token 注入 */
  skipAuth?: boolean;
  /** 跳过全局错误处理 */
  skipErrorHandler?: boolean;
}

/** 文件上传选项 */
export interface UploadOptions {
  /** 上传进度回调（0-100） */
  onProgress?: (percent: number) => void;
  /** 跳过 token 注入 */
  skipAuth?: boolean;
  /** 跳过全局错误处理 */
  skipErrorHandler?: boolean;
  /** 是否启用相同请求取消（大文件上传中断后重新上传场景） */
  cancelPrevious?: boolean;
  /** 自定义请求头（注意：FormData 上传时不要设 Content-Type，axios 自动加 boundary） */
  headers?: Record<string, string>;
}

/**
 * HTTP 封装实例接口：在原生 AxiosInstance 之上挂载「类型安全」的请求方法。
 *
 * 与 axios 原生 .get/.post 的区别：
 * 原生方法返回 Promise<AxiosResponse<T>>（含 headers/status 等传输层信息），
 * 这里返回 Promise<ApiResponse<T>>（已由拦截器解包，直接是业务数据对象）。
 */
export interface HttpInstance {
  get<T = unknown>(url: string, config?: HttpRequestConfig): Promise<ApiResponse<T>>;
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig,
  ): Promise<ApiResponse<T>>;
  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig,
  ): Promise<ApiResponse<T>>;
  delete<T = unknown>(url: string, config?: HttpRequestConfig): Promise<ApiResponse<T>>;
  /** 文件下载：blob 错误检测 + 文件名提取 +（默认）浏览器保存，返回 { blob, filename } */
  download(url: string, options?: DownloadOptions): Promise<{ blob: Blob; filename: string }>;
  /** 文件上传：FormData 进度上传，响应走业务信封解包返回 ApiResponse<T> */
  upload<T = unknown>(
    url: string,
    data: FormData | Record<string, unknown>,
    options?: UploadOptions,
  ): Promise<ApiResponse<T>>;
  /** 暴露底层 axios 实例，便于注册自定义拦截器等高级扩展 */
  readonly axios: AxiosInstance;
}

/** createHttp 工厂配置项 */
export interface HttpOptions {
  /** 接口基础地址，默认 /api */
  baseURL?: string;
  /** 超时时间（毫秒），默认 10000 */
  timeout?: number;
  /** 默认请求头 */
  headers?: Record<string, string>;
  /** 是否挂载默认拦截器（token 注入 / 信封解包 / 错误处理），默认 true */
  withDefaultInterceptors?: boolean;
  /**
   * 是否启用「相同请求自动取消」（cancelPrevious）：相同 method+url+params+data
   * 的新请求会自动 abort 旧的、只保留最新，消除 Race Condition。默认 false（opt-in）。
   * 可被单请求的 skipCancel 关闭。
   */
  cancelPrevious?: boolean;
}
