import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { message } from 'ant-design-vue';
import App from '@/App.vue';
import { setupRouter, router } from './router';
import { configureHttp } from '@/core/http';
import { useAuthStore } from '@/modules/auth/stores/auth';
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

  // 2. 注入 HTTP 运行时依赖：token 获取、401 跳登录、网络错误提示。
  //    core/http 被设计为「零业务依赖」的底层模块——它不直接 import router/pinia，
  //    而是在此通过 configureHttp 把这些能力以回调注入，避免 http ↔ store/api 的循环依赖。
  //    注意：必须在 Pinia 就绪之后调用，因为回调运行时会用到 auth store。
  configureHttp({
    getToken: () => localStorage.getItem('token'),
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
