import { beforeEach, describe, expect, it } from 'vitest';
import { darkTokens, lightTokens } from '../tokens';
import { applyTokensToRoot, buildCssVarMap } from './cssVariables';

describe('buildCssVarMap', () => {
  it('maps the primary color scale', () => {
    const map = buildCssVarMap(lightTokens);
    expect(map['--color-primary']).toBe(lightTokens.colors.primary.DEFAULT);
    expect(map['--color-primary-hover']).toBe(lightTokens.colors.primary.hover);
    expect(map['--color-primary-active']).toBe(lightTokens.colors.primary.active);
    expect(map['--color-primary-disabled']).toBe(lightTokens.colors.primary.disabled);
  });

  it('maps all semantic color scales', () => {
    const map = buildCssVarMap(lightTokens);
    for (const key of ['primary', 'success', 'warning', 'danger', 'info']) {
      expect(map[`--color-${key}`]).toBeDefined();
      expect(map[`--color-${key}-hover`]).toBeDefined();
      expect(map[`--color-${key}-active`]).toBeDefined();
      expect(map[`--color-${key}-disabled`]).toBeDefined();
    }
  });

  it('maps neutral, typography, spacing, radius, and layout tokens', () => {
    const map = buildCssVarMap(lightTokens);
    expect(map['--text-title']).toBe(lightTokens.text.title);
    expect(map['--bg-page']).toBe(lightTokens.bg.page);
    expect(map['--border-base']).toBe(lightTokens.border.base);
    expect(map['--font-size-body-lg']).toBe(lightTokens.typography.bodyLg.fontSize);
    expect(map['--space-unit']).toBe(lightTokens.spacing.unit);
    expect(map['--radius-md']).toBe(lightTokens.radius.md);
    expect(map['--sidebar-width']).toBe(lightTokens.layout.sidebarWidth);
    expect(map['--header-height']).toBe(lightTokens.layout.headerHeight);
  });

  it('自动展开 custom 扩展 Token 为 --custom-* CSS 变量', () => {
    const map = buildCssVarMap({
      ...lightTokens,
      custom: {
        chart: {
          referenceLine: '#ccd6e0',
          axisLabel: 'rgba(0, 0, 0, 0.65)',
        },
        workflowState: {
          pendingBg: '#fff7e6',
          stepGap: 12,
        },
      },
    });

    expect(map['--custom-chart-reference-line']).toBe('#ccd6e0');
    expect(map['--custom-chart-axis-label']).toBe('rgba(0, 0, 0, 0.65)');
    expect(map['--custom-workflow-state-pending-bg']).toBe('#fff7e6');
    expect(map['--custom-workflow-state-step-gap']).toBe('12');
  });
});

describe('applyTokensToRoot', () => {
  beforeEach(() => {
    document.documentElement.style.cssText = '';
    delete document.documentElement.dataset.theme;
  });

  it('writes CSS variables and sets data-theme', () => {
    applyTokensToRoot(darkTokens, 'dark');
    const root = document.documentElement;

    expect(root.style.getPropertyValue('--color-primary')).toBe(darkTokens.colors.primary.DEFAULT);
    expect(root.style.getPropertyValue('--bg-page')).toBe(darkTokens.bg.page);
    expect(root.style.getPropertyValue('--font-size-body-lg')).toBe(
      darkTokens.typography.bodyLg.fontSize,
    );
    expect(root.style.getPropertyValue('--space-unit')).toBe(darkTokens.spacing.unit);
    expect(root.dataset.theme).toBe('dark');
  });

  it('overwrites previous values on repeated apply', () => {
    applyTokensToRoot(lightTokens, 'light');
    applyTokensToRoot(darkTokens, 'dark');
    const root = document.documentElement;

    expect(root.style.getPropertyValue('--color-primary')).toBe(darkTokens.colors.primary.DEFAULT);
    expect(root.style.getPropertyValue('--space-unit')).toBe(darkTokens.spacing.unit);
    expect(root.dataset.theme).toBe('dark');
  });
});
