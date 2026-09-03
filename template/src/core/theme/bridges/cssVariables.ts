import type { CustomThemeTokenValue, CustomThemeTokens, ThemeMode, ThemeTokens } from '../types';


function toKebabCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function isTokenGroup(value: CustomThemeTokenValue | CustomThemeTokens): value is CustomThemeTokens {
  return typeof value === 'object' && value !== null;
}

/**
 * 把自定义 Token 树展开成 CSS 变量。
 *
 * 变量统一使用 --custom-* 前缀，避免与核心 Token 或第三方库变量冲突；
 * 嵌套路径会被拼接并转成 kebab-case，例如 chart.referenceLine -> --custom-chart-reference-line。
 */
function appendCustomCssVars(
  target: Record<string, string>,
  tokens: CustomThemeTokens | undefined,
  path: readonly string[] = [],
): void {
  if (!tokens) {
    return;
  }

  for (const [key, value] of Object.entries(tokens)) {
    const nextPath = [...path, toKebabCase(key)].filter(Boolean);
    if (nextPath.length === 0) {
      continue;
    }

    if (isTokenGroup(value)) {
      appendCustomCssVars(target, value, nextPath);
    } else {
      target[`--custom-${nextPath.join('-')}`] = String(value);
    }
  }
}
export function buildCssVarMap(tokens: ThemeTokens): Record<string, string> {
  const map: Record<string, string> = {
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
    '--text-title': tokens.text.title,
    '--text-body': tokens.text.body,
    '--text-secondary': tokens.text.secondary,
    '--text-disabled': tokens.text.disabled,
    '--text-inverse': tokens.text.inverse,
    '--bg-page': tokens.bg.page,
    '--bg-container': tokens.bg.container,
    '--bg-elevated': tokens.bg.elevated,
    '--bg-white': tokens.bg.white,
    '--bg-subtle': tokens.bg.subtle,
    '--border-base': tokens.border.base,
    '--border-light': tokens.border.light,
    '--border-lighter': tokens.border.lighter,
    '--border-extra-light': tokens.border.extraLight,
    '--font-family-heading-xl': tokens.typography.headingXl.fontFamily,
    '--font-size-heading-xl': tokens.typography.headingXl.fontSize,
    '--font-weight-heading-xl': tokens.typography.headingXl.fontWeight,
    '--line-height-heading-xl': tokens.typography.headingXl.lineHeight,
    '--font-family-heading-lg': tokens.typography.headingLg.fontFamily,
    '--font-size-heading-lg': tokens.typography.headingLg.fontSize,
    '--font-weight-heading-lg': tokens.typography.headingLg.fontWeight,
    '--line-height-heading-lg': tokens.typography.headingLg.lineHeight,
    '--font-family-heading-md': tokens.typography.headingMd.fontFamily,
    '--font-size-heading-md': tokens.typography.headingMd.fontSize,
    '--font-weight-heading-md': tokens.typography.headingMd.fontWeight,
    '--line-height-heading-md': tokens.typography.headingMd.lineHeight,
    '--font-family-body-lg': tokens.typography.bodyLg.fontFamily,
    '--font-size-body-lg': tokens.typography.bodyLg.fontSize,
    '--font-weight-body-lg': tokens.typography.bodyLg.fontWeight,
    '--line-height-body-lg': tokens.typography.bodyLg.lineHeight,
    '--font-family-body-md': tokens.typography.bodyMd.fontFamily,
    '--font-size-body-md': tokens.typography.bodyMd.fontSize,
    '--font-weight-body-md': tokens.typography.bodyMd.fontWeight,
    '--line-height-body-md': tokens.typography.bodyMd.lineHeight,
    '--font-family-body-sm': tokens.typography.bodySm.fontFamily,
    '--font-size-body-sm': tokens.typography.bodySm.fontSize,
    '--font-weight-body-sm': tokens.typography.bodySm.fontWeight,
    '--line-height-body-sm': tokens.typography.bodySm.lineHeight,
    '--font-family-label': tokens.typography.label.fontFamily,
    '--font-size-label': tokens.typography.label.fontSize,
    '--font-weight-label': tokens.typography.label.fontWeight,
    '--line-height-label': tokens.typography.label.lineHeight,
    '--space-unit': tokens.spacing.unit,
    '--space-xs': tokens.spacing.xs,
    '--space-sm': tokens.spacing.sm,
    '--space-md': tokens.spacing.md,
    '--space-lg': tokens.spacing.lg,
    '--space-xl': tokens.spacing.xl,
    '--space-2xl': tokens.spacing['2xl'],
    '--radius-sm': tokens.radius.sm,
    '--radius-base': tokens.radius.base,
    '--radius-md': tokens.radius.md,
    '--radius-lg': tokens.radius.lg,
    '--radius-xl': tokens.radius.xl,
    '--sidebar-width': tokens.layout.sidebarWidth,
    '--sidebar-collapsed-width': tokens.layout.sidebarCollapsedWidth,
    '--header-height': tokens.layout.headerHeight,
  };

  appendCustomCssVars(map, tokens.custom);
  return map;
}

export function applyTokensToRoot(tokens: ThemeTokens, mode: ThemeMode): void {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  const map = buildCssVarMap(tokens);

  for (const [key, value] of Object.entries(map)) {
    root.style.setProperty(key, value);
  }

  root.dataset.theme = mode;
}
