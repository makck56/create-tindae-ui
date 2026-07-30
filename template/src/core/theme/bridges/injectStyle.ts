import { VXE_THEME_CSS } from './vxeTable';

/** 注入到 <head> 的主题覆盖样式 <style> 标签 id，用于幂等去重。 */
const THEME_STYLE_ID = 'app-theme-overrides';

/**
 * 进程内缓存标记：
 * 主题覆盖样式只需要注入一次；后续亮/暗模式或预设切换通过 :root CSS 变量级联生效，
 * 不需要反复创建 <style> 标签，避免重复样式节点干扰排查。
 */
let injected = false;

/**
 * 注入仍需要 CSS 变量兜底的第三方组件样式。
 *
 * Ant Design Vue v4 已由根级 ConfigProvider theme token 接管，不再走这里的 selector bridge。
 * 当前保留的注入内容只有 VXE Table / vxe-pc-ui 的少量 CSS 变量覆盖。
 */
export function injectThemeOverrideStyles(): void {
  if (typeof document === 'undefined') return;

  if (injected || document.getElementById(THEME_STYLE_ID)) {
    injected = true;
    return;
  }

  const style = document.createElement('style');
  style.id = THEME_STYLE_ID;
  style.textContent = VXE_THEME_CSS;
  document.head.appendChild(style);

  injected = true;
}
