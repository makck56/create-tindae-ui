import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { parseArgs } from '../src/cli.ts';
import { scaffold } from '../src/generator.ts';

test('parseArgs enables skipInstall with --no-install', async () => {
  const args = await parseArgs(['node', 'create-tindae-ui', 'demo-app', '--no-install']);

  assert.deepEqual(args, {
    projectName: 'demo-app',
    targetDir: resolve(process.cwd(), 'demo-app'),
    packageManager: 'pnpm',
    skipInstall: true,
    skipGit: false,
  });
});

test('parseArgs enables skipInstall with --skip-install', async () => {
  const args = await parseArgs(['node', 'create-tindae-ui', '--skip-install', 'demo-app']);

  assert.equal(args.skipInstall, true);
});

test('parseArgs enables skipGit with --skip-git', async () => {
  const args = await parseArgs(['node', 'create-tindae-ui', 'demo-app', '--skip-git']);

  assert.equal(args.skipGit, true);
});

test('parseArgs reads package manager from separated option value', async () => {
  const args = await parseArgs(['node', 'create-tindae-ui', 'demo-app', '--package-manager', 'npm']);

  assert.equal(args.packageManager, 'npm');
});

test('parseArgs reads package manager from equals option value', async () => {
  const args = await parseArgs(['node', 'create-tindae-ui', 'demo-app', '--package-manager=yarn']);

  assert.equal(args.packageManager, 'yarn');
});

test('parseArgs rejects unsupported package manager', async () => {
  await assert.rejects(
    () => parseArgs(['node', 'create-tindae-ui', 'demo-app', '--package-manager', 'bun']),
    /Package manager must be one of: pnpm, npm, yarn/,
  );
});

test('parseArgs rejects missing package manager value', async () => {
  await assert.rejects(
    () => parseArgs(['node', 'create-tindae-ui', 'demo-app', '--package-manager']),
    /Package manager must be one of: pnpm, npm, yarn/,
  );
});

test('scaffold copies root-level template docs such as design.md', () => {
  const tmpRoot = mkdtempSync(join(tmpdir(), 'create-tindae-ui-'));
  const targetDir = join(tmpRoot, 'demo-app');

  try {
    scaffold(targetDir, 'demo-app', { skipInstall: true, skipGit: true });

    assert.equal(existsSync(join(targetDir, 'design.md')), true);
    assert.equal(existsSync(join(targetDir, 'theme.md')), true);
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
  }
});

