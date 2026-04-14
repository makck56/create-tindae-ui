// 路由名称插件
export {
  autoRoutesPlugin,
  createRouteNamesPlugin,
  runConsistencyCheck,
  runRouteNamesFix,
  generateNames,
  runCli,
} from './plugins/vite-plugin-route-names/index.js';

export type {
  RouteNamesPluginOptions,
  ConsistencyCheckReport,
  FixReport,
} from './plugins/vite-plugin-route-names/index.js';

// 菜单可视化插件
export { default as menuVisualizerPlugin } from './plugins/menu-visualizer/index.js';
