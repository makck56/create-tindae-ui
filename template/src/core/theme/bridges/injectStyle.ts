import { ANTD_THEME_CSS } from './antd';
import { VXE_THEME_CSS } from './vxeTable';

/** 注入到 <head> 的主题覆盖样式 <style> 标签 id（幂等去重用） */
const THEME_STYLE_ID = 'app-theme-overrides';

/**
 * 进程内缓存标志：标记本次会话已注入过覆盖样式。
 * 即便 DOM 上的 <style> 被意外移除，也只允许注入一次（主题全程靠 CSS 变量驱动，无需重复注入）。
 */
let injected = false;

/**
 * 注入 antd + vxe-table 主题覆盖样式到 <head>。
 *
 * 幂等：多次调用只会真正注入一次（首次后直接返回）。
 * 这段 CSS 全部以 var(--color-*) 等变量引用，主题变化时由 :root 变量刷新自动联动，
 * 因此无需在主题切换时重新注入。
 */
export function injectThemeOverrideStyles(): void {
  if (typeof document === 'undefined') return;
  // 已注入（内存标志）或 DOM 已存在同 id 节点 → 跳过
  if (injected || document.getElementById(THEME_STYLE_ID)) {
    injected = true;
    return;
  }

  const style = document.createElement('style');
  style.id = THEME_STYLE_ID;
  // 拼接 antd + vxe 两段覆盖样式，集中在一个 <style> 减少 DOM 节点
  style.textContent = `${ANTD_THEME_CSS}\n${VXE_THEME_CSS}`;
  document.head.appendChild(style);

  injected = true;
}
