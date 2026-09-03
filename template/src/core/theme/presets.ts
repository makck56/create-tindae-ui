import type { ColorScale, CustomThemeTokens, ThemePreset, ThemeTokens } from './types';

export const THEME_PRESETS: readonly ThemePreset[] = [
  {
    key: 'blue',
    label: '拂晓蓝',
    primary: { DEFAULT: '#1890ff', hover: '#40a9ff', active: '#096dd9', disabled: '#91d5ff' },
  },
  {
    key: 'green',
    label: '极光绿',
    primary: { DEFAULT: '#00a870', hover: '#1ec488', active: '#008a5c', disabled: '#7ee2b8' },
  },
  {
    key: 'purple',
    label: '酱紫',
    primary: { DEFAULT: '#722ed1', hover: '#9254de', active: '#531dab', disabled: '#d3adf7' },
  },
  {
    key: 'orange',
    label: '日暮',
    primary: { DEFAULT: '#fa8c16', hover: '#ffa940', active: '#d46b08', disabled: '#ffd591' },
  },
  {
    key: 'red',
    label: '炽热红',
    primary: { DEFAULT: '#f5222d', hover: '#ff4d4f', active: '#cf1322', disabled: '#ffa39e' },
  },
] as const;

export const DEFAULT_PRESET_KEY = 'blue';

export function findPreset(key: string): ThemePreset | undefined {
  return THEME_PRESETS.find((preset) => preset.key === key);
}

const OPTIONAL_COLOR_KEYS = ['success', 'warning', 'danger', 'info'] as const;

function overridePart<T extends object>(basePart: T, override?: Partial<T>): T {
  return override ? { ...basePart, ...override } : basePart;
}


function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * 递归合并自定义 Token。
 *
 * 自定义 Token 通常按业务域分组；使用深合并可以只覆盖某个叶子字段，
 * 同时保留同组内未覆盖的其他字段，避免浅合并造成整组丢失。
 */
function mergeCustomTokens(
  base?: CustomThemeTokens,
  override?: ThemePreset['custom'],
): CustomThemeTokens | undefined {
  if (!override) {
    return base;
  }

  const next: Record<string, CustomThemeTokens[string]> = { ...(base ?? {}) };
  for (const [key, value] of Object.entries(override)) {
    const baseValue = base?.[key];
    if (isPlainRecord(baseValue) && isPlainRecord(value)) {
      next[key] = mergeCustomTokens(baseValue as CustomThemeTokens, value as ThemePreset['custom'])!;
    } else {
      next[key] = value as CustomThemeTokens[string];
    }
  }

  return next;
}
function overrideNestedPart<T extends Record<string, unknown>>(
  basePart: T,
  override?: Partial<{ [K in keyof T]: Partial<T[K]> }>,
): T {
  if (!override) {
    return basePart;
  }

  const next = { ...basePart } as T;
  for (const key of Object.keys(override) as (keyof T)[]) {
    const partial = override[key];
    if (partial) {
      // 每一项都是嵌套结构（如 TypographyStyle），这里做一层浅合并即可
      next[key] = { ...(basePart[key] as object), ...(partial as object) } as T[keyof T];
    }
  }

  return next;
}

export function applyPreset(base: ThemeTokens, preset: ThemePreset | undefined): ThemeTokens {
  if (!preset) {
    return base;
  }

  const colorOverrides: Partial<
    Record<(typeof OPTIONAL_COLOR_KEYS)[number] | 'primary', ColorScale>
  > = {
    primary: preset.primary,
  };

  for (const key of OPTIONAL_COLOR_KEYS) {
    const scale = preset[key];
    if (scale) {
      colorOverrides[key] = scale;
    }
  }

  return {
    ...base,
    colors: { ...base.colors, ...colorOverrides },
    text: overridePart(base.text, preset.text),
    bg: overridePart(base.bg, preset.bg),
    border: overridePart(base.border, preset.border),
    typography: overrideNestedPart(base.typography, preset.typography),
    spacing: overridePart(base.spacing, preset.spacing),
    radius: overridePart(base.radius, preset.radius),
    layout: overridePart(base.layout, preset.layout),
    custom: mergeCustomTokens(base.custom, preset.custom),
  };
}
