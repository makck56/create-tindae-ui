import type { RouteRecordRaw } from 'vue-router';

export const userManagementRoutes: RouteRecordRaw[] = [
  {
    path: '/user-management',
    name: 'UserManagement',
    meta: { code: 'UserManagement', title: '用户管理', keepAlive: true },
    component: () => import('./pages/UserList.page.vue'),
  },
];
