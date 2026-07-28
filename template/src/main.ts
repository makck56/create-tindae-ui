import { setupApp } from './core/bootstrap';

let hasReloadedAfterMockWorkerChange = false;

async function updateExistingMockWorker(): Promise<void> {
  // 开发时同一个 localhost 端口经常会在 demo/template 或多次 Vite 重启之间复用。
  // 如果浏览器仍被旧的 mockServiceWorker.js 控制，动态路由模块可能经过旧 worker 的 passthrough 链路，
  // 表现为源码文件明明存在却偶发 404 / Failed to fetch dynamically imported module。
  // 这里不注销 MSW，而是主动触发 update，并在 start() 里禁用 HTTP cache，保持“MSW 默认 mock”架构不变。
  if (!('serviceWorker' in navigator)) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations
      .filter((registration) => registration.active?.scriptURL.endsWith('/mockServiceWorker.js'))
      .map((registration) => registration.update()),
  );
}

function reloadOnceAfterMockWorkerChange(): void {
  // worker.update() 只能确保浏览器尝试拉取新脚本；当前页面是否立刻切到新 controller 取决于浏览器生命周期。
  // 监听 controllerchange 后只刷新一次，可以让刚更新的 mockServiceWorker.js 尽快接管当前页面，
  // 同时避免重复刷新造成开发态循环 reload。
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hasReloadedAfterMockWorkerChange) return;
    hasReloadedAfterMockWorkerChange = true;
    window.location.reload();
  });
}

if (import.meta.env.DEV) {
  reloadOnceAfterMockWorkerChange();

  Promise.all([import('@/mock/browser'), updateExistingMockWorker()]).then(([{ worker }]) => {
    // 非 API 请求（Vite HMR、源码模块、静态资源、第三方资源）继续放行。
    // API 请求如果没有业务 handler，会由 mock/handlers/fallback.ts 返回结构化 404，
    // 避免 passthrough 到不存在的真实后端后只留下 mockServiceWorker.js: Failed to fetch。
    worker
      .start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: '/mockServiceWorker.js',
          options: {
            // 禁止浏览器用 HTTP cache 里的旧 worker 脚本完成注册，确保 dev server 重启后拿到最新 worker。
            updateViaCache: 'none',
          },
        },
      })
      .then(setupApp);
  });
} else {
  setupApp();
}
