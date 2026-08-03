import type { HttpError } from './error';

/** refresh 成功后返回 / 更新的令牌信息 */
export interface RefreshedTokens {
  accessToken: string;
  /** rolling 模式下后端可能下发新 refreshToken；不下发则沿用旧的 */
  refreshToken?: string;
  /** accessToken 有效期（秒） */
  expiresIn?: number;
}

/**
 * 运行时可注入配置接口。
 *
 * core/http 被设计为「零业务依赖」的底层模块——它不直接 import router / pinia，
 * 否则会形成「http → store → api → http」的循环依赖。
 *
 * 取而代之的是：应用在 bootstrap 阶段通过 configureHttp() 把
 * token 获取、未授权跳转、错误提示、**Token 续期**等「业务能力」以回调形式注入进来。
 */
export interface HttpRuntimeConfig {
  /** 获取访问令牌；返回 null 时本次请求不附加 Authorization 头 */
  getToken?: () => string | null;
  /** 收到 401 / 未授权时的回调（通常：登出 + 跳登录页） */
  onUnauthorized?: () => void;
  /** 网络错误 / 超时时的全局提示回调（如 message.error） */
  onNetworkError?: (error: HttpError) => void;
  /** 业务错误（HTTP 成功但 code !== 0）的全局提示回调 */
  onBusinessError?: (response: { code: number; message?: string }) => void;

  // ── Token 无感续期（B 主动刷新 + C 401 兜底）──────────────
  /** 获取 refresh token（access 过期后用它换新） */
  getRefreshToken?: () => string | null;
  /**
   * 判断 access token 是否临近过期（返回 true 触发主动刷新）。
   * 未配置则不启用「主动刷新」，仅靠 401 兜底。
   */
  isTokenExpiring?: () => boolean;
  /** 执行 refresh，返回新令牌；失败应 reject（协调器据此让上层触发 onUnauthorized） */
  refreshAccessToken?: () => Promise<RefreshedTokens>;
  /** refresh 成功后回调（业务在此更新本地存储） */
  onTokenRefreshed?: (tokens: RefreshedTokens) => void;
}

/** 主动刷新阈值：剩余有效期 < 此值视为「临过期」，默认 5 分钟。 */
const DEFAULT_REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

/** localStorage 安全读取（隐私模式 / SSR 降级返回 null） */
function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * 默认运行时配置。
 * - getToken / getRefreshToken 默认读 localStorage；
 * - isTokenExpiring 默认比对 localStorage 'tokenExpiresAt' 与阈值（5 分钟）；
 * - 续期动作（refreshAccessToken / onTokenRefreshed）默认不启用，由业务在 bootstrap 注入。
 */
const defaultConfig: HttpRuntimeConfig = {
  getToken: () => safeGetItem('token'),
  getRefreshToken: () => safeGetItem('refreshToken'),
  isTokenExpiring: () => {
    const raw = safeGetItem('tokenExpiresAt');
    if (!raw) return false;
    const exp = Number(raw);
    if (!Number.isFinite(exp)) return false;
    return exp - Date.now() < DEFAULT_REFRESH_THRESHOLD_MS;
  },
};

let runtimeConfig: HttpRuntimeConfig = { ...defaultConfig };

/**
 * 注入运行时配置（合并式，可多次调用渐进配置）。
 *
 * @example
 * configureHttp({
 *   getToken: () => localStorage.getItem('token'),
 *   refreshAccessToken: async () => { const res = await refreshApi(...); return { accessToken, expiresIn } },
 *   onTokenRefreshed: ({ accessToken, expiresIn }) => localStorage.setItem('token', accessToken),
 *   onUnauthorized: () => { useAuthStore().logout(); router.push('/login') },
 * })
 */
export function configureHttp(partial: Partial<HttpRuntimeConfig>): void {
  runtimeConfig = { ...runtimeConfig, ...partial };
}

/** 读取当前运行时配置（拦截器内部使用） */
export function getHttpRuntimeConfig(): HttpRuntimeConfig {
  return runtimeConfig;
}
