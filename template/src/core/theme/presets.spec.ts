import { describe, it, expect } from 'vitest';
import { THEME_PRESETS, DEFAULT_PRESET_KEY, findPreset, applyPreset } from './presets';
import { lightTokens } from './tokens';
import type { ColorScale } from './types';

describe('presets', () => {
  it('预设数量不少于 3，且每个含完整主色色阶', () => {
    expect(THEME_PRESETS.length).toBeGreaterThanOrEqual(3);
    for (const p of THEME_PRESETS) {
      expect(p.key).toBeTruthy();
      expect(p.label).toBeTruthy();
      expect(p.primary.DEFAULT).toMatch(/^#[0-9a-fA-F]{3,8}$/);
      expect(p.primary.hover).toMatch(/^#[0-9a-fA-F]{3,8}$/);
      expect(p.primary.active).toMatch(/^#[0-9a-fA-F]{3,8}$/);
      expect(p.primary.disabled).toMatch(/^#[0-9a-fA-F]{3,8}$/);
    }
  });

  it('预设 key 全局唯一（持久化依赖其唯一性）', () => {
    const keys = THEME_PRESETS.map((p) => p.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('DEFAULT_PRESET_KEY 能在预设中命中', () => {
    expect(findPreset(DEFAULT_PRESET_KEY)).toBeDefined();
  });

  it('findPreset 按 key 精确返回', () => {
    expect(findPreset('green')?.label).toBe('极光绿');
  });

  it('findPreset 对未知 key 返回 undefined', () => {
    expect(findPreset('__not_exist__')).toBeUndefined();
  });
});

describe('applyPreset', () => {
  const sampleScale: ColorScale = {
    DEFAULT: '#123456',
    hover: '#234567',
    active: '#345678',
    disabled: '#456789',
  };

  it('preset 为 undefined 时原样返回 base（同一引用）', () => {
    expect(applyPreset(lightTokens, undefined)).toBe(lightTokens);
  });

  it('覆盖 primary，未提供的功能色保留 base', () => {
    const r = applyPreset(lightTokens, findPreset('green')!);
    expect(r.colors.primary.DEFAULT).toBe(findPreset('green')!.primary.DEFAULT);
    expect(r.colors.success).toBe(lightTokens.colors.success);
    expect(r.colors.warning).toBe(lightTokens.colors.warning);
    expect(r.colors.info).toBe(lightTokens.colors.info);
  });

  it('预设中提供的其他功能色也被覆盖', () => {
    const r = applyPreset(lightTokens, {
      key: 'x',
      label: 'x',
      primary: sampleScale,
      success: sampleScale,
      danger: sampleScale,
      // warning / info 未提供 → 应保留 base
    });
    expect(r.colors.primary).toBe(sampleScale);
    expect(r.colors.success).toBe(sampleScale);
    expect(r.colors.danger).toBe(sampleScale);
    expect(r.colors.warning).toBe(lightTokens.colors.warning);
    expect(r.colors.info).toBe(lightTokens.colors.info);
  });

  it('不修改 base（不可变）', () => {
    const originalSuccess = lightTokens.colors.success;
    applyPreset(lightTokens, {
      key: 'x',
      label: 'x',
      primary: sampleScale,
      success: sampleScale,
    });
    expect(lightTokens.colors.success).toBe(originalSuccess);
  });

  it('保留 base 的非颜色字段（text / bg / border / radius / layout）', () => {
    const r = applyPreset(lightTokens, findPreset('blue')!);
    expect(r.text).toBe(lightTokens.text);
    expect(r.bg).toBe(lightTokens.bg);
    expect(r.border).toBe(lightTokens.border);
    expect(r.radius).toBe(lightTokens.radius);
    expect(r.layout).toBe(lightTokens.layout);
  });

  // —— 全套视觉覆盖（字段级浅合并）——
  it('text 支持字段级覆盖：仅 title 被覆盖，其余文本色保留 base', () => {
    const r = applyPreset(lightTokens, {
      key: 'x',
      label: 'x',
      primary: sampleScale,
      text: { title: '#111111' },
    });
    expect(r.text.title).toBe('#111111');
    expect(r.text.body).toBe(lightTokens.text.body);
    expect(r.text.secondary).toBe(lightTokens.text.secondary);
    expect(r.text.inverse).toBe(lightTokens.text.inverse);
  });

  it('bg / border 按字段覆盖，未提供维度保留 base 引用（零拷贝）', () => {
    const r = applyPreset(lightTokens, {
      key: 'x',
      label: 'x',
      primary: sampleScale,
      bg: { page: '#abcdef' },
      border: { base: '#aaaaaa', light: '#bbbbbb' },
    });
    expect(r.bg.page).toBe('#abcdef');
    expect(r.bg.container).toBe(lightTokens.bg.container); // 未覆盖字段保留
    expect(r.border.base).toBe('#aaaaaa');
    expect(r.border.light).toBe('#bbbbbb');
    expect(r.border.lighter).toBe(lightTokens.border.lighter); // 未覆盖字段保留
    // 未提供的整段维度保留 base 引用（未做无谓拷贝）
    expect(r.text).toBe(lightTokens.text);
    expect(r.radius).toBe(lightTokens.radius);
    expect(r.layout).toBe(lightTokens.layout);
  });

  it('全套覆盖：colors + text + bg + border + radius + layout 同时叠加生效', () => {
    const r = applyPreset(lightTokens, {
      key: 'full',
      label: '全套',
      primary: sampleScale,
      success: sampleScale,
      text: { title: '#tttttt' },
      bg: { page: '#pppppp' },
      border: { base: '#bbbbbb' },
      radius: { lg: '20px' },
      layout: { headerHeight: '64px' },
    });
    expect(r.colors.primary).toBe(sampleScale);
    expect(r.colors.success).toBe(sampleScale);
    expect(r.colors.warning).toBe(lightTokens.colors.warning); // 未覆盖语义色保留
    expect(r.text.title).toBe('#tttttt');
    expect(r.bg.page).toBe('#pppppp');
    expect(r.border.base).toBe('#bbbbbb');
    expect(r.radius.lg).toBe('20px');
    expect(r.radius.md).toBe(lightTokens.radius.md); // 未覆盖圆角保留
    expect(r.layout.headerHeight).toBe('64px');
  });

  it('全套维度覆盖不修改 base（不可变）', () => {
    const originalBgPage = lightTokens.bg.page;
    const originalRadiusLg = lightTokens.radius.lg;
    applyPreset(lightTokens, {
      key: 'x',
      label: 'x',
      primary: sampleScale,
      bg: { page: '#abcdef' },
      radius: { lg: '99px' },
    });
    expect(lightTokens.bg.page).toBe(originalBgPage);
    expect(lightTokens.radius.lg).toBe(originalRadiusLg);
  });

  it('custom 扩展 Token 支持递归深合并，并保留未覆盖字段', () => {
    const base = {
      ...lightTokens,
      custom: {
        chart: {
          referenceLine: '#dddddd',
          gridGap: '12px',
        },
        workflow: {
          pendingBg: '#fff7e6',
        },
      },
    };

    const r = applyPreset(base, {
      key: 'custom',
      label: '扩展',
      primary: sampleScale,
      custom: {
        chart: {
          referenceLine: '#123456',
        },
      },
    });

    expect(r.custom?.chart).toEqual({ referenceLine: '#123456', gridGap: '12px' });
    expect(r.custom?.workflow).toEqual({ pendingBg: '#fff7e6' });
    expect(base.custom.chart.referenceLine).toBe('#dddddd');
  });
});
