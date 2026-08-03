import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// MSW 的 passthrough 异常堆栈只会指向 public/mockServiceWorker.js，无法直接看出失败 URL。
// 开发态把未匹配请求打印出来，方便定位是 Vite 模块、静态资源，还是遗漏的业务 mock。
worker.events.on('request:unhandled', ({ request }) => {
  const url = new URL(request.url);
  console.warn(`[mock] 未处理请求将放行: ${request.method} ${url.pathname}${url.search}`, {
    destination: request.destination,
    mode: request.mode,
    cache: request.cache,
  });
});
