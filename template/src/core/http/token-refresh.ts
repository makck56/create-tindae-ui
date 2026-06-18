import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import { getHttpRuntimeConfig, type RefreshedTokens } from './config'

/** 带「已重试」标记的 config 类型，防止 401 重试无限递归 */
type RetryableConfig = AxiosRequestConfig & {
  __refreshRetried?: boolean
}

/**
 * Token 续期协调器（全局单例）。
 *
 * 实现「用户活跃时 token 不应过期」的核心组件，提供两个入口：
 *
 * 1. ensureFreshToken() —— 请求拦截器在发送前调用（主动刷新，方案 B）。
 *    若 isTokenExpiring() 为真，先 refresh 再放行请求；多个并发请求复用同一 refreshingPromise。
 *
 * 2. retryWithRefresh() —— 响应拦截器收到 401 时调用（兜底，方案 C）。
 *    refresh 成功后用新 token 重试原请求；失败则抛错由上层触发 onUnauthorized。
 *
 * 关键设计：
 * - 单例去重：refresh 期间所有调用 await 同一个 promise，避免并发打爆 refresh 接口、互相覆盖；
 * - 防递归：refresh 请求自身带 skipRefresh，不会进入续期逻辑；
 * - 防死循环：重试请求带 __refreshRetried 标记，再次 401 不再重试，直接登出。
 */
export class TokenRefreshCoordinator {
  /** 当前进行中的 refresh promise（单例去重） */
  private refreshing: Promise<RefreshedTokens> | null = null

  /**
   * 主动刷新（方案 B）：若启用续期且 token 临近过期，先刷新。
   * - 未启用续期 / token 仍新鲜 → 直接返回；
   * - 刷新失败 → 抛错（调用方可忽略，靠响应 401 兜底）。
   */
  async ensureFreshToken(): Promise<void> {
    const cfg = getHttpRuntimeConfig()
    if (!cfg.refreshAccessToken) return
    if (!cfg.isTokenExpiring?.()) return
    await this.refresh()
  }

  /**
   * 401 兜底（方案 C）：refresh 后用新 token 重试原请求。
   * - 未启用续期 / 无 config / 已重试过 → 抛原错误；
   * - refresh 失败 → 抛原错误（由响应拦截器触发 onUnauthorized）。
   * @returns 重试请求的响应（已由响应拦截器解包为 ApiResponse）
   */
  async retryWithRefresh(
    error: { config?: RetryableConfig },
    instance: AxiosInstance,
  ): Promise<unknown> {
    const config = error.config
    if (!config || config.__refreshRetried) throw error
    if (!getHttpRuntimeConfig().refreshAccessToken) throw error

    config.__refreshRetried = true
    // refresh 成功 → onTokenRefreshed 已更新本地 token；
    // instance.request 会重新走请求拦截器，自动用新 token 附加 Authorization 头。
    await this.refresh()
    return instance.request(config)
  }

  /**
   * 执行一次 refresh（单例去重）。
   * 成功 → onTokenRefreshed 更新本地 → 返回新令牌；
   * 失败 → reject（**不在内部触发 onUnauthorized**，交由上层统一处理，避免重复登出回调）。
   */
  private refresh(): Promise<RefreshedTokens> {
    if (this.refreshing) return this.refreshing
    const cfg = getHttpRuntimeConfig()
    this.refreshing = (async () => {
      try {
        const tokens = await cfg.refreshAccessToken!()
        cfg.onTokenRefreshed?.(tokens)
        return tokens
      } finally {
        // 无论成败都清空，允许后续重试（如主动刷新失败后，401 兜底再试一次）
        this.refreshing = null
      }
    })()
    return this.refreshing
  }
}

/** 全局单例（整个应用共享一个 refresh 协调器） */
export const tokenRefreshCoordinator = new TokenRefreshCoordinator()
