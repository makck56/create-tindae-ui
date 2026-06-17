/**
 * dry-run 端到端冒烟：在临时项目里跑 scaffold:domain，
 * 断言 dry-run 模式下不创建任何目录、不改写任何配置文件。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { scaffoldDomain } from "../../template/scripts/scaffold-core/actions";
import { setDryRun } from "../../template/scripts/scaffold-core/io";

// 含锚点的最小配置文件（锚点字符串须与 constants.ts 逐字一致）
const ROUTER = `import { createRouter } from 'vue-router';
// @scaffold:domain-import
const routes = [
  {
    path: '/',
    children: [
      // @scaffold:domain-route
    ],
  },
];
`;

const MENU = `export const menuConfig = [
  // @scaffold:menu
];
`;

const MOCK = `const MOCK_MENUS = [
  // @scaffold:mock-menu
]
`;

test("scaffoldDomain dry-run: 不落盘（无新目录，配置文件内容不变）", async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "scaffold-dryrun-"));
  fs.mkdirSync(path.join(tmp, "src/pages"), { recursive: true });
  fs.mkdirSync(path.join(tmp, "src/core/bootstrap"), { recursive: true });
  fs.mkdirSync(path.join(tmp, "src/modules/app/config"), { recursive: true });
  fs.mkdirSync(path.join(tmp, "src/mock/handlers"), { recursive: true });
  fs.writeFileSync(path.join(tmp, "package.json"), "{}");
  fs.writeFileSync(path.join(tmp, "src/core/bootstrap/router.ts"), ROUTER);
  fs.writeFileSync(path.join(tmp, "src/modules/app/config/menu.config.ts"), MENU);
  fs.writeFileSync(path.join(tmp, "src/mock/handlers/auth.ts"), MOCK);

  const origCwd = process.cwd();
  process.chdir(tmp);
  setDryRun(true);
  try {
    await scaffoldDomain({ name: "demo-domain", chinese: "演示域" });
  } finally {
    setDryRun(false);
    process.chdir(origCwd);
  }

  // 断言：未创建域目录
  assert.equal(fs.existsSync(path.join(tmp, "src/pages/demo-domain")), false);
  // 断言：三个配置文件内容完全未变
  assert.equal(fs.readFileSync(path.join(tmp, "src/core/bootstrap/router.ts"), "utf-8"), ROUTER);
  assert.equal(fs.readFileSync(path.join(tmp, "src/modules/app/config/menu.config.ts"), "utf-8"), MENU);
  assert.equal(fs.readFileSync(path.join(tmp, "src/mock/handlers/auth.ts"), "utf-8"), MOCK);

  fs.rmSync(tmp, { recursive: true, force: true });
});
