import { useAuthStore } from '@/modules/auth/stores/auth';

/**
 * 权限判断 composable：封装对 `authStore.permissionCodes` 的常用查询，
 * 供模板外的脚本逻辑使用（如动态表格列、条件分支、菜单拼接）。
 *
 * - `has(code)`：是否拥有某权限；
 * - `hasAny(codes)`：任一命中；
 * - `hasAll(codes)`：全部命中。
 *
 * @example
 *   const { has, hasAny } = usePermission();
 *   const canDelete = has('UserManagement:delete');
 *   const columns = computed(() => allColumns.filter((c) => !c.requirePerm || has(c.requirePerm)));
 */
export function usePermission() {
  const auth = useAuthStore();

  return {
    has: (code: string): boolean => auth.hasPermission(code),
    hasAny: (codes: string[]): boolean => codes.some((code) => auth.hasPermission(code)),
    hasAll: (codes: string[]): boolean => codes.every((code) => auth.hasPermission(code)),
  };
}
