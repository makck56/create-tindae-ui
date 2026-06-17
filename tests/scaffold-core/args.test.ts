/**
 * args.ts 参数解析单测。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseDomainArgs, parseFeatureArgs } from "../../template/scripts/scaffold-core/args";

test("parseDomainArgs: --key=value 形式", () => {
  const args = parseDomainArgs(["domain", "--name=order-management", "--chinese=订单管理"]);
  assert.equal(args.name, "order-management");
  assert.equal(args.chinese, "订单管理");
});

test("parseDomainArgs: --key value 形式", () => {
  const args = parseDomainArgs(["domain", "--name", "order-management"]);
  assert.equal(args.name, "order-management");
});

test("parseDomainArgs: 标志 --dry-run / --no-menu", () => {
  const args = parseDomainArgs(["domain", "--dry-run", "--no-menu"]);
  assert.equal(args.dryRun, true);
  assert.equal(args.noMenu, true);
});

test("parseDomainArgs: 无参数（纯交互模式）", () => {
  const args = parseDomainArgs(["domain"]);
  assert.equal(args.name, undefined);
  assert.equal(args.dryRun, false);
  assert.equal(args.noMenu, false);
});

test("parseFeatureArgs: --domain + --name", () => {
  const args = parseFeatureArgs(["feature", "--domain=order-management", "--name=detail", "--no-page"]);
  assert.equal(args.domain, "order-management");
  assert.equal(args.name, "detail");
  assert.equal(args.noPage, true);
});
