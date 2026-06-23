import { describe, it, expect, beforeEach } from 'vitest';
import { buildCssVarMap, applyTokensToRoot } from './cssVariables';
import { lightTokens, darkTokens } from '../tokens';

describe('buildCssVarMap', () => {
  it('映射品牌主色四态（DEFAULT/hover/active/disabled）', () => {
    const map = buildCssVarMap(lightTokens);
    expect(map['--color-primary']).toBe(lightTokens.colors.primary.DEFAULT);
    expect(map['--color-primary-hover']).toBe(lightTokens.colors.primary.hover);
    expect(map['--color-primary-active']).toBe(lightTokens.colors.primary.active);
    expect(map['--color-primary-disabled']).toBe(lightTokens.colors.primary.disabled);
  });

  it('映射全部五个语义色阶', () => {
    const map = buildCssVarMap(lightTokens);
    for (const c of ['primary', 'success', 'warning', 'danger', 'info']) {
      expect(map[`--color-${c}`]).toBeDefined();
      expect(map[`--color-${c}-hover`]).toBeDefined();
      expect(map[`--color-${c}-active`]).toBeDefined();
      expect(map[`--color-${c}-disabled`]).toBeDefined();
    }
  });

  it('映射文本 / 背景 / 边框 / 圆角 / 布局 token', () => {
    const map = buildCssVarMap(lightTokens);
    expect(map['--text-title']).toBe(lightTokens.text.title);
    expect(map['--bg-page']).toBe(lightTokens.bg.page);
    expect(map['--border-base']).toBe(lightTokens.border.base);
    expect(map['--radius-md']).toBe(lightTokens.radius.md);
    expect(map['--sidebar-width']).toBe(lightTokens.layout.sidebarWidth);
    expect(map['--header-height']).toBe(lightTokens.layout.headerHeight);
  });
});

describe('applyTokensToRoot', () => {
  beforeEach(() => {
    // 清空上一次测试残留的 inline style 与 data-theme
    document.documentElement.style.cssText = '';
    delete document.documentElement.dataset.theme;
  });

  it('把 CSS 变量写入 documentElement 并设置 data-theme', () => {
    applyTokensToRoot(darkTokens, 'dark');
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--color-primary')).toBe(darkTokens.colors.primary.DEFAULT);
    expect(root.style.getPropertyValue('--bg-page')).toBe(darkTokens.bg.page);
    expect(root.dataset.theme).toBe('dark');
  });

  it('重复应用会覆盖旧值（整份覆盖策略）', () => {
    applyTokensToRoot(lightTokens, 'light');
    applyTokensToRoot(darkTokens, 'dark');
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--color-primary')).toBe(darkTokens.colors.primary.DEFAULT);
    expect(root.dataset.theme).toBe('dark');
  });
});
