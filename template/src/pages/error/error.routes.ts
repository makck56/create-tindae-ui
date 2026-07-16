import type { RouteRecordRaw } from 'vue-router';

/**
 * 错误页子路由（403 无权限 / 404 未找到）。
 *
 * 设计：作为 DefaultLayout 的 children 挂载——错误页渲染在【主内容区】（布局的 router-view），
 * 保留侧边栏 / 顶栏 / TabBar，用户仍可导航到其他菜单，而非被错误页占满整个视口。
 *
 * ⚠️ 必须放在所有业务子路由【之后】：catch-all `:pathMatch(.*)*` 的路径优先级（ranking）最低，
 * 只兜底未匹配路径，不会抢先匹配 /user-management 等真实路由（Vue Router 4 按 ranking 匹配）；
 * /login 等顶层公共路由 ranking 更高，亦不受影响。
 */
export const errorChildRoutes: RouteRecordRaw[] = [
  {
    path: '403',
    name: 'Forbidden',
    component: () => import('./pages/Forbidden.page.vue'),
    meta: { public: true },
  },
  {
    path: ':pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('./pages/NotFound.page.vue'),
    meta: { public: true },
  },
];
