import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { autoRoutesPlugin, menuVisualizerPlugin } from './build-plugins';

export default defineConfig({
  plugins: [
    vue(),
    autoRoutesPlugin(),
    menuVisualizerPlugin({
      viewsPath: 'src/pages',
      menuConfigPath: 'src/modules/app/config/menu.config.ts',
      routeNamesPath: 'src/shared/constants/routeNames.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: true,
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-antd': ['ant-design-vue', '@ant-design/icons-vue'],
          'vendor-vxe': ['vxe-table', 'xe-utils'],
        },
      },
    },
  },
});
