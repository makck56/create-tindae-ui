/**
 * Vite 插件
 * 提供路由名称常量生成和一致性检查功能
 */

import type { Plugin } from 'vite';
import { generateNames } from './generator.js';
import { checkRouteNameConsistency, printConsistencyReport } from './checker.js';
import type { RouteNamesPluginOptions } from './types.js';

const DEFAULT_OUTPUT_FILE = 'src/shared/constants/routeNames.ts';

/**
 * 创建路由名称插件
 * @param options 插件配置
 * @returns Vite 插件
 */
export function createRouteNamesPlugin(options: RouteNamesPluginOptions = {}): Plugin {
  const {
    outputFile = DEFAULT_OUTPUT_FILE,
    enableCheck = true,
    strict = false,
  } = options;

  return {
    name: 'vite-plugin-route-names',

    // 构建开始时运行
    buildStart() {
      generateNames(outputFile);

      if (enableCheck) {
        const report = checkRouteNameConsistency({ outputFile });
        printConsistencyReport(report);

        if (strict && report.unmatched > 0) {
          throw new Error(
            `发现 ${report.unmatched} 个路由名称不一致，请修复后继续`
          );
        }
      }
    },

    // 热更新处理
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.routes.ts')) {
        generateNames(outputFile);

        if (enableCheck) {
          const report = checkRouteNameConsistency({ outputFile });
          printConsistencyReport(report);
        }

        // 通知客户端刷新
        server.ws.send({
          type: 'full-reload',
          path: '*',
        });
      }
    },
  };
}

// 向后兼容的导出名
export const autoRoutesPlugin = createRouteNamesPlugin;
