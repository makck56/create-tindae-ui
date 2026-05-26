export interface Role {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export const RoleStatuses = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export type RoleStatus = (typeof RoleStatuses)[keyof typeof RoleStatuses];

export const RoleStatusOptions = [
  { label: '启用', value: RoleStatuses.ACTIVE },
  { label: '禁用', value: RoleStatuses.INACTIVE },
];

export interface CreateRoleParams {
  name: string;
  status?: RoleStatus;
}

export interface RoleListParams {
  page: number;
  pageSize: number;
  keyword?: string;
}

export interface RoleListResult {
  list: Role[];
  total: number;
}
