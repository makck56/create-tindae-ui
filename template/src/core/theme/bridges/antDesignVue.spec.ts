import { describe, expect, it } from 'vitest';
import { darkTokens, lightTokens } from '../tokens';
import { buildAntDesignVueTheme } from './antDesignVue';

describe('buildAntDesignVueTheme', () => {
  it('maps project semantic colors into Ant Design Vue global tokens', () => {
    const theme = buildAntDesignVueTheme(lightTokens, 'light');

    expect(theme.token?.colorPrimary).toBe(lightTokens.colors.primary.DEFAULT);
    expect(theme.token?.colorPrimaryHover).toBe(lightTokens.colors.primary.hover);
    expect(theme.token?.colorPrimaryActive).toBe(lightTokens.colors.primary.active);
    expect(theme.token?.colorSuccess).toBe(lightTokens.colors.success.DEFAULT);
    expect(theme.token?.colorWarning).toBe(lightTokens.colors.warning.DEFAULT);
    expect(theme.token?.colorError).toBe(lightTokens.colors.danger.DEFAULT);
    expect(theme.token?.colorInfo).toBe(lightTokens.colors.info.DEFAULT);
  });

  it('maps neutral text, border, background, radius, and typography tokens', () => {
    const theme = buildAntDesignVueTheme(lightTokens, 'light');

    expect(theme.token?.colorText).toBe(lightTokens.text.body);
    expect(theme.token?.colorTextHeading).toBe(lightTokens.text.title);
    expect(theme.token?.colorTextSecondary).toBe(lightTokens.text.secondary);
    expect(theme.token?.colorBorder).toBe(lightTokens.border.base);
    expect(theme.token?.colorBgContainer).toBe(lightTokens.bg.container);
    expect(theme.token?.colorBgElevated).toBe(lightTokens.bg.elevated);
    expect(theme.token?.borderRadius).toBe(6);
    expect(theme.token?.fontFamily).toBe(lightTokens.typography.bodyMd.fontFamily);
  });

  it('uses different algorithms for light and dark modes while keeping project token values', () => {
    const lightTheme = buildAntDesignVueTheme(lightTokens, 'light');
    const darkTheme = buildAntDesignVueTheme(darkTokens, 'dark');

    expect(lightTheme.algorithm).not.toBe(darkTheme.algorithm);
    expect(darkTheme.token?.colorPrimary).toBe(darkTokens.colors.primary.DEFAULT);
    expect(darkTheme.token?.colorBgContainer).toBe(darkTokens.bg.container);
  });
});
