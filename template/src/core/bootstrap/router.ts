import { createRouter, createWebHistory } from 'vue-router';
import type { App } from 'vue';
import DefaultLayout from '@/layouts/Default.layout.vue';
import { useAuthStore } from '@/modules/auth/stores/auth';
import { loginRoutes } from '@/pages/login/login.routes';
import { errorRoutes } from '@/pages/error/error.routes';
import { userManagementRoutes } from '@/pages/user-management/user-management.routes';
// @scaffold:domain-import ← 新域路由 import 在此行上方插入（由 scaffold:domain 自动维护，请勿删除）

const WHITE_LIST = ['/login', '/403'];

const routes = [
  ...loginRoutes,
  ...errorRoutes,
  {
    path: '/',
    component: DefaultLayout,
    children: [
      { path: '', redirect: '/user-management' },
      ...userManagementRoutes,
      // @scaffold:domain-route ← 新域路由在此行上方插入（由 scaffold:domain 自动维护，请勿删除）
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

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

  if (!authStore.user) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }

  if (authStore.error) {
    return '/403';
  }

  if (!to.meta.code) return true;

  if (!authStore.hasPermission(to.meta.code)) {
    return '/403';
  }
});

export function setupRouter(app: App) {
  app.use(router);
}
