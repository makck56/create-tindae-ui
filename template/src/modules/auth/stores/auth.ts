import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getUserInfo } from '../api/auth.api';
import type { UserInfo } from '../models/Auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserInfo | null>(null);
  const permissionCodes = ref<Set<string>>(new Set());
  const loading = ref(false);
  const error = ref<string | null>(null);
  const initialized = ref(false);

  async function fetchUser() {
    if (initialized.value) return;
    loading.value = true;
    error.value = null;
    try {
      const { data: res } = await getUserInfo();
      if (res.code !== 0) {
        throw new Error(`接口返回错误: ${res.code}`);
      }
      const { user: userInfo, menus } = res.data;
      user.value = userInfo;
      permissionCodes.value = new Set(menus.map((m) => m.code));
    } catch (e: any) {
      error.value = e.message || '获取用户信息失败';
    } finally {
      loading.value = false;
      initialized.value = true;
    }
  }

  function hasPermission(code: string): boolean {
    return permissionCodes.value.has(code);
  }

  return { user, permissionCodes, loading, error, initialized, fetchUser, hasPermission };
});
