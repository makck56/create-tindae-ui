import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import { resolve } from 'path';
import { autoRoutesPlugin, menuVisualizerPlugin, defineRenderPlugin } from './build-plugins';

// 用 async 配置：legacy 插件需 dynamic import 按需加载（默认不安装该包），只能在异步上下文 await。
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const plugins = [
    vue(),
    tailwindcss(),
    defineRenderPlugin(),
    autoRoutesPlugin(),
    Components({
      resolvers: [AntDesignVueResolver({ importStyle: false })],
      dts: 'src/auto-components.d.ts',
    }),
    menuVisualizerPlugin({
      viewsPath: 'src/pages',
      menuConfigPath: 'src/modules/app/config/menu.config.ts',
      routeNamesPath: 'src/shared/constants/routeNames.ts',
    }),
  ];

  /**
   * B 方案（可选）：legacy 降级，兼容更老浏览器。
   * - 默认关闭（保持最小依赖、产物更小）；此时仅 A 方案的「运行时不达标则提示」生效。
   * - 开启方式：先 `pnpm add -D @vitejs/plugin-legacy terser`，再在 env（如 .env.production）设
   *   VITE_LEGACY_BUILD=true。产物会额外输出 SystemJS + polyfill 包，老浏览器可实际运行。
   * - 用 dynamic import 按需加载：未开启 / 未安装均不引入该包，避免默认增加依赖与构建耗时；
   *   开启但未安装时抛清晰报错指引安装。
   */
  if (env.VITE_LEGACY_BUILD === 'true') {
    let legacy: (opts: { targets: string[] }) => unknown;
    try {
      // @ts-expect-error —— 该包按需安装，未安装时 TS「找不到模块」属预期；运行时由下方 catch 守卫
      legacy = (await import('@vitejs/plugin-legacy')).default;
    } catch {
      throw new Error(
        '[vite.config] 已开启 VITE_LEGACY_BUILD=true，但未安装 @vitejs/plugin-legacy。\n' +
          '请先执行：pnpm add -D @vitejs/plugin-legacy terser',
      );
    }
    // targets 比 A 方案运行时下限更宽松（真正兼容到 ~2018 年浏览器）
    plugins.push(legacy({ targets: ['Chrome >= 64', 'Edge >= 79', 'Firefox >= 67', 'Safari >= 12'] }));
  }

  return {
    plugins,
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
          // 函数形式：按模块路径把「已在打包图中」的依赖归类到 vendor chunk。
          // 切勿用对象形式 { vendor: ['ant-design-vue'] }——那会按包入口(es/index.js)
          // + 其全部依赖解析，而 antd 入口 import * as components(全组件)，
          // 会强制把整个 antd 图拉进包，破坏 tree-shaking。
          manualChunks(id) {
            if (id.includes('ant-design-vue') || id.includes('@ant-design/icons-vue')) {
              return 'vendor-antd';
            }
            if (id.includes('vxe-table') || id.includes('xe-utils')) {
              return 'vendor-vxe';
            }
          },
        },
      },
    },
  };
});
