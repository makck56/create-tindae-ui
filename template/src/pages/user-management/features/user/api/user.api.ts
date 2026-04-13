import axios from 'axios';
import type { User, UserListParams, UserListResult } from '../models/User';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export const getUserList = (params: UserListParams) => {
  return request.get<{ code: number; data: UserListResult }>('/users', { params });
};

export const getUserDetail = (id: string) => {
  return request.get<{ code: number; data: User }>(`/users/${id}`);
};

export const createUser = (data: Omit<User, 'id' | 'createdAt'>) => {
  return request.post<{ code: number; data: User }>('/users', data);
};

export const updateUser = (id: string, data: Partial<User>) => {
  return request.put<{ code: number; data: User }>(`/users/${id}`, data);
};

export const deleteUser = (id: string) => {
  return request.delete<{ code: number }>(`/users/${id}`);
};
