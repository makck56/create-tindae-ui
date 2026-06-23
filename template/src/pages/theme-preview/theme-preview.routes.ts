import type { RouteRecordRaw } from 'vue-router';

/**
 * 主题预览域路由。
 *
 * meta.code = 'ThemePreview'：走 RBAC 权限校验（mock 的 admin 已内置该 code）；
 * 不设 keepAlive：示例页含 ECharts 实例，避免 keep-alive 下重复挂载的生命周期复杂度。
 *
 * 注：name 用字符串字面量，不引用 ROUTE_NAMES（该常量由 build-plugins/route-names 扫描
 * *.routes.ts 自动生成，dev/build 时会自动补上 ThemePreview 条目）。
 */
export const themePreviewRoutes: RouteRecordRaw[] = [
  {
    path: '/theme-preview',
    name: 'ThemePreview',
    meta: { code: 'ThemePreview', title: '主题预览' },
    component: () => import('./pages/ThemePreview.page.vue'),
  },
];
