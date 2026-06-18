import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { COPY } from '@/shared/constants/copy';
import { getUserInfo, login as loginApi, logout as logoutApi } from '../api/auth.api';
import type { UserInfo, LoginParams } from '../models/Auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserInfo | null>(null);
  const permissionCodes = ref<Set<string>>(new Set());
  const loading = ref(false);
  const error = ref<string | null>(null);
  const initialized = ref(false);

  const isLoggedIn = computed(() => user.value !== null);

  async function fetchUser() {
    if (initialized.value) return;
    loading.value = true;
    error.value = null;
    try {
      // 封装后请求直接返回 ApiResponse<AuthData>，无需再解 axios 外壳
      const res = await getUserInfo();
      if (res.code !== 0) {
        throw new Error(`${COPY.LOGIN.API_ERROR}: ${res.code}`);
      }
      const { user: userInfo, menus } = res.data;
      user.value = userInfo;
      permissionCodes.value = new Set(menus.map((m) => m.code));
    } catch (e: any) {
      // 响应拦截器已将 HTTP 401 归一为 HttpError（含 status 字段）
      if (e?.status === 401) {
        user.value = null;
      } else {
        error.value = e.message || COPY.LOGIN.FETCH_USER_FAILED;
      }
    } finally {
      loading.value = false;
      initialized.value = true;
    }
  }

  async function login(params: LoginParams) {
    loading.value = true;
    error.value = null;
    try {
      const res = await loginApi(params);
      if (res.code !== 0) {
        throw new Error(res.message || `${COPY.LOGIN.LOGIN_FAILED}: ${res.code}`);
      }
      // 登录成功：持久化 token，供请求拦截器后续自动附加 Authorization 头
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      initialized.value = false;
      await fetchUser();
    } catch (e: any) {
      error.value = e.message || COPY.LOGIN.LOGIN_FAILED;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      await logoutApi();
    } catch {
      // ignore：登出接口失败不阻断本地清态
    }
    // 清除本地 token，避免下次请求仍携带失效凭证
    localStorage.removeItem('token');
    user.value = null;
    permissionCodes.value = new Set();
    loading.value = false;
    initialized.value = false;
    error.value = null;
  }

  function hasPermission(code: string): boolean {
    return permissionCodes.value.has(code);
  }

  return { user, permissionCodes, loading, error, initialized, isLoggedIn, fetchUser, login, logout, hasPermission };
});
