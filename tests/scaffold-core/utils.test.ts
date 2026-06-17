/**
 * utils.ts 单测：字符串转换与输入校验。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  toPascalCase,
  toCamelCase,
  toKebabCase,
  validateName,
  validateChineseName,
} from "../../template/scripts/scaffold-core/utils";

test("toPascalCase: kebab → PascalCase", () => {
  assert.equal(toPascalCase("order-management"), "OrderManagement");
  assert.equal(toPascalCase("user"), "User");
  assert.equal(toPascalCase("data-source-management"), "DataSourceManagement");
});

test("toCamelCase: kebab → camelCase", () => {
  assert.equal(toCamelCase("order-management"), "orderManagement");
  assert.equal(toCamelCase("OrderManagement"), "orderManagement");
});

test("toKebabCase: Pascal / 空格 → kebab-case", () => {
  assert.equal(toKebabCase("OrderManagement"), "order-management");
  assert.equal(toKebabCase("order management"), "order-management");
  assert.equal(toKebabCase("order_management"), "order-management");
});

test("validateName: 合法 kebab-case 通过", () => {
  assert.equal(validateName("order-management", "domain").valid, true);
  assert.equal(validateName("user", "feature").valid, true);
});

test("validateName: 非法输入被拒（大写 / 数字开头 / 保留字 / 路径穿越）", () => {
  assert.equal(validateName("OrderManagement", "domain").valid, false);
  assert.equal(validateName("1order", "domain").valid, false);
  assert.equal(validateName("order-", "domain").valid, false); // 中划线结尾
  assert.equal(validateName("src", "domain").valid, false); // 保留字
  assert.equal(validateName("../etc", "domain").valid, false); // 路径穿越
  assert.equal(validateName("", "domain").valid, false); // 空
});

test("validateChineseName: 合法中文名通过", () => {
  assert.equal(validateChineseName("订单管理").valid, true);
});

test("validateChineseName: 空 / 非法字符被拒", () => {
  assert.equal(validateChineseName("").valid, false);
  assert.equal(validateChineseName("订单<管理>").valid, false);
  assert.equal(validateChineseName("订单'管理").valid, false);
});
