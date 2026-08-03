import { http, HttpResponse } from 'msw';

/**
 * 开发态 API mock 兜底。
 *
 * 目的：
 * - 已声明的业务 handler 仍然优先匹配，保持正常 mock 数据流。
 * - 未声明的 `/api/...` 请求不再被 MSW passthrough 到真实网络，避免在没有后端或 Vite proxy 时
 *   抛出 `mockServiceWorker.js: passthrough Failed to fetch` 这类难以定位的错误。
 * - 返回结构化 404，并在控制台打印缺失的 mock 路径，开发者能直接知道该补哪个 handler。
 */
export const fallbackHandlers = [
  http.all(/\/api\/.+/, ({ request }) => {
    const url = new URL(request.url);
    const endpoint = `${request.method} ${url.pathname}${url.search}`;

    console.warn(`[mock] 未匹配的 API 请求: ${endpoint}`);

    return HttpResponse.json(
      {
        code: 404,
        message: `Mock 接口未实现: ${endpoint}`,
        data: null,
      },
      { status: 404 },
    );
  }),
];
