import { setupApp } from './core/bootstrap';

let hasReloadedAfterMockWorkerChange = false;

/** 记录「该浏览器最近一次注册的 mockServiceWorker.js 内容指纹」，用于判断 worker 是否过期 */
const MOCK_WORKER_FINGERPRINT_KEY = 'mockWorkerFingerprint';

/**
 * 比对 mockServiceWorker.js 是否过期并强制换新。
 *
 * 背景：service worker 跨会话持久，且浏览器不会让「已开着的页面」自动切换新 worker。
 * 若某个旧版本 worker 仍在控制页面，动态 import 的模块（如懒加载路由）会经过旧 worker 的
 * passthrough 链路，偶发「源码存在却 Failed to fetch dynamically imported module」。
 *
 * 做法：拿当前服务端脚本的内容指纹与上次注册记录比对（首次 / 变更 → 强制注销旧 worker，
 * 由后续 worker.start() 重新注册最新脚本，再用 reloadOnce 在 controllerchange 时刷新一次）。
 * 指纹一致则不动，保证稳定态零打扰。
 */
async function unregisterStaleMockWorker(workerUrl: string): Promise<void> {
  if (!('serviceWorker' in navigator)) return;

  const currentScript = await fetch(workerUrl, { cache: 'no-store' })
    .then((res) => res.text())
    .catch(() => null);
  if (currentScript === null) return;

  const currentHash = await contentHash(currentScript);

  let lastSeen: string | null = null;
  try {
    lastSeen = localStorage.getItem(MOCK_WORKER_FINGERPRINT_KEY);
  } catch {
    lastSeen = null;
  }
  try {
    localStorage.setItem(MOCK_WORKER_FINGERPRINT_KEY, currentHash);
  } catch {
    // localStorage 不可用（隐私模式）时忽略，下次启动再比对
  }

  // 与上次一致 → 当前 worker 就是最新版，无需处理
  if (lastSeen !== null && lastSeen === currentHash) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  const mockReg = registrations.find((entry) =>
    entry.active?.scriptURL.endsWith('/mockServiceWorker.js'),
  );
  if (!mockReg?.active) return; // 没有旧 worker，重新注册即得到最新脚本

  await mockReg.unregister();

  // 页面正被旧 worker 控制时不主动 reload：worker.start() 随后的 register 会装上新脚本并 claim，
  // 触发下方 controllerchange 监听刷新一次，让新 worker 接管。
}

/** 脚本内容指纹（SHA-256）。crypto.subtle 需安全上下文（localhost 满足）；失败回退简单散列。 */
async function contentHash(text: string): Promise<string> {
  try {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    let hash = 0;
    for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
    return `fallback-${hash.toString(16)}`;
  }
}

function reloadOnceAfterMockWorkerChange(): void {
  // worker 换新（unregister 后重新注册）时浏览器异步切换控制权，
  // 监听 controllerchange 只刷新一次，让新 worker 尽快接管，同时避免循环 reload。
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hasReloadedAfterMockWorkerChange) return;
    hasReloadedAfterMockWorkerChange = true;
    window.location.reload();
  });
}

if (import.meta.env.DEV) {
  reloadOnceAfterMockWorkerChange();

  Promise.all([import('@/mock/browser'), unregisterStaleMockWorker('/mockServiceWorker.js')]).then(
    ([{ worker }]) => {
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
    },
  );
} else {
  setupApp();
}