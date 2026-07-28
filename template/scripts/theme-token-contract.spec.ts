import { describe, expect, it } from 'vitest';

import {
  assertThemeCssMatchesRawTokens,
  buildProjectTailwindThemeCss,
} from './theme-token-contract.mjs';

const rawTokens = {
  theme: {
    extend: {
      colors: {
        primary: '#1890ff',
        'primary-hover': '#40a9ff',
        'primary-active': '#096dd9',
        'on-primary': '#ffffff',
        title: '#262626',
        body: '#404040',
        container: '#ffffff',
        page: '#f0f2f5',
      },
      fontFamily: {
        'heading-xl': ['Inter'],
        'heading-lg': ['Inter'],
        'heading-md': ['Inter'],
        'body-lg': ['Inter'],
        'body-md': ['Inter'],
        'body-sm': ['Inter'],
        label: ['Inter'],
      },
      fontSize: {
        'heading-xl': ['28px', { lineHeight: '36px', fontWeight: '600' }],
        'heading-lg': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'heading-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '22px', fontWeight: '400' }],
        label: ['12px', { lineHeight: '20px', fontWeight: '500' }],
      },
      borderRadius: {
        sm: '2px',
        md: '4px',
        lg: '6px',
        xl: '8px',
        '2xl': '12px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
      },
    },
  },
};

describe('Tailwind v4 token contract', () => {
  it('buildProjectTailwindThemeCss 输出确定的 @theme inline 映射', () => {
    const css = buildProjectTailwindThemeCss(rawTokens);

    // 这些断言锁定 v3 colors/textColor/backgroundColor/borderColor 到 v4 --color-* 的合并规则。
    expect(css).toContain('@theme inline {');
    expect(css).toContain('  --color-primary: var(--color-primary);');
    expect(css).toContain('  --color-title: var(--text-title);');
    expect(css).toContain('  --color-page: var(--bg-page);');
    expect(css).toContain('  --color-base: var(--border-base);');

    // spacing/font/radius 仍指向运行时变量，避免 Tailwind CSS 产物复制一份不可换肤的字面量。
    expect(css).toContain('  --spacing-4: calc(var(--space-unit) * 4);');
    expect(css).toContain('  --font-sans: var(--font-family-body-lg);');
    expect(css).toContain('  --text-base: var(--font-size-body-lg);');
    expect(css).toContain('  --text-base--line-height: var(--line-height-body-lg);');
    expect(css).toContain('  --radius-xs: var(--radius-sm);');
    expect(css).not.toContain('#1890ff');
  });

  it('assertThemeCssMatchesRawTokens 在 CSS 产物漂移时抛错', () => {
    const css = buildProjectTailwindThemeCss(rawTokens);

    expect(() => assertThemeCssMatchesRawTokens(rawTokens, css)).not.toThrow();
    expect(() => assertThemeCssMatchesRawTokens(rawTokens, css.replace('--color-primary', '--color-brand'))).toThrow(
      /theme\.tailwind\.css/,
    );
  });
});
