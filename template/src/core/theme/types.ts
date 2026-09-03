/**
 * Theme token contracts shared by runtime theme bridges.
 */

export interface ColorScale {
  readonly DEFAULT: string;
  readonly hover: string;
  readonly active: string;
  readonly disabled: string;
}

export interface TextTokens {
  readonly title: string;
  readonly body: string;
  readonly secondary: string;
  readonly disabled: string;
  readonly inverse: string;
}

export interface BgTokens {
  readonly page: string;
  readonly container: string;
  readonly elevated: string;
  readonly white: string;
  readonly subtle: string;
}

export interface BorderTokens {
  readonly base: string;
  readonly light: string;
  readonly lighter: string;
  readonly extraLight: string;
}

export interface TypographyStyle {
  readonly fontFamily: string;
  readonly fontSize: string;
  readonly fontWeight: string;
  readonly lineHeight: string;
}

export interface TypographyTokens {
  readonly headingXl: TypographyStyle;
  readonly headingLg: TypographyStyle;
  readonly headingMd: TypographyStyle;
  readonly bodyLg: TypographyStyle;
  readonly bodyMd: TypographyStyle;
  readonly bodySm: TypographyStyle;
  readonly label: TypographyStyle;
}

export interface SpacingTokens {
  readonly unit: string;
  readonly xs: string;
  readonly sm: string;
  readonly md: string;
  readonly lg: string;
  readonly xl: string;
  readonly '2xl': string;
}

export interface RadiusTokens {
  readonly sm: string;
  readonly base: string;
  readonly md: string;
  readonly lg: string;
  readonly xl: string;
}

export interface LayoutTokens {
  readonly sidebarWidth: string;
  readonly sidebarCollapsedWidth: string;
  readonly headerHeight: string;
}

/**
 * 自定义主题 Token 的叶子值。
 * 仅允许 CSS 可消费的原始值，避免把函数、对象实例等不可序列化数据写入 CSS 变量。
 */
export type CustomThemeTokenValue = string | number;

/**
 * 自定义主题 Token 扩展树。
 *
 * 设计意图：业务可以按域组织任意层级的扩展 Token，例如：
 * custom.chart.referenceLine -> --custom-chart-reference-line。
 */
export interface CustomThemeTokens {
  readonly [key: string]: CustomThemeTokenValue | CustomThemeTokens;
}

/** 自定义主题 Token 的递归部分覆盖类型，用于主题预设按需覆盖扩展字段。 */
export type CustomThemeTokenOverrides = {
  readonly [key: string]: CustomThemeTokenValue | CustomThemeTokenOverrides;
};

export interface ThemeTokens {
  readonly colors: {
    readonly primary: ColorScale;
    readonly success: ColorScale;
    readonly warning: ColorScale;
    readonly danger: ColorScale;
    readonly info: ColorScale;
  };
  readonly text: TextTokens;
  readonly bg: BgTokens;
  readonly border: BorderTokens;
  readonly typography: TypographyTokens;
  readonly spacing: SpacingTokens;
  readonly radius: RadiusTokens;
  readonly layout: LayoutTokens;
  readonly custom?: CustomThemeTokens;
}

export type ThemeMode = 'light' | 'dark';

export interface ThemePreset {
  readonly key: string;
  readonly label: string;
  readonly primary: ColorScale;
  readonly success?: ColorScale;
  readonly warning?: ColorScale;
  readonly danger?: ColorScale;
  readonly info?: ColorScale;
  readonly text?: Partial<TextTokens>;
  readonly bg?: Partial<BgTokens>;
  readonly border?: Partial<BorderTokens>;
  readonly typography?: Partial<{
    [K in keyof TypographyTokens]: Partial<TypographyTokens[K]>;
  }>;
  readonly spacing?: Partial<SpacingTokens>;
  readonly radius?: Partial<RadiusTokens>;
  readonly layout?: Partial<LayoutTokens>;
  readonly custom?: CustomThemeTokenOverrides;
}

export interface ThemeState {
  readonly mode: ThemeMode;
  readonly presetKey: string;
}
