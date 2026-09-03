import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
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

test('template: layout keeps the light sidebar from falling back to Ant dark Sider defaults', () => {
  const layoutSource = readWorkspaceFile('template/src/layouts/Default.layout.vue');

  assert.match(layoutSource, /app-sider--light/);
  assert.match(layoutSource, /background:\s*var\(--bg-container\)\s*!important/);
  assert.match(layoutSource, /:deep\(\.ant-layout-sider-trigger\)/);
});

test('template: Ant v4 cleanup removes obsolete v3 Less bridge leftovers', () => {
  const packageJson = JSON.parse(readWorkspaceFile('template/package.json')) as {
    devDependencies: Record<string, string>;
  };
  const envSource = readWorkspaceFile('template/env.d.ts');
  const injectorSource = readWorkspaceFile('template/src/core/theme/bridges/injectStyle.ts');
  const themeGuide = readWorkspaceFile('template/docs/theme.md');
  const templateAgentGuide = readWorkspaceFile('template/AGENTS.md');

  assert.equal(existsSync(join(repoRoot, 'template/src/core/theme/bridges/antd.ts')), false);
  assert.equal(packageJson.devDependencies.less, undefined);
  assert.equal(envSource.includes("declare module '*.less?inline'"), false);
  assert.equal(injectorSource.includes('ANTD_THEME_CSS'), false);
  assert.match(injectorSource, /VXE_THEME_CSS/);
  assert.match(themeGuide, /bridges\/antDesignVue\.ts/);
  assert.doesNotMatch(themeGuide, /bridges\/antd\/\*\.less/);
  assert.match(templateAgentGuide, /bridges\/antDesignVue\.ts/);
  assert.doesNotMatch(templateAgentGuide, /bridges\/antd\/\*\.less/);
});
