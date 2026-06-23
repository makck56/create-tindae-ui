import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { message } from 'ant-design-vue';
import App from '@/App.vue';
import { setupRouter, router } from './router';
import { configureHttp } from '@/core/http';
import { vPermission } from '@/shared/directives/permission';
import { useAuthStore } from '@/modules/auth/stores/auth';
import { refreshAccessToken as refreshAccessTokenApi } from '@/modules/auth/api/auth.api';
import '@/core/plugins/antd';
import { setupEcharts } from '@/core/plugins/echarts';
import { setupVxeTable } from '@/core/plugins/vxeTable';
import { setupTheme } from '@/core/theme';
import { isBrowserSupported, renderUnsupportedBrowser } from '@/core/browser-support';
import { setupTab } from '@/layouts/tab';
import '@/assets/styles/tailwind.css';
import '@/assets/styles/global.css';

export { router } from './router';

export function setupApp() {
  // 0. 浏览器版本门槛（A 方案）：不达标 → 渲染整页「请升级浏览器」提示、不挂载应用。
  //    放在最前：不兼容时连 createApp / 注册插件都无需执行，直接阻断（vanilla DOM 提示，不依赖 Vue）。
  //    下限见 core/browser-support/config.ts，调整需同步 package.json 的 browserslist。
  if (!isBrowserSupported()) {
    renderUnsupportedBrowser();
    return;
  }

  const app = createApp(App);

  // 0. 全局错误兜底：捕获未被 ErrorBoundary / try-catch 处理的错误
  //    （事件回调、setup 同步异常、未捕获的 Promise reject）。
  //    与 DefaultLayout 内的 ErrorBoundary 分工：此处兜底「非渲染期」错误，
  //    ErrorBoundary 兜底「渲染期」错误（局部 fallback）。DEV 打印便于排查；生产可接入上报（Sentry 等）。
  app.config.errorHandler = (err, _instance, info) => {
    if (import.meta.env.DEV) {
      console.error('[app:error]', err, info);
    }
    // TODO: 生产环境接入错误上报
  };

  // 1. Core plugins (Pinia must precede Router)
  app.use(createPinia());
  // 注册全局按钮级权限指令 v-permission（指令运行时读取 auth store，须在 Pinia 之后注册）
  app.directive('permission', vPermission);
  setupRouter(app);

  // 2. 注入 HTTP 运行时依赖（含 Token 无感续期）。
  //    core/http 不直接 import router / pinia / auth.api（避免循环依赖），
  //    全部能力在此以回调注入。必须在 Pinia 就绪后调用（回调运行时会用到 auth store）。
  configureHttp({
    // getToken / getRefreshToken / isTokenExpiring 用 core/http 默认实现（读 localStorage）

    // 续期核心：用 refresh token 换新 access token（供主动刷新 + 401 兜底共用）
    refreshAccessToken: async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('无 refresh token，无法续期');
      const res = await refreshAccessTokenApi(refreshToken);
      if (res.code !== 0) {
        throw new Error(res.message || '刷新登录态失败');
      }
      return { accessToken: res.data.accessToken, expiresIn: res.data.expiresIn };
    },
    // 续期成功：更新本地 access token 与过期时间戳（refresh token 沿用旧的）
    onTokenRefreshed: ({ accessToken, expiresIn }) => {
      localStorage.setItem('token', accessToken);
      if (expiresIn) {
        localStorage.setItem('tokenExpiresAt', String(Date.now() + expiresIn * 1000));
      }
    },
    // 续期彻底失败（refresh token 也过期）/ 未启用续期的 401 → 登出 + 跳登录
    onUnauthorized: () => {
      const authStore = useAuthStore();
      // 不 await：清态异步进行，不阻塞当前请求的 Promise 链
      void authStore.logout();
      router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } });
    },
    onNetworkError: (error) => {
      message.error(error.message);
    },
  });

  // 3. Tab (must be after Pinia + Router)
  setupTab(router);

  // 4. UI libraries
  setupEcharts(app);
  setupVxeTable(app);

  // 5. 主题系统：mount 前预应用持久化主题（亮/暗 + 预设主色）到 :root，避免首屏闪烁（FOUC）；
  //    同时注入 antd / vxe-table 覆盖样式，实现 Tailwind / antd / VXE 三端统一换肤。
  //    后续主题切换由 ThemeProvider（App.vue 根处）监听 store 自动响应。
  setupTheme();

  app.mount('#app');
}
