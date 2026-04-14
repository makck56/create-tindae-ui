import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { autoRoutesPlugin, menuVisualizerPlugin } from '@internal/build-tools';

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
    port: 3000,
    open: true,
  },
});
