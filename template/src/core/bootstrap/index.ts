import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { message } from 'ant-design-vue';
import App from '@/App.vue';
import { setupRouter, router } from './router';
import { configureHttp } from '@/core/http';
import { useAuthStore } from '@/modules/auth/stores/auth';
import { refreshAccessToken as refreshAccessTokenApi } from '@/modules/auth/api/auth.api';
import '@/core/plugins/antd';
import { setupEcharts } from '@/core/plugins/echarts';
import { setupVxeTable } from '@/core/plugins/vxeTable';
import { setupTab } from '@/layouts/tab';
import '@/assets/styles/tailwind.css';
import '@/assets/styles/global.css';

export { router } from './router';

export function setupApp() {
  const app = createApp(App);

  // 1. Core plugins (Pinia must precede Router)
  app.use(createPinia());
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

  app.mount('#app');
}
