import { request } from '@/core/http';
import type { Role, CreateRoleParams, RoleListParams, RoleListResult } from '../models/Role';

// 统一使用 core/http 默认实例，自动注入 token、解包业务信封、处理 401/超时/网络错误。
// 每个方法返回 ApiResponse<T>，调用方直接 res.data 取业务数据。

export const getRoleList = (params: RoleListParams) => {
  return request.get<RoleListResult>('/user-management/role/list', { params });
};

export const createRole = (data: CreateRoleParams) => {
  return request.post<Role>('/user-management/role', data);
};

export const updateRole = (id: string, data: Partial<CreateRoleParams>) => {
  return request.put<Role>(`/user-management/role/${id}`, data);
};

export const deleteRole = (id: string) => {
  return request.delete(`/user-management/role/${id}`);
};
