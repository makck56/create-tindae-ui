import { request } from '@/core/http'
import type { ApiResponse } from '@/core/http'
import { COPY } from '@/shared/constants/copy'
import type { AuthData, LoginParams, LoginResult } from '../models/Auth'

// --- Mock captcha ---
// 验证码答案由 useCaptcha 写入，login 时做「模拟后端」校验
let currentCaptchaAnswer = ''

export function setCaptchaAnswer(answer: string) {
  currentCaptchaAnswer = answer
}

// --- API ---
// 统一走 core/http 封装：登录为匿名接口（登录前尚无 token），故传 skipAuth。
// 封装方法返回 ApiResponse<T>，调用方直接拿 { code, data, message }。

/**
 * 登录。失败码 40001 = 验证码错误（mock 校验）。
 * @returns ApiResponse<LoginResult>，成功时 data.token 为访问令牌
 */
export const login = (data: LoginParams): Promise<ApiResponse<LoginResult>> => {
  // Mock：验证码校验（模拟后端行为），不发起真实请求
  if (!data.captchaCode || data.captchaCode.toLowerCase() !== currentCaptchaAnswer.toLowerCase()) {
    return Promise.resolve<ApiResponse<LoginResult>>({
      code: 40001,
      data: {},
      message: COPY.LOGIN.CAPTCHA_ERROR,
    })
  }
  return request.post<LoginResult>('/auth/login', data, { skipAuth: true })
}

/** 获取当前登录用户信息及菜单权限（需登录） */
export const getUserInfo = () => {
  return request.get<AuthData>('/user/info')
}

/**
 * 登出，无业务数据返回。
 * 跳过全局错误处理：避免登出接口本身 401 时触发 onUnauthorized（→ 再次登出）形成死循环；
 * 失败由 auth store 自行 catch 忽略，本地态照常清除。
 */
export const logout = () => {
  return request.post<void>('/auth/logout', undefined, { skipErrorHandler: true })
}
