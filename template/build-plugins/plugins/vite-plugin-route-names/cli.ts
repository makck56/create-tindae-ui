/**
 * CLI 命令行接口（插件内部）
 * 提供命令行调用检查和生成功能
 */

import { checkRouteNameConsistency, printConsistencyReport } from './checker.js';
import { generateNames } from './generator.js';

/**
 * 运行 CLI 命令
 * @param args 命令行参数
 * @returns 退出码
 */
export async function runCli(args: string[]): Promise<number> {
  const command = args[0] || 'check';

  try {
    switch (command) {
      case 'check': {
        const report = checkRouteNameConsistency({
          format: args.includes('--json') ? 'json' : 'text',
        });

        if (args.includes('--json')) {
          console.log(JSON.stringify(report, null, 2));
        } else {
          printConsistencyReport(report);
        }

        return report.unmatched > 0 ? 1 : 0;
      }

      case 'generate': {
        generateNames();
        console.log('路由常量文件已生成');
        return 0;
      }

      default:
        console.error(`未知命令: ${command}`);
        console.error('可用命令: check, generate');
        console.error('');
        console.error('用法:');
        console.error('  check [--json]   检查路由名称一致性');
        console.error('  generate          生成路由常量文件');
        return 1;
    }
  } catch (error) {
    console.error('执行失败:', error);
    return 1;
  }
}
