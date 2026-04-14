import axios from 'axios';
import type { AuthData } from '../models/Auth';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export const getUserInfo = () => {
  return request.get<{ code: number; data: AuthData }>('/user/info');
};
