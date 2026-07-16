/**
 * 浏览器版本支持模块（A 方案：声明下限 + 运行时只提示、不降级）。
 *
 * 消费方式（见 core/bootstrap/index.ts 的 setupApp）：
 *   if (!isBrowserSupported()) { renderUnsupportedBrowser(); return; }
 *   app.mount('#app');
 *
 * 调整下限：改 `config.ts` 的 MIN_BROWSER_VERSIONS，并同步 package.json 的 browserslist。
 * 兼容更老浏览器（B 方案 legacy 降级）：见 vite.config.ts 的 VITE_LEGACY_BUILD 开关。
 */
export { MIN_BROWSER_VERSIONS } from './config';
export type { BrowserName } from './config';
export { detectBrowser } from './detectBrowser';
export type { DetectedBrowser } from './detectBrowser';
export { isBrowserSupported } from './isSupported';
export { renderUnsupportedBrowser } from './UnsupportedBrowser';
