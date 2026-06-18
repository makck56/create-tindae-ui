import type { RouteRecordRaw } from 'vue-router';

/** /403 无权限页（公共路由，匿名可访问） */
export const errorRoutes: RouteRecordRaw[] = [
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('./pages/Forbidden.page.vue'),
    meta: { public: true },
  },
];

/**
 * 404 兜底路由。单独导出，供 router.ts 放在所有业务路由【之后】，
 * 否则通配符 `/:pathMatch(.*)*` 会抢先匹配 /user-management 等真实路径。
 */
export const notFoundRoute: RouteRecordRaw[] = [
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('./pages/NotFound.page.vue'),
    meta: { public: true },
  },
];
