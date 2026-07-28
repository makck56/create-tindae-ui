import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const repoRoot = process.cwd();
const templateRoot = join(repoRoot, "template");

function readTemplateFile(relativePath: string): string {
  return readFileSync(join(templateRoot, relativePath), "utf8");
}

test("template: Tailwind v4 配置入口不再回退到 v3 范式", () => {
  assert.equal(existsSync(join(templateRoot, "tailwind.config.js")), false);
  assert.equal(existsSync(join(templateRoot, "theme.tailwind.json")), false);
  assert.equal(existsSync(join(templateRoot, "postcss.config.js")), false);

  const packageJson = JSON.parse(readTemplateFile("package.json"));
  assert.match(packageJson.devDependencies.tailwindcss, /^\^4\./);
  assert.match(packageJson.devDependencies["@tailwindcss/vite"], /^\^4\./);
  assert.equal(packageJson.devDependencies.autoprefixer, undefined);

  const tailwindEntry = readTemplateFile("src/assets/styles/tailwind.css");
  assert.match(tailwindEntry, /@import "tailwindcss"/);
  assert.match(tailwindEntry, /@import "\.\/theme\.tailwind\.css"/);
  assert.doesNotMatch(tailwindEntry, /@tailwind\s+(base|components|utilities)/);

  const themeCss = readTemplateFile("src/assets/styles/theme.tailwind.css");
  assert.match(themeCss, /@theme inline/);
  assert.match(themeCss, /--color-primary: var\(--color-primary\)/);
});

test("template: src 不再使用 Tailwind v4 已改名的旧工具类", () => {
  const renamedV3Utilities = /\b(shadow-sm|rounded-sm|outline-none|bg-opacity-\d+)\b/;
  const files = [
    "src/layouts/Default.layout.vue",
    "src/pages/readme/features/readme/views/Readme.view.vue",
    "src/pages/theme-preview/features/theme-preview/components/ColorPalette.section.vue",
  ];

  for (const file of files) {
    assert.doesNotMatch(readTemplateFile(file), renamedV3Utilities, `${file} contains renamed Tailwind v3 utility`);
  }
});
