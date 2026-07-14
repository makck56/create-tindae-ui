import { describe, it, expect } from 'vitest';
import { buildEChartsTheme } from './echarts';
import { lightTokens } from '../tokens';

describe('buildEChartsTheme', () => {
  const theme = buildEChartsTheme(lightTokens);

  it('调色板以主色 DEFAULT 打头，紧接主色 hover', () => {
    expect(Array.isArray(theme.color)).toBe(true);
    const palette = theme.color as string[];
    expect(palette[0]).toBe(lightTokens.colors.primary.DEFAULT);
    expect(palette[1]).toBe(lightTokens.colors.primary.hover);
  });

  it('调色板覆盖主色/info/success/warning/danger', () => {
    const palette = theme.color as string[];
    expect(palette).toContain(lightTokens.colors.success.DEFAULT);
    expect(palette).toContain(lightTokens.colors.warning.DEFAULT);
    expect(palette).toContain(lightTokens.colors.danger.DEFAULT);
  });

  it('画布背景使用容器色', () => {
    expect(theme.backgroundColor).toBe(lightTokens.bg.container);
  });

  it('正文文字使用 body 色，标题使用 title 色', () => {
    expect((theme.textStyle as { color: string }).color).toBe(lightTokens.text.body);
    expect((theme.title as { textStyle: { color: string } }).textStyle.color).toBe(
      lightTokens.text.title,
    );
  });

  it('坐标轴标签使用 secondary 色，分隔线使用 lighter 边框色', () => {
    const axis = theme.valueAxis as {
      axisLabel: { color: string };
      splitLine: { lineStyle: { color: string } };
    };
    expect(axis.axisLabel.color).toBe(lightTokens.text.secondary);
    expect(axis.splitLine.lineStyle.color).toBe(lightTokens.border.lighter);
  });
});
