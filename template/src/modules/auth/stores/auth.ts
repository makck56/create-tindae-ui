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
      const { data: res } = await getUserInfo();
      if (res.code !== 0) {
        throw new Error(`${COPY.LOGIN.API_ERROR}: ${res.code}`);
      }
      const { user: userInfo, menus } = res.data;
      user.value = userInfo;
      permissionCodes.value = new Set(menus.map((m) => m.code));
    } catch (e: any) {
      if (e?.response?.status === 401) {
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
      const { data: res } = await loginApi(params);
      if (res.code !== 0) {
        throw new Error(res.message || `${COPY.LOGIN.LOGIN_FAILED}: ${res.code}`);
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
      // ignore
    }
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
