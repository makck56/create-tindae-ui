import { describe, it, expect } from 'vitest';
import { detectBrowser } from './detectBrowser';

describe('detectBrowser —— UA 解析', () => {
  it('识别 Chrome', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    expect(detectBrowser(ua)).toEqual({ name: 'chrome', version: 120 });
  });

  it('识别 Edge（Edg/ 须先于 Chrome/ 截获）', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
    expect(detectBrowser(ua)).toEqual({ name: 'edge', version: 120 });
  });

  it('识别 Firefox', () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0';
    expect(detectBrowser(ua)).toEqual({ name: 'firefox', version: 121 });
  });

  it('识别 Safari（Version/...Safari/）', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
    expect(detectBrowser(ua)).toEqual({ name: 'safari', version: 17 });
  });

  it('Chromium 系套壳（含 Chrome/）归为 chrome', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 OPR/118.0';
    expect(detectBrowser(ua)).toEqual({ name: 'chrome', version: 118 });
  });

  it('低版本仍正确解析版本号（是否放行交给 isSupported）', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.0.0 Safari/537.36';
    expect(detectBrowser(ua)).toEqual({ name: 'chrome', version: 90 });
  });

  it('未知 / 空 UA → unknown', () => {
    expect(detectBrowser('')).toEqual({ name: 'unknown', version: 0 });
    expect(detectBrowser('curl/8.0.1')).toEqual({ name: 'unknown', version: 0 });
  });
});
