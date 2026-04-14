import type { RouteRecordRaw } from 'vue-router';

export const userManagementRoutes: RouteRecordRaw[] = [
  {
    path: '/user-management',
    name: 'UserManagement',
    meta: { code: 'user-management' },
    component: () => import('./pages/UserList.page.vue'),
  },
  {
    path: '/user-management/:id',
    name: 'UserManagementDetail',
    meta: { code: 'user-management' },
    component: () => import('./pages/UserDetail.page.vue'),
  },
];
