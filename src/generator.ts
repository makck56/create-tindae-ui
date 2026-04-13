import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { copyDir } from './utils/fs.js';
import { setProjectName } from './utils/pkg.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function scaffold(targetDir: string, projectName: string): void {
  const templateDir = resolve(__dirname, '..', '..', 'template');

  console.log(`\n✨ Scaffolding tindae-ui project in ${targetDir}...\n`);
  console.log('   ├── Copying template...');
  copyDir(templateDir, targetDir);

  console.log('   ├── Setting project name...');
  setProjectName(targetDir, projectName);

  console.log('   ├── Installing dependencies via pnpm...');
  try {
    execSync('pnpm install', { cwd: targetDir, stdio: 'inherit' });
  } catch {
    console.warn('   ⚠️  pnpm install failed. You can run it manually later.');
  }

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

  console.log(`
✅ Done! Next steps:

  cd ${projectName}
  pnpm dev
`);
}
