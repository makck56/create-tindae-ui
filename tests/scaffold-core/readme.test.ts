import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const repoRoot = process.cwd();

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

test("README: 根文档和模板文档描述当前技术栈，而不是旧模板内容", () => {
  const rootReadme = readRepoFile("README.md");
  const templateReadme = readRepoFile("template/README.md");
  const combined = `${rootReadme}\n${templateReadme}`;

  // README 是用户了解脚手架和生成项目的第一入口，技术栈必须引用 template/package.json 的真实依赖声明。
  assert.match(rootReadme, /`vite@\^8\.1\.5`/);
  assert.match(rootReadme, /`tailwindcss@\^4\.3\.3`/);
  assert.match(rootReadme, /`echarts@\^6\.0\.0`/);
  assert.match(rootReadme, /`vitest@\^4\.1\.10`/);
  assert.match(templateReadme, /Node\.js `\^20\.19\.0 \|\| >=22\.12\.0`/);
  assert.match(templateReadme, /`ant-design-vue@\^3\.2\.0`/);
  assert.match(templateReadme, /`vxe-table@4\.20\.7`/);
  assert.match(templateReadme, /`msw@\^2\.14\.6`/);
  assert.match(templateReadme, /`@google\/design\.md@\^0\.3\.0`/);

  // 旧版 README 曾经写过这些能力，但当前模板并未提供；避免后续复制旧文档时重新引入。
  assert.doesNotMatch(combined, /Vite 5/);
  assert.doesNotMatch(combined, /Tailwind CSS 3/);
  assert.doesNotMatch(combined, /ECharts 5/);
  assert.doesNotMatch(combined, /Vitest 1/);
  assert.doesNotMatch(combined, /ProTable|ProForm/);
});
