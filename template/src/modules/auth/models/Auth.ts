import type { MenuItem } from '@/modules/app/config/menuTypes';

export interface UserInfo {
  id: string;
  username: string;
  avatar?: string;
}

/**
 * 登录后后端下发的数据：当前用户 + 其可见的菜单 / 权限树。
 *
 * `menus` 是侧边栏与权限的【唯一真相源】：
 * - 侧边栏直接据 `menus` 渲染（前端不再维护独立的菜单配置，消除双源）；
 * - 路由级权限比对 `route.meta.code` 与从菜单收集到的 code 集合；
 * - 按钮级权限 `v-permission` 同样比对 code 集合。
 *
 * 字段与 `menu.config.ts` 的 `MenuItem` 一致——mock 直接回吐 `menuConfig` 作为演示数据；
 * 生产环境由真实后端按用户角色返回（已按权限过滤过）。
 */
export interface AuthData {
  user: UserInfo;
  /** 侧边栏菜单树（决定「看得到」什么页面） */
  menus: MenuItem[];
  /** 权限码集合（决定「做得了」什么；含路由 code 与按钮 code，如 'UserManagement'、'UserManagement:delete'） */
  permissions: string[];
}

export interface LoginParams {
  username: string;
  password: string; // RSA 加密后的密文
  captchaCode: string; // 验证码
}

/**
 * 登录成功后后端返回的业务数据（双 token 机制）。
 * - accessToken: 短期访问令牌（如 30min），过期后用 refreshToken 无感续期；
 * - refreshToken: 长期刷新令牌（如 7d），仅用于换取新 accessToken；
 * - expiresIn: accessToken 有效期（秒），前端据此计算绝对过期时间戳。
 */
export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/** refresh 接口返回的新令牌信息（rolling 模式下可顺带返回新 refreshToken）。 */
export interface RefreshResult {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}
