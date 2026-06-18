export interface UserInfo {
  id: string;
  username: string;
  avatar?: string;
}

export interface MenuPermission {
  code: string;
  name: string;
}

export interface AuthData {
  user: UserInfo;
  menus: MenuPermission[];
}

export interface LoginParams {
  username: string;
  password: string;     // RSA 加密后的密文
  captchaCode: string;  // 验证码
}

/**
 * 登录成功后后端返回的业务数据（双 token 机制）。
 * - accessToken: 短期访问令牌（如 30min），过期后用 refreshToken 无感续期；
 * - refreshToken: 长期刷新令牌（如 7d），仅用于换取新 accessToken；
 * - expiresIn: accessToken 有效期（秒），前端据此计算绝对过期时间戳。
 */
export interface LoginResult {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

/** refresh 接口返回的新令牌信息（rolling 模式下可顺带返回新 refreshToken）。 */
export interface RefreshResult {
  accessToken: string
  refreshToken?: string
  expiresIn: number
}
