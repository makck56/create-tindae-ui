import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { copyDir } from '../../src/utils/fs.ts';

test('copyDir 排除 ignore 中的目录前缀', () => {
  const src = mkdtempSync(join(tmpdir(), 'copydir-src-'));
  const dest = mkdtempSync(join(tmpdir(), 'copydir-dest-'));
  try {
    mkdirSync(join(src, 'docs', 'superpowers'), { recursive: true });
    writeFileSync(join(src, 'docs', 'superpowers', 'plan.md'), '# plan');
    writeFileSync(join(src, 'docs', 'keep.md'), 'keep');
    writeFileSync(join(src, 'package.json'), '{}');

    copyDir(src, dest, ['docs/superpowers', 'node_modules']);

    assert.equal(existsSync(join(dest, 'docs', 'superpowers', 'plan.md')), false);
    assert.equal(existsSync(join(dest, 'docs', 'keep.md')), true);
    assert.equal(existsSync(join(dest, 'package.json')), true);
  } finally {
    rmSync(src, { recursive: true, force: true });
    rmSync(dest, { recursive: true, force: true });
  }
});

test('copyDir 排除 ignore 中的精确文件路径', () => {
  const src = mkdtempSync(join(tmpdir(), 'copydir-src-'));
  const dest = mkdtempSync(join(tmpdir(), 'copydir-dest-'));
  try {
    mkdirSync(join(src, 'docs'), { recursive: true });
    writeFileSync(join(src, 'docs', 'optimization-candidates.md'), 'todo');
    writeFileSync(join(src, 'docs', 'keep.md'), 'keep');

    copyDir(src, dest, ['docs/optimization-candidates.md']);

    assert.equal(existsSync(join(dest, 'docs', 'optimization-candidates.md')), false);
    assert.equal(existsSync(join(dest, 'docs', 'keep.md')), true);
  } finally {
    rmSync(src, { recursive: true, force: true });
    rmSync(dest, { recursive: true, force: true });
  }
});

test('copyDir 默认排除 node_modules', () => {
  const src = mkdtempSync(join(tmpdir(), 'copydir-src-'));
  const dest = mkdtempSync(join(tmpdir(), 'copydir-dest-'));
  try {
    mkdirSync(join(src, 'node_modules', 'pkg'), { recursive: true });
    writeFileSync(join(src, 'node_modules', 'pkg', 'index.js'), 'module.exports = 1;');
    writeFileSync(join(src, 'package.json'), '{}');

    copyDir(src, dest);

    assert.equal(existsSync(join(dest, 'node_modules')), false);
    assert.equal(existsSync(join(dest, 'package.json')), true);
  } finally {
    rmSync(src, { recursive: true, force: true });
    rmSync(dest, { recursive: true, force: true });
  }
});
