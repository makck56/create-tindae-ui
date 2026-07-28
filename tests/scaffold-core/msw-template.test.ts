import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const repoRoot = process.cwd();
const templateRoot = join(repoRoot, "template");

function readTemplateFile(relativePath: string): string {
  return readFileSync(join(templateRoot, relativePath), "utf8");
}

test("template: 开发态默认使用 MSW，而不是 Vite /api mock 中间件", () => {
  const viteConfig = readTemplateFile("vite.config.ts");
  const main = readTemplateFile("src/main.ts");

  // 这条测试锁定 mock 架构边界：模板默认 mock 能力由 MSW 提供。
  // 如果未来要切换到 Vite middleware，需要先更新 OpenSpec 决策和文档，而不是只改实现。
  assert.doesNotMatch(viteConfig, /devMockApiPlugin/);
  assert.doesNotMatch(main, /VITE_USE_MSW/);
  assert.doesNotMatch(main, /unregisterExistingMockWorker/);
  assert.match(main, /if \(import\.meta\.env\.DEV\)/);
  assert.match(main, /import\('@\/mock\/browser'\)/);
  assert.match(main, /worker\s*\.\s*start\(/);
});

test("template: MSW worker 保留旧 worker 更新和 API 兜底诊断", () => {
  const main = readTemplateFile("src/main.ts");
  const browser = readTemplateFile("src/mock/browser.ts");
  const handlersIndex = readTemplateFile("src/mock/handlers/index.ts");
  const fallback = readTemplateFile("src/mock/handlers/fallback.ts");
  const worker = readTemplateFile("public/mockServiceWorker.js");

  // updateViaCache: 'none' 用于规避浏览器缓存旧 mockServiceWorker.js。
  // fallbackHandlers 必须放在最后，避免抢先拦截已有业务 handler。
  assert.match(main, /updateViaCache:\s*'none'/);
  assert.match(main, /controllerchange/);
  assert.match(main, /hasReloadedAfterMockWorkerChange/);
  assert.match(browser, /request:unhandled/);
  assert.match(handlersIndex, /import \{ fallbackHandlers \} from '\.\/fallback'/);
  assert.match(handlersIndex, /\.\.\.roleHandlers,\s*\.\.\.fallbackHandlers/);
  assert.match(fallback, /http\.all\(\/\\\/api\\\/\.\+\/,/);
  assert.match(fallback, /HttpResponse\.json/);
  assert.match(worker, /requestUrl\.origin === self\.location\.origin/);
  assert.match(worker, /!requestUrl\.pathname\.startsWith\('\/api\/'\)/);
  assert.match(worker, /Vite source modules, HMR endpoints, and static/);
});

test("template: 主题预览 VXE showcase 不启用内置表单和工具栏 renderer", () => {
  const showcase = readTemplateFile(
    "src/pages/theme-preview/features/theme-preview/components/VxeTableShowcase.section.vue",
  );

  // 主题预览页是静态展示表格，不需要 VXE 内置 form/toolbar。
  // 显式传入禁用配置，避免 vxe-table 4.20.x 在 grid 默认路径里查找空 renderer。
  assert.match(showcase, /const disabledFormConfig = \{ enabled: false \}/);
  assert.match(showcase, /const disabledToolbarConfig = \{ enabled: false \}/);
  assert.match(showcase, /:form-config="disabledFormConfig"/);
  assert.match(showcase, /:toolbar-config="disabledToolbarConfig"/);
});

test("template: 主题预览页保留宽松间距并限制 ECharts 高度反馈", () => {
  const view = readTemplateFile("src/pages/theme-preview/features/theme-preview/views/ThemePreview.view.vue");
  const charts = readTemplateFile(
    "src/pages/theme-preview/features/theme-preview/components/EchartsShowcase.section.vue",
  );

  // 预览页是组件陈列场景，section 之间需要比业务列表页更宽松的视觉节奏。
  assert.match(view, /theme-preview-page flex flex-col gap-6 lg:gap-8/);
  assert.match(view, /ant-card-body/);
  assert.match(view, /padding: 28px !important/);
  assert.match(view, /gap: 32px !important/);

  // ECharts autoresize 读取稳定 viewport 尺寸，避免图表根节点把父级卡片持续撑高。
  assert.match(charts, /theme-chart-grid grid grid-cols-1 gap-6 lg:grid-cols-2/);
  assert.match(charts, /theme-chart-viewport h-\[260px\] max-h-\[260px\] min-h-\[260px\]/);
  assert.match(charts, /theme-chart-viewport h-\[300px\] max-h-\[300px\] min-h-\[300px\]/);
  assert.match(charts, /contain: layout size/);
  assert.match(charts, /gap: 24px !important/);
});
