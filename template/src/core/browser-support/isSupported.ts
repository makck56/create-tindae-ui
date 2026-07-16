import { detectBrowser } from './detectBrowser';
import { MIN_BROWSER_VERSIONS } from './config';
import type { BrowserName } from './config';

/**
 * 判定浏览器是否达到最低支持版本（A 方案核心判定）。
 *
 * - unknown（UA 无法识别）：默认放行 `true`——UA 解析有局限，宁放行不误伤非常规 / 新浏览器；
 * - 已知浏览器：主版本号 ≥ `MIN_BROWSER_VERSIONS[name]` 才放行。
 *
 * @param userAgent 默认读 `navigator.userAgent`；显式传入便于单测与 SSR。
 */
export function isBrowserSupported(userAgent: string = navigator.userAgent): boolean {
  const { name, version } = detectBrowser(userAgent);
  if (name === 'unknown') return true;
  return version >= MIN_BROWSER_VERSIONS[name as BrowserName];
}
