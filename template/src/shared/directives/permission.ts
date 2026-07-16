import type { Directive, DirectiveBinding } from 'vue';
import { useAuthStore } from '@/modules/auth/stores/auth';

/**
 * 按钮级权限指令 `v-permission`。
 *
 * 用法：
 *   v-permission="'UserManagement:delete'"          // 单个 code
 *   v-permission="['UserManagement:delete', '...']" // 任一命中即显示
 *
 * 实现：用 `display: none` 切换可见性（而非移除 DOM 节点）——
 * 避免自定义指令删除元素后、父组件重渲染导致的 patch 异常；同时 `mounted` + `updated`
 * 都处理，保证权限变化时即时响应。
 *
 * ⚠️ 前端隐藏仅为 UX，真正的权限边界必须在后端校验。
 */
function isAuthorized(codes: string[]): boolean {
  if (codes.length === 0) return false;
  const auth = useAuthStore();
  return codes.some((code) => auth.hasPermission(code));
}

function apply(el: HTMLElement, binding: DirectiveBinding<string | string[]>): void {
  const value = binding.value;
  const codes = Array.isArray(value) ? value : [value];
  // 仅处理字符串 code，过滤误传的非字符串
  const normalized = codes.filter((c): c is string => typeof c === 'string' && c.length > 0);
  el.style.display = isAuthorized(normalized) ? '' : 'none';
}

export const vPermission: Directive<HTMLElement, string | string[]> = {
  mounted: apply,
  updated: apply,
};
