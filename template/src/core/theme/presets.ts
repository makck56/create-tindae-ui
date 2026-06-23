import type { ColorScale, ThemePreset, ThemeTokens } from './types';

/**
 * 品牌主色预设集合。
 *
 * 每个预设至少定义 primary（主色色阶），可选覆盖 success/warning/danger/info（见 ThemePreset）。
 * 新增预设：在数组追加一项即可，ThemeSwitcher / 预览页会自动渲染。
 */
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
];

/** 默认预设 key（与亮色 Token 的 primary 一致） */
export const DEFAULT_PRESET_KEY = 'blue';

/**
 * 按 key 查找预设。
 * @param key 预设唯一标识
 * @returns 命中的预设；未命中返回 undefined（调用方应回退到默认）
 */
export function findPreset(key: string): ThemePreset | undefined {
  return THEME_PRESETS.find((p) => p.key === key);
}

/** 预设「可选覆盖」的色阶键（primary 必填，不在此列） */
const OPTIONAL_COLOR_KEYS = ['success', 'warning', 'danger', 'info'] as const;

/**
 * 把预设合并进基础 Token，生成最终生效的 ThemeTokens（纯函数，不可变）。
 *
 * 合并规则（两档语义，对应 ThemePreset 的三档覆盖能力）：
 * - 语义色（colors）：**整阶替换**。`primary` 必覆盖；`success` / `warning` / `danger` / `info`
 *   仅在预设提供时覆盖对应色阶（整组 4 个交互态一起换），否则保留 `base`；
 * - 全套维度（text / bg / border / radius / layout）：**字段级浅合并**。
 *   预设提供哪个字段就覆盖哪个，未提供的字段保留 `base`；整个维度未提供时原样保留 `base` 引用。
 *
 * 设计要点：
 * - 不修改 `base`，返回新对象（immutability）；
 * - 产出仍是完整 `ThemeTokens`，下游四端桥接（cssVariables → :root → Tailwind/antd/vxe + echarts）
 *   无需任何改动，自动消费覆盖后的值——这就是「全套覆盖」能力几乎零成本的根源（SSOT 红利）；
 * - store 的 `currentTokens` 与 `setupTheme` 的首屏预应用都复用本函数，
 *   保证「运行时」与「mount 前」合并逻辑完全一致。
 *
 * @param base   当前模式的基础 Token（亮 / 暗）
 * @param preset 当前预设（undefined → 原样返回 base）
 */
export function applyPreset(base: ThemeTokens, preset: ThemePreset | undefined): ThemeTokens {
  if (!preset) return base;

  // 1) 语义色：整阶替换——primary 必覆盖，功能色按需覆盖
  //    （语义：要么整组 4 个交互态，要么不动，避免半套色阶造成状态断层）
  const colorOverrides: Partial<
    Record<(typeof OPTIONAL_COLOR_KEYS)[number] | 'primary', ColorScale>
  > = {
    primary: preset.primary,
  };
  for (const k of OPTIONAL_COLOR_KEYS) {
    const scale = preset[k];
    if (scale) colorOverrides[k] = scale;
  }

  // 2) 全套维度：字段级浅合并——提供哪个字段覆盖哪个，未提供整个维度时保留 base 引用
  //    例如 preset.text = { title: '#xxx' } 只改 title，body / secondary / ... 维持 base
  const overridePart = <T extends object>(basePart: T, override?: Partial<T>): T =>
    override ? { ...basePart, ...override } : basePart;

  return {
    ...base,
    colors: { ...base.colors, ...colorOverrides },
    text: overridePart(base.text, preset.text),
    bg: overridePart(base.bg, preset.bg),
    border: overridePart(base.border, preset.border),
    radius: overridePart(base.radius, preset.radius),
    layout: overridePart(base.layout, preset.layout),
  };
}
