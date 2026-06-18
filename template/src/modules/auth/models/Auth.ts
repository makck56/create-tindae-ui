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
 * 登录成功后后端返回的业务数据。
 * token 在「验证码错误」等失败场景下不存在，故标记为可选；
 * 调用方应先判断 code === 0 再读取 token。
 */
export interface LoginResult {
  token?: string
}
