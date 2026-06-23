import type { ThemeTokens, ThemeMode } from '../types';

/**
 * CSS 变量桥接层 —— 整套主题系统的「产物分发枢纽」。
 *
 * 职责：把 TS Token 翻译成 CSS 自定义属性（CSS Custom Properties），写入 :root。
 * 三端消费方式：
 * - Tailwind：tailwind.config.js 里 colors/textColor/backgroundColor/borderColor 均以 var() 引用这些变量；
 * - Ant Design Vue v3：bridges/antd.ts 注入的覆盖样式同样以 var() 引用；
 * - VXE Table：bridges/vxeTable.ts 覆盖样式同理。
 *
 * 因此「主题变化」只需重新写入一次 :root 变量，三端自动联动——这是 SSOT 的核心收益。
 *
 * 命名严格对齐 tailwind.config.js 的引用，新增 Token 时务必同步：
 *   1) types.ts 加字段；2) tokens.ts 亮/暗各加值；3) 本文件 buildCssVarMap 加映射；4) tailwind.config.js 按需加工具类。
 */

/**
 * Token → CSS 变量名扁平映射表（纯函数，无副作用）。
 * 仅做「数据翻译」，不触碰 DOM，便于单测。
 *
 * @param tokens 当前生效的完整 Token
 * @returns 形如 { '--color-primary': '#1890ff', ... } 的字典
 */
export function buildCssVarMap(tokens: ThemeTokens): Record<string, string> {
  return {
    // —— 品牌色 + 功能色（每个色阶四态）——
    '--color-primary': tokens.colors.primary.DEFAULT,
    '--color-primary-hover': tokens.colors.primary.hover,
    '--color-primary-active': tokens.colors.primary.active,
    '--color-primary-disabled': tokens.colors.primary.disabled,

    '--color-success': tokens.colors.success.DEFAULT,
    '--color-success-hover': tokens.colors.success.hover,
    '--color-success-active': tokens.colors.success.active,
    '--color-success-disabled': tokens.colors.success.disabled,

    '--color-warning': tokens.colors.warning.DEFAULT,
    '--color-warning-hover': tokens.colors.warning.hover,
    '--color-warning-active': tokens.colors.warning.active,
    '--color-warning-disabled': tokens.colors.warning.disabled,

    '--color-danger': tokens.colors.danger.DEFAULT,
    '--color-danger-hover': tokens.colors.danger.hover,
    '--color-danger-active': tokens.colors.danger.active,
    '--color-danger-disabled': tokens.colors.danger.disabled,

    '--color-info': tokens.colors.info.DEFAULT,
    '--color-info-hover': tokens.colors.info.hover,
    '--color-info-active': tokens.colors.info.active,
    '--color-info-disabled': tokens.colors.info.disabled,

    // —— 文本色阶 ——
    '--text-title': tokens.text.title,
    '--text-body': tokens.text.body,
    '--text-secondary': tokens.text.secondary,
    '--text-disabled': tokens.text.disabled,
    '--text-inverse': tokens.text.inverse,

    // —— 背景色阶 ——
    '--bg-page': tokens.bg.page,
    '--bg-container': tokens.bg.container,
    '--bg-elevated': tokens.bg.elevated,
    '--bg-white': tokens.bg.white,
    '--bg-subtle': tokens.bg.subtle,

    // —— 边框色阶 ——
    '--border-base': tokens.border.base,
    '--border-light': tokens.border.light,
    '--border-lighter': tokens.border.lighter,
    '--border-extra-light': tokens.border.extraLight,

    // —— 圆角 ——
    '--radius-sm': tokens.radius.sm,
    '--radius-base': tokens.radius.base,
    '--radius-md': tokens.radius.md,
    '--radius-lg': tokens.radius.lg,
    '--radius-xl': tokens.radius.xl,

    // —— 布局尺寸 ——
    '--sidebar-width': tokens.layout.sidebarWidth,
    '--sidebar-collapsed-width': tokens.layout.sidebarCollapsedWidth,
    '--header-height': tokens.layout.headerHeight,
  };
}

/**
 * 将 Token 应用到 :root（document.documentElement 的 inline style）。
 *
 * 采用「整份覆盖」策略：每次主题 / 预设变化都重新写入全部变量到同一处 inline style。
 * 这样所有变量集中在一处，无需关心选择器优先级；同时通过 data-theme 属性暴露模式钩子，
 * 业务自定义组件可在 CSS 中用 `[data-theme="dark"] .my-widget { ... }` 做特殊适配。
 *
 * @param tokens 当前生效的完整 Token（已含预设覆盖）
 * @param mode   当前模式，用于 data-theme 属性
 */
export function applyTokensToRoot(tokens: ThemeTokens, mode: ThemeMode): void {
  // SSR 守卫：本模板为 CSR，但保留判断以防后续接入 SSR 时报错
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const map = buildCssVarMap(tokens);

  // 批量写入 CSSStyleDeclaration（setProperty 比直接改 style.cssText 更安全，避免转义问题）
  for (const [key, value] of Object.entries(map)) {
    root.style.setProperty(key, value);
  }

  // data-theme 属性：业务 CSS 钩子（亮=light / 暗=dark）
  root.dataset.theme = mode;
}
