import type { App } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import DefaultLayout from '@/layouts/Default.layout.vue';
import { useAuthStore } from '@/modules/auth/stores/auth';

const WHITE_LIST = ['/login', '/403'];

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/login/pages/Login.page.vue'),
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/pages/error/pages/Forbidden.page.vue'),
  },
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
        meta: { code: 'user-management' },
        component: () => import('@/pages/user-management/pages/UserList.page.vue'),
      },
      {
        path: '/user-management/:id',
        name: 'UserManagementDetail',
        meta: { code: 'user-management' },
        component: () => import('@/pages/user-management/pages/UserDetail.page.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  // 已登录用户访问 /login → 重定向到首页
  if (to.path === '/login') {
    if (!authStore.initialized) {
      await authStore.fetchUser();
    }
    if (authStore.user) {
      return '/';
    }
    return true;
  }

  if (WHITE_LIST.includes(to.path)) return true;

  if (!authStore.initialized) {
    await authStore.fetchUser();
  }

  // 未登录 → 跳登录页
  if (!authStore.user) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }

  // 网络错误
  if (authStore.error) {
    return '/403';
  }

  if (!to.meta.code) return true;

  if (!authStore.hasPermission(to.meta.code)) {
    return '/403';
  }
});

export function setupRouter(app: App): void {
  app.use(router);
}
