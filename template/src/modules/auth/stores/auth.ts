import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { COPY } from '@/shared/constants/copy';
import { getUserInfo, login as loginApi, logout as logoutApi } from '../api/auth.api';
import type { UserInfo, LoginParams } from '../models/Auth';
import type { MenuItem } from '@/modules/app/config/menuTypes';

// 本地持久化键：与 core/http 的默认实现（getToken / isTokenExpiring）保持一致
const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const TOKEN_EXPIRES_AT_KEY = 'tokenExpiresAt';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserInfo | null>(null);
  /** 后端下发的菜单树（侧边栏唯一渲染源，取代前端 menu.config 双源） */
  const menus = ref<MenuItem[]>([]);
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
      const { user: userInfo, menus: menuTree, permissions } = res.data;
      user.value = userInfo;
      menus.value = menuTree;
      // permissions 含路由 code + 按钮 code，直接作为权限集合（RBAC：菜单管可见，权限管可做）
      permissionCodes.value = new Set(permissions);
    } catch (e: any) {
      // 响应拦截器已将 HTTP 401 归一为 HttpError（含 status 字段）；
      // 续期失败时协调器会触发 onUnauthorized，这里仅置空本地用户态
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
      // 持久化双 token + 绝对过期时间戳：
      // - accessToken → 请求拦截器附加 Authorization 头；
      // - refreshToken → 续期协调器换取新 accessToken；
      // - tokenExpiresAt → 请求拦截器判断是否临近过期、主动刷新。
      const { accessToken, refreshToken, expiresIn } = res.data;
      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(Date.now() + expiresIn * 1000));
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
    // 清除本地全部凭证，避免下次请求仍携带失效 token
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
    user.value = null;
    menus.value = [];
    permissionCodes.value = new Set();
    loading.value = false;
    initialized.value = false;
    error.value = null;
  }

  function hasPermission(code: string): boolean {
    return permissionCodes.value.has(code);
  }

  return { user, menus, permissionCodes, loading, error, initialized, isLoggedIn, fetchUser, login, logout, hasPermission };
});
