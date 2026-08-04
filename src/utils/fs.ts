import { cpSync, mkdirSync, existsSync } from 'node:fs';
import { relative } from 'node:path';

/** 默认排除项，保持未传 ignore 时的历史行为（仅排除 node_modules）。 */
const DEFAULT_IGNORE = ['node_modules'];

/**
 * 递归复制目录（Node 16.7+）。
 *
 * @param src    源目录
 * @param dest   目标目录
 * @param ignore 相对 src 的 POSIX 路径黑名单：精确匹配或目录前缀（条目/...）匹配。
 *               默认排除 node_modules。
 */
export function copyDir(src: string, dest: string, ignore: string[] = DEFAULT_IGNORE): void {
  if (!existsSync(src)) {
    throw new Error(`Source directory does not exist: ${src}`);
  }
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, {
    recursive: true,
    filter: (srcPath) => {
      // 统一为 POSIX 相对路径，兼容 Windows 反斜杠
      const rel = relative(src, srcPath).split('\\').join('/');
      // 根目录本身（rel === '.'）永远保留
      return rel === '.' || !ignore.some((pat) => rel === pat || rel.startsWith(`${pat}/`));
    },
  });
}
