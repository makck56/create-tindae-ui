import { theme as antTheme } from 'ant-design-vue';
import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context';
import type { ThemeMode, ThemeTokens } from '../types';

function toPixelNumber(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * 将项目 ThemeTokens 映射为 Ant Design Vue v4 ConfigProvider theme。
 *
 * 映射原则：
 * - 项目 token 仍是主题系统唯一来源，Tailwind / VXE / ECharts 继续消费 CSS 变量；
 * - Ant v4 通过 ConfigProvider 直接消费运行时 token，避免继续维护大量 v3 selector 覆盖；
 * - 只映射全局语义 token，不在这里耦合具体页面或业务组件样式。
 */
export function buildAntDesignVueTheme(tokens: ThemeTokens, mode: ThemeMode): ThemeConfig {
  return {
    algorithm: mode === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    token: {
      colorPrimary: tokens.colors.primary.DEFAULT,
      colorPrimaryHover: tokens.colors.primary.hover,
      colorPrimaryActive: tokens.colors.primary.active,
      colorSuccess: tokens.colors.success.DEFAULT,
      colorWarning: tokens.colors.warning.DEFAULT,
      colorError: tokens.colors.danger.DEFAULT,
      colorInfo: tokens.colors.info.DEFAULT,
      colorText: tokens.text.body,
      colorTextHeading: tokens.text.title,
      colorTextSecondary: tokens.text.secondary,
      colorTextDisabled: tokens.text.disabled,
      colorTextLightSolid: tokens.text.inverse,
      colorBorder: tokens.border.base,
      colorBorderSecondary: tokens.border.lighter,
      colorBgBase: tokens.bg.page,
      colorBgContainer: tokens.bg.container,
      colorBgElevated: tokens.bg.elevated,
      colorBgLayout: tokens.bg.page,
      colorFillSecondary: tokens.bg.subtle,
      borderRadius: toPixelNumber(tokens.radius.md),
      borderRadiusSM: toPixelNumber(tokens.radius.sm),
      borderRadiusLG: toPixelNumber(tokens.radius.lg),
      fontFamily: tokens.typography.bodyMd.fontFamily,
      fontSize: toPixelNumber(tokens.typography.bodyMd.fontSize),
      fontSizeSM: toPixelNumber(tokens.typography.bodySm.fontSize),
      fontSizeLG: toPixelNumber(tokens.typography.bodyLg.fontSize),
    },
    components: {
      Layout: {
        bodyBg: tokens.bg.page,
        headerBg: tokens.bg.container,
        siderBg: tokens.bg.container,
      },
      Menu: {
        itemSelectedColor: tokens.colors.primary.DEFAULT,
        itemSelectedBg: tokens.bg.subtle,
      },
      Button: {
        primaryShadow: 'none',
      },
    },
  };
}
