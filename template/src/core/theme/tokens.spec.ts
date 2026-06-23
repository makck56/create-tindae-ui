import { describe, it, expect } from 'vitest';
import { lightTokens, darkTokens, getTokensByMode } from './tokens';

describe('getTokensByMode', () => {
  it('返回亮色 Token 引用', () => {
    expect(getTokensByMode('light')).toBe(lightTokens);
  });

  it('返回暗色 Token 引用', () => {
    expect(getTokensByMode('dark')).toBe(darkTokens);
  });

  it('亮/暗主色不同（确保暗色确实换色）', () => {
    expect(lightTokens.colors.primary.DEFAULT).not.toBe(darkTokens.colors.primary.DEFAULT);
  });

  it('两套 Token 的五个语义色阶均包含四态且为十六进制', () => {
    const scales = ['primary', 'success', 'warning', 'danger', 'info'] as const;
    const states = ['DEFAULT', 'hover', 'active', 'disabled'] as const;
    for (const tokens of [lightTokens, darkTokens]) {
      for (const scale of scales) {
        for (const state of states) {
          expect(tokens.colors[scale][state]).toMatch(/^#[0-9a-fA-F]{3,8}$/);
        }
      }
    }
  });

  it('两套 Token 均包含完整的中性色（文本/背景/边框/圆角/布局）', () => {
    for (const tokens of [lightTokens, darkTokens]) {
      expect(tokens.text.title).toBeTruthy();
      expect(tokens.bg.page).toBeTruthy();
      expect(tokens.border.base).toBeTruthy();
      expect(tokens.radius.md).toBeTruthy();
      expect(tokens.layout.sidebarWidth).toBeTruthy();
    }
  });
});
