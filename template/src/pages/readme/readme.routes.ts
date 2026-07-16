import type { RouteRecordRaw } from 'vue-router';

/**
 * 项目文档域路由。
 *
 * meta.code = 'Readme'：走 RBAC 权限校验（mock 的 admin 已内置该 code）；
 * 不设 keepAlive：文档页内容固定，无缓存必要，且避免与未来动态内容产生陈旧缓存。
 *
 * 注：name 用字符串字面量，不引用 ROUTE_NAMES（该常量由 build-plugins/route-names 扫描
 * *.routes.ts 自动生成，dev/build 时会自动补上 Readme 条目）。
 */
export const readmeRoutes: RouteRecordRaw[] = [
  {
    path: '/readme',
    name: 'Readme',
    meta: { code: 'Readme', title: '项目文档' },
    component: () => import('./pages/Readme.page.vue'),
  },
];
