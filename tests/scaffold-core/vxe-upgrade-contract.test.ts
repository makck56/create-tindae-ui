import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const repoRoot = process.cwd();

function readWorkspaceFile(relativePath: string) {
  return readFileSync(join(repoRoot, relativePath), 'utf8');
}

test('template/src 不再依赖已移除的 VXE 内部类型路径', () => {
  const useCrossPageGridSource = readWorkspaceFile(
    'template/src/shared/components/cross-page-select/useCrossPageGrid.ts',
  );
  const readmeSource = readWorkspaceFile(
    'template/src/shared/components/cross-page-select/README.md',
  );

  assert.equal(useCrossPageGridSource.includes('vxe-table/types/grid'), false);
  assert.equal(useCrossPageGridSource.includes('vxe-table/types/table'), false);
  assert.equal(readmeSource.includes('vxe-table/types/grid'), false);
});

test('vxeTable 插件不再引用新版已删除的深路径入口', () => {
  const pluginSource = readWorkspaceFile('template/src/core/plugins/vxeTable.ts');

  [
    'vxe-table/es/checkbox',
    'vxe-table/es/filter',
    'vxe-table/es/vxe-pager',
    'vxe-table/es/vxe-modal',
    'vxe-table/es/tooltip',
  ].forEach((removedPath) => {
    assert.equal(
      pluginSource.includes(removedPath),
      false,
      `unexpected removed path: ${removedPath}`,
    );
  });
});
