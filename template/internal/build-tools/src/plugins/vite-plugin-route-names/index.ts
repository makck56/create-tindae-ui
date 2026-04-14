/**
 * 路由名称插件统一导出
 */

// Vite 插件
export { autoRoutesPlugin, createRouteNamesPlugin } from './plugin.js';

// 检查功能
export { checkRouteNameConsistency as runConsistencyCheck, printConsistencyReport } from './checker.js';

// 警告功能（仅输出警告，不修改文件）
export { fixRouteNames as runRouteNamesFix } from './fixer.js';

// 生成功能
export { generateNames } from './generator.js';

// CLI 接口
export { runCli } from './cli.js';

// 类型
export type {
  RouteNamesPluginOptions,
  CheckOptions,
  FixOptions,
  ComponentCheckResult,
  ConsistencyCheckReport,
  FixResult,
  FixReport,
  ParsedScriptSetup,
  RouteInfo,
  RouteNameEntry,
  DomainRouteMap,
} from './types.js';
