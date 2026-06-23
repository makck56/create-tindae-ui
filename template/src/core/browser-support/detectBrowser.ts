import type { BrowserName } from './config';

/** 解析结果：已知浏览器返回对应 name，无法识别返回 'unknown'。 */
export interface DetectedBrowser {
  name: BrowserName | 'unknown';
  /** 主版本号（整数）；unknown 时为 0。 */
  version: number;
}

/**
 * 从 User-Agent 解析浏览器名称与主版本号（纯函数，便于单测）。
 *
 * 仅识别与 {@link MIN_BROWSER_VERSIONS} 对齐的四大桌面主流：Chrome / Edge / Firefox / Safari。
 * Chromium 系套壳（Opera / Brave / 360 等）UA 同样含 `Chrome/`，统一归为 chrome。
 *
 * 匹配顺序遵循「最具体优先」，避免被通用字样抢先：
 *   1. Edge —— UA 含 `Edg/`（Chromium 内核，须在 Chrome 之前截获，否则会被 Chrome 分支命中）；
 *   2. Chrome —— UA 含 `Chrome/`；
 *   3. Firefox —— UA 含 `Firefox/`；
 *   4. Safari —— UA 含 `Version/...Safari/`（Chrome UA 也含 Safari 字样，但已在上面截获）。
 *
 * 匹配失败返回 `{ name: 'unknown', version: 0 }`，由调用方决定放行策略。
 *
 * @param userAgent UA 字符串；默认不在此读取 navigator，由调用方注入（便于测试与 SSR）。
 */
export function detectBrowser(userAgent: string): DetectedBrowser {
  const ua = userAgent.toLowerCase();

  // Edge：Chromium 内核，UA 形如 "... Chrome/120 ... Edg/120 ..."
  const edge = /edg\/(\d+)/.exec(ua);
  if (edge) return { name: 'edge', version: Number(edge[1]) };

  // Chrome（含 Chromium 系套壳）
  const chrome = /chrome\/(\d+)/.exec(ua);
  if (chrome) return { name: 'chrome', version: Number(chrome[1]) };

  // Firefox
  const firefox = /firefox\/(\d+)/.exec(ua);
  if (firefox) return { name: 'firefox', version: Number(firefox[1]) };

  // Safari：UA 形如 "... Version/17.0 Safari/605.1.15"
  const safari = /version\/(\d+).*safari/.exec(ua);
  if (safari) return { name: 'safari', version: Number(safari[1]) };

  return { name: 'unknown', version: 0 };
}
