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
