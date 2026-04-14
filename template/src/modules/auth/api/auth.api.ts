import axios from 'axios';
import type { AuthData } from '../models/Auth';
import type { LoginParams } from '../models/Auth';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export const getUserInfo = () => {
  return request.get<{ code: number; data: AuthData }>('/user/info');
};

export const login = (data: LoginParams) => {
  return request.post<{ code: number }>('/auth/login', data);
};

export const logout = () => {
  return request.post<{ code: number }>('/auth/logout');
};
