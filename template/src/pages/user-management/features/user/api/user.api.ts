import { request } from '@/core/http';
import type { User, UserListParams, UserListResult } from '../models/User';

// 统一使用 core/http 默认实例，自动注入 token、解包业务信封、处理 401/超时/网络错误。
// 每个方法返回 ApiResponse<T>，调用方直接 res.data 取业务数据。

export const getUserList = (params: UserListParams) => {
  return request.get<UserListResult>('/users', { params });
};

export const getUserDetail = (id: string) => {
  return request.get<User>(`/users/${id}`);
};

export const createUser = (data: Omit<User, 'id' | 'createdAt'>) => {
  return request.post<User>('/users', data);
};

export const updateUser = (id: string, data: Partial<User>) => {
  return request.put<User>(`/users/${id}`, data);
};

export const deleteUser = (id: string) => {
  return request.delete(`/users/${id}`);
};
