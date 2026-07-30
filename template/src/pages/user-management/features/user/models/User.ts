/** User entity */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

/** User role enum */
export const UserRoles = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];

export const UserRoleOptions = [
  { label: '管理员', value: UserRoles.ADMIN },
  { label: '普通用户', value: UserRoles.USER },
];

/** User status enum */
export const UserStatuses = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export type UserStatus = (typeof UserStatuses)[keyof typeof UserStatuses];

export const UserStatusOptions = [
  { label: '启用', value: UserStatuses.ACTIVE },
  { label: '禁用', value: UserStatuses.INACTIVE },
];

/** Request params for user list */
export interface UserListParams {
  page: number;
  pageSize: number;
  name?: string;
  status?: UserStatus;
  role?: UserRole;
  /** 排序字段（对应 vxe 列 field） */
  sortBy?: string;
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc';
}

/** Paginated list result */
export interface UserListResult {
  list: User[];
  total: number;
}
