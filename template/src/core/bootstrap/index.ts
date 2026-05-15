import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from '@/App.vue';
import { setupRouter } from './router';
import { setupAntd } from '@/core/plugins/antd';
import { setupEcharts } from '@/core/plugins/echarts';
import { setupVxeTable } from '@/core/plugins/vxeTable';
import '@/assets/styles/tailwind.css';
import '@/assets/styles/global.css';

export { router } from './router';

export function setupApp() {
  const app = createApp(App);

  // 1. Core plugins (Pinia must precede Router)
  app.use(createPinia());
  setupRouter(app);

  // 2. UI libraries
  setupAntd(app);
  setupEcharts(app);
  setupVxeTable(app);

  app.mount('#app');
}
