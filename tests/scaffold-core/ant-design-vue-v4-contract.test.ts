import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const repoRoot = process.cwd();

function readWorkspaceFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8');
}

function collectTemplateSourceFiles(dir: string): string[] {
  return readdirSync(join(repoRoot, dir)).flatMap((entry) => {
    const relativePath = `${dir}/${entry}`;
    const absolutePath = join(repoRoot, relativePath);
    const stat = statSync(absolutePath);

    if (stat.isDirectory()) {
      return collectTemplateSourceFiles(relativePath);
    }

    if (!/\.(ts|vue)$/.test(entry) || relativePath === 'template/src/auto-components.d.ts') {
      return [];
    }

    return [relativePath];
  });
}

function readTemplateSourceFiles(): string {
  return collectTemplateSourceFiles('template/src')
    .map((path) => readWorkspaceFile(path))
    .join('\n');
}

test('template: Ant Design Vue v4 style entry and ConfigProvider token bridge contract', () => {
  const packageJson = JSON.parse(readWorkspaceFile('template/package.json')) as {
    dependencies: Record<string, string>;
  };
  const pluginSource = readWorkspaceFile('template/src/core/plugins/antd.ts');
  const appSource = readWorkspaceFile('template/src/App.vue');

  assert.match(packageJson.dependencies['ant-design-vue'], /^\^4\./);
  assert.match(packageJson.dependencies['@ant-design/icons-vue'], /^\^7\./);
  assert.equal(pluginSource.includes('ant-design-vue/dist/antd.css'), false);
  assert.equal(pluginSource.includes('ant-design-vue/dist/reset.css'), true);
  assert.match(appSource, /:theme="antDesignTheme"/);
});

test('template: Ant Design Vue overlay APIs no longer use v3 visible bindings', () => {
  const source = readTemplateSourceFiles();

  // BackToTop 等普通业务变量仍可叫 visible；这里只禁止 Ant overlay 模板绑定契约。
  assert.equal(source.includes('v-model:visible'), false);
  assert.equal(source.includes(':visible='), false);
  assert.equal(source.includes(' visible='), false);
  assert.equal(source.includes('a-mentions-option'), false);
});
