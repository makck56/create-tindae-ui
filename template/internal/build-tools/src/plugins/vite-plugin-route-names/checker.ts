/**
 * 路由名称一致性检查器
 * 检查路由名称与组件 defineOptions name 是否一致
 */

import path from 'node:path';
import { parseVueFile } from './parser.js';
import { scanRouteFiles } from './scanner.js';
import type { CheckOptions, ConsistencyCheckReport, ComponentCheckResult } from './types.js';

/**
 * 检查路由名称一致性
 * @param _options 检查选项（暂未使用）
 * @returns 检查报告
 */
export function checkRouteNameConsistency(
  _options: CheckOptions = {}
): ConsistencyCheckReport {
  const routes = scanRouteFiles();
  const results: ComponentCheckResult[] = [];

  for (const route of routes) {
    const parsed = parseVueFile(route.pageContent);

    results.push({
      pagePath: route.absolutePagePath,
      routeName: route.name,
      componentName: parsed?.componentName || null,
      hasDefineOptions: parsed?.hasDefineOptions || false,
      isMatch: parsed?.componentName === route.name,
    });
  }

  const matched = results.filter((r) => r.isMatch).length;

  return {
    total: results.length,
    matched,
    unmatched: results.length - matched,
    details: results,
  };
}

/**
 * 打印一致性检查报告
 * @param report 检查报告
 */
export function printConsistencyReport(report: ConsistencyCheckReport): void {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 [AutoRoutes] 路由名称一致性检查报告');
  console.log('='.repeat(60));

  if (report.total === 0) {
    console.log('⚠️  未找到任何路由配置');
    console.log('='.repeat(60) + '\n');
    return;
  }

  console.log(`\n📊 统计: ${report.total} 个路由, ${report.matched} ✅, ${report.unmatched} ❌\n`);

  // 打印详情
  report.details.forEach((detail) => {
    const relativePath = path.relative(process.cwd(), detail.pagePath);
    const statusIcon = detail.isMatch ? '✅' : '❌';

    console.log(`${statusIcon} ${relativePath}`);
    console.log(`   路由名: ${detail.routeName}`);

    if (!detail.hasDefineOptions) {
      console.log(`   组件名: (未定义 defineOptions)`);
      console.log(`   建议: 添加 defineOptions({ name: '${detail.routeName}' })`);
    } else if (!detail.isMatch) {
      console.log(`   组件名: ${detail.componentName}`);
      console.log(`   建议: 修改为 defineOptions({ name: '${detail.routeName}' })`);
    } else {
      console.log(`   组件名: ${detail.componentName}`);
    }

    console.log('');
  });

  console.log('='.repeat(60) + '\n');

  // 如果有不匹配的情况，给出提示
  if (report.unmatched > 0) {
    console.log('⚠️  发现问题:');
    console.log('   1. KeepAlive 缓存可能无法正常工作');
    console.log('   2. 无法精确控制缓存生命周期');
    console.log('   请按照上述建议修复不一致的路由\n');
  }
}
