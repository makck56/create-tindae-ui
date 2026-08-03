/**
 * HTTP 封装层统一错误类型。
 *
 * 将「HTTP 状态错误、请求超时、网络中断」三类失败归一为 HttpError，
 * 调用方只需 try/catch 一个类型，并通过 isTimeout / isNetworkError 精准分支处理。
 *
 * @example
 * try {
 *   await request.get('/users')
 * } catch (e) {
 *   if (e instanceof HttpError) {
 *     if (e.isTimeout) message.error('请求超时')
 *     else if (e.isNetworkError) message.error('网络异常')
 *     else if (e.status === 401) router.push('/login')
 *   }
 * }
 */
export class HttpError extends Error {
  /** HTTP 状态码；网络/超时等无法拿到响应时为 0 */
  readonly status: number;
  /** 是否为请求超时 */
  readonly isTimeout: boolean;
  /** 是否为网络中断 / DNS 失败等无法到达服务器的错误 */
  readonly isNetworkError: boolean;
  /** 后端业务响应体（若服务端有返回） */
  readonly response?: { code: number; message?: string };

  constructor(params: {
    message: string;
    status?: number;
    isTimeout?: boolean;
    isNetworkError?: boolean;
    response?: { code: number; message?: string };
  }) {
    super(params.message);
    this.name = 'HttpError';
    this.status = params.status ?? 0;
    this.isTimeout = params.isTimeout ?? false;
    this.isNetworkError = params.isNetworkError ?? false;
    this.response = params.response;
    // 保证 instanceof 在 ES5 编译目标下仍正确（TS 继承内置类的已知坑）
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

/**
 * 请求被取消错误。
 *
 * 触发场景：cancelPrevious 开启时相同请求被新请求取代，或调用方手动 abort。
 *
 * 与 HttpError 的区别：取消是「预期内的静默失败」——
 * 响应拦截器对它**不触发** onNetworkError / onUnauthorized 等全局回调，
 * 调用方按需 catch 即可（通常直接忽略，因为已有更新的请求在途）。
 *
 * @example
 * try {
 *   await searchApi(keyword)
 * } catch (e) {
 *   if (e instanceof RequestCanceledError) return  // 被新请求取代，忽略
 *   // 其它错误照常处理...
 * }
 */
export class RequestCanceledError extends Error {
  constructor(message = '请求已取消') {
    super(message);
    this.name = 'RequestCanceledError';
    Object.setPrototypeOf(this, RequestCanceledError.prototype);
  }
}
