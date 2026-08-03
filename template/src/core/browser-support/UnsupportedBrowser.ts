import { detectBrowser } from './detectBrowser';

/**
 * 渲染「浏览器版本过低」整页提示（原生 DOM，不依赖 Vue / antd / Tailwind）。
 *
 * 使用时机：`app.mount` **之前**。当 `isBrowserSupported()` 返回 false 时调用，替换 `#app`
 * 内容后由调用方 `return`，阻止应用挂载。目标场景正是「浏览器太老」，因此不能假设现代运行时
 * （Vue / ES2020+ 模块系统）可用——样式与文案全部内联，不依赖任何构建期注入或外部资源。
 */
export function renderUnsupportedBrowser(): void {
  const { name, version } = detectBrowser(navigator.userAgent);
  const detected = name === 'unknown' ? '' : `当前浏览器：${name} ${version}`;

  const container = document.getElementById('app') ?? document.body;
  container.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:24px;">
      <div style="max-width:480px;width:100%;background:#fff;border-radius:12px;box-shadow:0 6px 24px rgba(0,0,0,.08);padding:40px 32px;text-align:center;">
        <div style="font-size:48px;line-height:1;margin-bottom:16px;">⚠️</div>
        <h1 style="font-size:22px;color:rgba(0,0,0,.88);margin:0 0 12px;">浏览器版本过低</h1>
        <p style="font-size:14px;color:rgba(0,0,0,.65);line-height:1.6;margin:0 0 8px;">
          为保证最佳体验与安全性，本系统需要更新版本的浏览器。
        </p>
        ${
          detected
            ? `<p style="font-size:13px;color:rgba(0,0,0,.45);margin:0 0 20px;">${detected}</p>`
            : '<div style="height:20px;"></div>'
        }
        <p style="font-size:13px;color:rgba(0,0,0,.65);margin:0 0 24px;">请升级到以下任一浏览器的较新版本：</p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
          ${['Chrome', 'Edge', 'Firefox', 'Safari']
            .map(
              (b) =>
                `<span style="display:inline-block;padding:6px 14px;background:#f5f5f5;border-radius:16px;font-size:13px;color:rgba(0,0,0,.75);">${b}</span>`,
            )
            .join('')}
        </div>
      </div>
    </div>
  `;
}
