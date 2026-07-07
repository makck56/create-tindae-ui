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
}

export interface ThemeState {
  readonly mode: ThemeMode;
  readonly presetKey: string;
}
