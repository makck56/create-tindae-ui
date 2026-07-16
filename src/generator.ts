import { existsSync, renameSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { copyDir } from './utils/fs.js';
import { setProjectName } from './utils/pkg.js';
import type { PackageManager } from './cli.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface ScaffoldOptions {
  packageManager?: PackageManager;
  skipInstall?: boolean;
  skipGit?: boolean;
}

function resolveTemplateDir(): string {
  const candidates = [
    resolve(__dirname, '..', 'template'),
    resolve(__dirname, '..', '..', 'template'),
  ];

  const templateDir = candidates.find((candidate) => existsSync(candidate));
  if (!templateDir) {
    throw new Error(`Template directory does not exist. Tried: ${candidates.join(', ')}`);
  }

  return templateDir;
}

/**
 * 将模板里的 .npmrc.template 还原为标准 .npmrc。
 *
 * 背景：npm 在发布包时会【硬排除】名为 .npmrc 的文件（防止凭据随包泄露），
 *      因此模板内只能以 .npmrc.template 入库与发布；生成项目时需把它重命名
 *      回 .npmrc，内网镜像源配置才能在目标项目里真正生效。
 */
function restoreNpmrc(targetDir: string): void {
  const templatePath = resolve(targetDir, '.npmrc.template');
  if (existsSync(templatePath)) {
    renameSync(templatePath, resolve(targetDir, '.npmrc'));
  }
}

function getDevCommand(packageManager: PackageManager): string {
  return packageManager === 'npm' ? 'npm run dev' : `${packageManager} dev`;
}

export function scaffold(targetDir: string, projectName: string, options: ScaffoldOptions = {}): void {
  const templateDir = resolveTemplateDir();
  const packageManager = options.packageManager ?? 'pnpm';

  console.log(`\n✨ Scaffolding tindae-ui project in ${targetDir}...\n`);
  console.log('   ├── Copying template...');
  copyDir(templateDir, targetDir);

  console.log('   ├── Restoring .npmrc (from .npmrc.template)...');
  restoreNpmrc(targetDir);

  console.log('   ├── Setting project name...');
  setProjectName(targetDir, projectName);

  if (options.skipInstall) {
    console.log('   ├── Skipping dependency installation...');
  } else {
    console.log(`   ├── Installing dependencies via ${packageManager}...`);
    try {
      execSync(`${packageManager} install`, { cwd: targetDir, stdio: 'inherit' });
    } catch {
      console.warn(`   ⚠️  ${packageManager} install failed. You can run it manually later.`);
    }
  }

  if (options.skipGit) {
    console.log('   ├── Skipping git initialization...');
  } else {
    console.log('   ├── Initializing git repository...');
    try {
      execSync('git init', { cwd: targetDir, stdio: 'pipe' });
      execSync('git add -A', { cwd: targetDir, stdio: 'pipe' });
      execSync('git commit -m "chore: initialize project via create-tindae-ui"', {
        cwd: targetDir,
        stdio: 'pipe',
      });
    } catch {
      console.warn('   ⚠️  git init failed. You can initialize git manually.');
    }
  }

  console.log(`
✅ Done! Next steps:

  cd ${projectName}
  ${getDevCommand(packageManager)}
`);
}
