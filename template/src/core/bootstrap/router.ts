import { createRouter, createWebHistory } from 'vue-router';
import type { App } from 'vue';
import DefaultLayout from '@/layouts/Default.layout.vue';
import { useAuthStore } from '@/modules/auth/stores/auth';
import { useAppStore } from '@/modules/app/stores/app';
import type { MenuItem } from '@/modules/app/config/menuTypes';
import { loginRoutes } from '@/pages/login/login.routes';
import { errorChildRoutes } from '@/pages/error/error.routes';
import { userManagementRoutes } from '@/pages/user-management/user-management.routes';
// @scaffold:domain-import ← 新域路由 import 在此行上方插入（由 scaffold:domain 自动维护，请勿删除）

const routes = [
  ...loginRoutes,
  {
    path: '/',
    component: DefaultLayout,
    children: [
      ...userManagementRoutes,
      // @scaffold:domain-route ← 新域路由在此行上方插入（由 scaffold:domain 自动维护，请勿删除）
      // 错误页子路由（403/404）置于所有业务路由之后：渲染在主内容区（保留侧边栏/顶栏/TabBar），
      // 用户仍可导航到其他菜单，而非被错误页占满整个视口；catch-all 仅兜底未匹配路径。
      ...errorChildRoutes,
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

/**
 * 取菜单树中第一个带 routeName 的叶子，作为登录后的默认落地页。
 * 用于「已登录访问 /login」时跳转。
 */
function firstMenuRouteName(items: MenuItem[]): string | undefined {
  for (const it of items) {
    if (it.routeName) return it.routeName;
    if (it.children?.length) {
      const child = firstMenuRouteName(it.children);
      if (child) return child;
    }
  }
  return undefined;
}

/**
 * 全局路由守卫（默认拒绝模型）。
 *
 * 判定顺序：
 * 1. `meta.public`（登录 / 403 / 404）→ 放行；其中已登录访问 /login → 跳首个业务菜单；
 * 2. 其余路由一律需登录——未登录跳 /login（带 redirect 回跳）；
 * 3. fetchUser 拉取真失败 → /403；
 * 4. 路由声明了 `meta.code` 但用户无此权限 → /403；
 * 5. 容器 / 布局路由（无 meta.code，如布局壳）→ 已登录即放行。
 *
 * 「默认拒绝」体现在：除 `meta.public` 外都要登录，且带 code 的业务路由必须显式通过权限校验——
 * 忘了给业务路由写 meta.code 也不会静默放行（守卫仍要求登录，且容器路由仅指布局壳）。
 *
 * 注：/403、/404 为 DefaultLayout 的子路由，守卫 `return '/403'` 后会渲染在【主内容区】，
 * 保留布局壳——用户仍可操作侧边栏切到其他有权限的菜单。
 */
router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  // 1) 公共路由
  if (to.meta.public) {
    if (to.path === '/login' && authStore.user) {
      const first = firstMenuRouteName(authStore.menus);
      return first ? { name: first } : '/';
    }
    return true;
  }

  // 2) 首次进入：恢复用户态（fetchUser 内部拉取后端菜单树）
  if (!authStore.initialized) {
    await authStore.fetchUser();
  }

  // 3) 未登录 → 登录页（带回跳）
  if (!authStore.user) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }

  // 4) 拉取用户信息真失败 → 无权限页
  if (authStore.error) {
    return '/403';
  }

  // 5) 有权限码但无权限 → 403
  if (to.meta.code && !authStore.hasPermission(to.meta.code)) {
    return '/403';
  }

  // 6) 容器 / 布局路由（无 code）或已授权业务路由 → 放行
  return true;
});

export function setupRouter(app: App) {
  app.use(router);

  // 页面标题：按路由 meta.title 动态设置浏览器标签页标题，复用应用名作为后缀。
  // afterEach 在每次导航成功后触发（含首次进入），此时 Pinia 已就绪，可安全读取 appStore.appName。
  router.afterEach((to) => {
    const appName = useAppStore().appName;
    const title = to.meta.title as string | undefined;
    document.title = title ? `${title} - ${appName}` : appName;
  });
}
