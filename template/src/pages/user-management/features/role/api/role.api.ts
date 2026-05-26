import axios from 'axios';
import type { Role, CreateRoleParams, RoleListParams, RoleListResult } from '../models/Role';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export const getRoleList = (params: RoleListParams) => {
  return request.get<{ code: number; data: RoleListResult }>('/user-management/role/list', { params });
};

export const createRole = (data: CreateRoleParams) => {
  return request.post<{ code: number; data: Role }>('/user-management/role', data);
};

export const updateRole = (id: string, data: Partial<CreateRoleParams>) => {
  return request.put<{ code: number; data: Role }>(`/user-management/role/${id}`, data);
};

export const deleteRole = (id: string) => {
  return request.delete<{ code: number }>(`/user-management/role/${id}`);
};
