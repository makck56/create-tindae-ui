import { existsSync } from 'node:fs';
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

function getDevCommand(packageManager: PackageManager): string {
  return packageManager === 'npm' ? 'npm run dev' : `${packageManager} dev`;
}

export function scaffold(targetDir: string, projectName: string, options: ScaffoldOptions = {}): void {
  const templateDir = resolveTemplateDir();
  const packageManager = options.packageManager ?? 'pnpm';

  console.log(`\n✨ Scaffolding tindae-ui project in ${targetDir}...\n`);
  console.log('   ├── Copying template...');
  copyDir(templateDir, targetDir);

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
