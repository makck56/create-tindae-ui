import type { RouteRecordRaw } from 'vue-router';

export const loginRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('./pages/Login.page.vue'),
    meta: { public: true },
  },
];
