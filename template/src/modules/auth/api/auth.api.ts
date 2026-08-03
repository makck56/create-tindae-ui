import { request } from '@/core/http';
import type { ApiResponse } from '@/core/http';
import { COPY } from '@/shared/constants/copy';
import type { AuthData, LoginParams, LoginResult, RefreshResult } from '../models/Auth';

// --- Mock captcha ---
// 验证码答案由 useCaptcha 写入，login 时做「模拟后端」校验
let currentCaptchaAnswer = '';

export function setCaptchaAnswer(answer: string) {
  currentCaptchaAnswer = answer;
}

/**
 * 登录（匿名接口）。失败码 40001 = 验证码错误（mock 校验）。
 * @returns ApiResponse<LoginResult>，成功含 accessToken / refreshToken / expiresIn
 */
export const login = (data: LoginParams): Promise<ApiResponse<LoginResult>> => {
  // Mock：验证码校验（模拟后端行为），不发起真实请求
  if (!data.captchaCode || data.captchaCode.toLowerCase() !== currentCaptchaAnswer.toLowerCase()) {
    return Promise.resolve<ApiResponse<LoginResult>>({
      code: 40001,
      data: {} as LoginResult,
      message: COPY.LOGIN.CAPTCHA_ERROR,
    });
  }
  return request.post<LoginResult>('/auth/login', data, { skipAuth: true });
};

/** 获取当前登录用户信息及菜单权限（需登录） */
export const getUserInfo = () => {
  return request.get<AuthData>('/user/info');
};

/**
 * 用 refreshToken 换取新 accessToken（无感续期）。
 *
 * 三个跳过开关都很关键：
 * - skipAuth: 不带（可能已过期的）access token，refreshToken 走 body；
 * - skipRefresh: refresh 请求自身不进入「主动刷新」逻辑（否则递归）；
 * - skipErrorHandler: 失败由续期协调器统一处理，不触发全局 onUnauthorized。
 */
export const refreshAccessToken = (refreshToken: string): Promise<ApiResponse<RefreshResult>> => {
  return request.post<RefreshResult>(
    '/auth/refresh',
    { refreshToken },
    { skipAuth: true, skipRefresh: true, skipErrorHandler: true },
  );
};

/**
 * 登出，无业务数据返回。
 * 跳过全局错误处理：避免登出接口本身 401 时触发 onUnauthorized（→ 再次登出）形成死循环；
 * 失败由 auth store 自行 catch 忽略，本地态照常清除。
 */
export const logout = () => {
  return request.post<void>('/auth/logout', undefined, { skipErrorHandler: true });
};
