import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import { setupRouter } from './router';
import { setupAntd } from './core/plugins/antd';
import { setupEcharts } from './core/plugins/echarts';
import { setupVxeTable } from './core/plugins/vxeTable';
import './assets/styles/tailwind.css';
import './assets/styles/global.css';

const app = createApp(App);

app.use(createPinia());
setupAntd(app);
setupEcharts(app);
setupVxeTable(app);
setupRouter(app);

app.mount('#app');
