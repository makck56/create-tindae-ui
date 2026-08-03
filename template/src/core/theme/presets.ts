import type { ColorScale, ThemePreset, ThemeTokens } from './types';

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

function overrideNestedPart<T extends Record<string, object>>(
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
      next[key] = { ...basePart[key], ...partial };
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
  };
}
