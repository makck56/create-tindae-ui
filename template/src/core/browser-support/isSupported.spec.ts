import { describe, it, expect } from 'vitest';
import { isBrowserSupported } from './isSupported';

// 真实 UA 片段构造器：仅替换版本号，便于批量生成达标 / 不达标用例
const chrome = (v: number) =>
  `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${v}.0.0.0 Safari/537.36`;
const edge = (v: number) => `${chrome(v)} Edg/${v}.0.0.0`;
const firefox = (v: number) =>
  `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:${v}.0) Gecko/20100101 Firefox/${v}.0`;
const safari = (v: number) =>
  `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${v}.0 Safari/605.1.15`;

describe('isBrowserSupported —— 最低版本判定', () => {
  describe('Chrome（下限 100）', () => {
    it('达标放行', () => expect(isBrowserSupported(chrome(120))).toBe(true));
    it('刚好等于下限放行', () => expect(isBrowserSupported(chrome(100))).toBe(true));
    it('低于下限拦截', () => expect(isBrowserSupported(chrome(90))).toBe(false));
  });

  describe('Edge（下限 100）', () => {
    it('达标放行', () => expect(isBrowserSupported(edge(120))).toBe(true));
    it('低于下限拦截', () => expect(isBrowserSupported(edge(99))).toBe(false));
  });

  describe('Firefox（下限 100）', () => {
    it('达标放行', () => expect(isBrowserSupported(firefox(121))).toBe(true));
    it('低于下限拦截', () => expect(isBrowserSupported(firefox(99))).toBe(false));
  });

  describe('Safari（下限 15）', () => {
    it('达标放行', () => expect(isBrowserSupported(safari(17))).toBe(true));
    it('低于下限拦截', () => expect(isBrowserSupported(safari(14))).toBe(false));
  });

  it('未知浏览器默认放行（不误伤）', () => {
    expect(isBrowserSupported('')).toBe(true);
    expect(isBrowserSupported('curl/8.0.1')).toBe(true);
  });
});
