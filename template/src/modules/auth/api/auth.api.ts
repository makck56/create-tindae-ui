import axios from 'axios';
import { COPY } from '@/shared/constants/copy';
import type { AuthData } from '../models/Auth';
import type { LoginParams } from '../models/Auth';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// --- Mock captcha ---
let currentCaptchaAnswer = '';

export function setCaptchaAnswer(answer: string) {
  currentCaptchaAnswer = answer;
}

// --- API ---
export const getUserInfo = () => {
  return request.get<{ code: number; data: AuthData }>('/user/info');
};

export const login = (data: LoginParams) => {
  // Mock: 验证码校验（模拟后端行为）
  if (!data.captchaCode || data.captchaCode.toLowerCase() !== currentCaptchaAnswer.toLowerCase()) {
    return Promise.resolve({ data: { code: 40001, message: COPY.LOGIN.CAPTCHA_ERROR } });
  }
  return request.post<{ code: number; message?: string }>('/auth/login', data);
};

export const logout = () => {
  return request.post<{ code: number }>('/auth/logout');
};
