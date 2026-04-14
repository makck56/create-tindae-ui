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
  password: string;
}
