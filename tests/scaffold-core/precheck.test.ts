/**
 * precheck.ts 环境校验单测。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { validateProjectRoot } from "../../template/scripts/scaffold-core/precheck";

/** 建一个临时目录并返回其路径 */
const mkTmpDir = (): string => fs.mkdtempSync(path.join(os.tmpdir(), "scaffold-precheck-"));

test("validateProjectRoot: 含 package.json + src/pages 通过", () => {
  const tmp = mkTmpDir();
  fs.mkdirSync(path.join(tmp, "src/pages"), { recursive: true });
  fs.writeFileSync(path.join(tmp, "package.json"), "{}");
  assert.deepEqual(validateProjectRoot(tmp), []);
  fs.rmSync(tmp, { recursive: true, force: true });
});

test("validateProjectRoot: 缺 package.json 报错", () => {
  const tmp = mkTmpDir();
  fs.mkdirSync(path.join(tmp, "src/pages"), { recursive: true });
  const errors = validateProjectRoot(tmp);
  assert.ok(errors.length > 0);
  assert.ok(errors.some((e) => e.includes("package.json")));
  fs.rmSync(tmp, { recursive: true, force: true });
});

test("validateProjectRoot: 缺 src/pages 报错", () => {
  const tmp = mkTmpDir();
  fs.writeFileSync(path.join(tmp, "package.json"), "{}");
  const errors = validateProjectRoot(tmp);
  assert.ok(errors.some((e) => e.includes("src/pages")));
  fs.rmSync(tmp, { recursive: true, force: true });
});
