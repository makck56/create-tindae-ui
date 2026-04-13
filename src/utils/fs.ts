import { cpSync, mkdirSync, existsSync } from 'node:fs';

/**
 * Recursively copy a directory. Works on Node 16.7+.
 */
export function copyDir(src: string, dest: string): void {
  if (!existsSync(src)) {
    throw new Error(`Source directory does not exist: ${src}`);
  }
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true, filter: (srcPath) => {
    return !srcPath.includes('node_modules');
  }});
}
