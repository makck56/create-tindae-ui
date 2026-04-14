/**
 * 路由名称检查器（仅警告，不自动修复）
 * 检测到不一致时输出警告信息，由开发者手动修复
 */

import { parseVueFile } from './parser.js';
import { scanRouteFiles } from './scanner.js';
import type { FixReport, FixResult } from './types.js';

/**
 * 检查路由名称一致性，输出警告（不修改文件）
 */
export async function fixRouteNames(): Promise<FixReport> {
  const routes = scanRouteFiles();
  const results: FixResult[] = [];

  for (const route of routes) {
    const parsed = parseVueFile(route.pageContent);

    if (!parsed) {
      continue;
    }

    if (!parsed.hasDefineOptions) {
      console.warn(
        `⚠️  ${route.absolutePagePath}\n` +
        `   路由名: ${route.name}\n` +
        `   缺少 defineOptions({ name: '${route.name}' })，请手动添加`
      );
      results.push({
        filePath: route.absolutePagePath,
        routeName: route.name,
        action: 'inject',
      });
    } else if (parsed.componentName !== route.name) {
      console.warn(
        `⚠️  ${route.absolutePagePath}\n` +
        `   路由名: ${route.name}\n` +
        `   组件名: ${parsed.componentName ?? '(未定义)'}\n` +
        `   不一致，请手动修改 defineOptions 中的 name`
      );
      results.push({
        filePath: route.absolutePagePath,
        routeName: route.name,
        action: 'replace',
      });
    }
  }

  const fixed = results.length;

  return {
    total: routes.length,
    fixed,
    skipped: routes.length - fixed,
    results,
  };
}
