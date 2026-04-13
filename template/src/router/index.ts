import type { App } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import DefaultLayout from '@/layouts/Default.layout.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        redirect: '/user-management',
      },
      {
        path: '/user-management',
        name: 'UserManagement',
        component: () => import('@/pages/user-management/pages/UserList.page.vue'),
      },
      {
        path: '/user-management/:id',
        name: 'UserManagementDetail',
        component: () => import('@/pages/user-management/pages/UserDetail.page.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export function setupRouter(app: App): void {
  app.use(router);
}
