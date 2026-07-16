import { describe, expect, it } from 'vitest';
import { darkTokens, getTokensByMode, lightTokens } from './tokens';

describe('getTokensByMode', () => {
  it('returns the light token reference', () => {
    expect(getTokensByMode('light')).toBe(lightTokens);
  });

  it('returns the dark token reference', () => {
    expect(getTokensByMode('dark')).toBe(darkTokens);
  });

  it('uses a different primary color for dark mode', () => {
    expect(lightTokens.colors.primary.DEFAULT).not.toBe(darkTokens.colors.primary.DEFAULT);
  });

  it('keeps semantic color scales complete in both modes', () => {
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

  it('includes neutral, typography, spacing, radius, and layout tokens in both modes', () => {
    for (const tokens of [lightTokens, darkTokens]) {
      expect(tokens.text.title).toBeTruthy();
      expect(tokens.bg.page).toBeTruthy();
      expect(tokens.border.base).toBeTruthy();
      expect(tokens.typography.bodyLg.fontSize).toBeTruthy();
      expect(tokens.spacing.unit).toBeTruthy();
      expect(tokens.radius.md).toBeTruthy();
      expect(tokens.layout.sidebarWidth).toBeTruthy();
    }
  });
});
