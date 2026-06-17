/**
 * patch.ts 纯函数单测。
 *
 * 覆盖这几轮实战 bug 的场景：
 *   - import 锚点方向（必须插在锚点上方，锚点行完整）
 *   - mock 无分号文件解析
 *   - 子级注入的逗号 / 缩进
 *   - 幂等、锚点缺失
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyDomainRouterPatch,
  applyRootMenuPatch,
  applyMockMenuPatch,
  injectChildMenu,
} from "../../template/scripts/scaffold-core/patch";

// ============ applyDomainRouterPatch ============

const ROUTER_TEMPLATE = `import { createRouter } from 'vue-router';
import { userManagementRoutes } from '@/pages/user-management/user-management.routes';
// @scaffold:domain-import ← 说明
const routes = [
  ...loginRoutes,
  {
    path: '/',
    children: [
      ...userManagementRoutes,
      // @scaffold:domain-route ← 说明
    ],
  },
];
`;

test("applyDomainRouterPatch: 成功注入 import 与 route，锚点行保持完整", () => {
  const out = applyDomainRouterPatch(ROUTER_TEMPLATE, "orderManagement", "order-management");
  assert.equal(out.ok, true);
  assert.equal(out.changed, true);
  assert.ok(out.content!.includes("import { orderManagementRoutes } from '@/pages/order-management/order-management.routes';"));
  assert.ok(out.content!.includes("...orderManagementRoutes,"));
  // import 必须在锚点上方，说明文字仍紧跟锚点（同一注释行）
  assert.ok(out.content!.includes("// @scaffold:domain-import ← 说明"));
  // 回归：不能出现 import ...; ← 说明 这种错位（曾导致编译报错）
  assert.ok(!/routes';\s*←/.test(out.content!));
});

test("applyDomainRouterPatch: 幂等——已含 import 名则跳过", () => {
  const once = applyDomainRouterPatch(ROUTER_TEMPLATE, "orderManagement", "order-management");
  const twice = applyDomainRouterPatch(once.content!, "orderManagement", "order-management");
  assert.equal(twice.ok, true);
  assert.equal(twice.changed, false);
});

test("applyDomainRouterPatch: 缺 import 锚点 → 失败", () => {
  const noImport = ROUTER_TEMPLATE.replace("// @scaffold:domain-import ← 说明\n", "");
  const out = applyDomainRouterPatch(noImport, "orderManagement", "order-management");
  assert.equal(out.ok, false);
  assert.equal(out.changed, false);
});

test("applyDomainRouterPatch: 缺 route 锚点 → 失败", () => {
  const noRoute = ROUTER_TEMPLATE.replace("      // @scaffold:domain-route ← 说明\n", "");
  const out = applyDomainRouterPatch(noRoute, "orderManagement", "order-management");
  assert.equal(out.ok, false);
  assert.equal(out.changed, false);
});

// ============ applyRootMenuPatch ============

const MENU_TEMPLATE = `export const menuConfig = [
  { label: '用户管理', code: 'UserManagement', routeName: 'UserManagement' },
  // @scaffold:menu
];
`;

test("applyRootMenuPatch: 成功注入根级菜单", () => {
  const out = applyRootMenuPatch(MENU_TEMPLATE, "订单管理", "OrderManagement");
  assert.equal(out.changed, true);
  assert.ok(out.content!.includes("label: '订单管理'"));
  assert.ok(out.content!.includes("code: 'OrderManagement'"));
});

test("applyRootMenuPatch: 幂等", () => {
  const once = applyRootMenuPatch(MENU_TEMPLATE, "订单管理", "OrderManagement");
  const twice = applyRootMenuPatch(once.content!, "订单管理", "OrderManagement");
  assert.equal(twice.changed, false);
});

test("applyRootMenuPatch: 缺锚点 → 失败", () => {
  const out = applyRootMenuPatch("export const x = [];", "订单管理", "OrderManagement");
  assert.equal(out.ok, false);
});

// ============ applyMockMenuPatch（关键：无分号文件） ============

const MOCK_TEMPLATE = `const MOCK_MENUS = [
  { code: 'UserManagement', name: '用户管理' },
  // @scaffold:mock-menu
]
`;

test("applyMockMenuPatch: 无分号文件也能正确注入", () => {
  const out = applyMockMenuPatch(MOCK_TEMPLATE, "OrderManagement", "订单管理");
  assert.equal(out.changed, true);
  assert.ok(out.content!.includes("{ code: 'OrderManagement', name: '订单管理' }"));
});

test("applyMockMenuPatch: 幂等", () => {
  const once = applyMockMenuPatch(MOCK_TEMPLATE, "OrderManagement", "订单管理");
  const twice = applyMockMenuPatch(once.content!, "OrderManagement", "订单管理");
  assert.equal(twice.changed, false);
});

test("applyMockMenuPatch: 缺锚点 → 失败", () => {
  const out = applyMockMenuPatch("const x = []", "OrderManagement", "订单管理");
  assert.equal(out.ok, false);
});

// ============ injectChildMenu ============

const MENU_MULTI = `export const menuConfig = [
  {
    label: '用户管理',
    code: 'UserManagement',
    routeName: 'UserManagement',
  },
  {
    label: '角色管理',
    code: 'RoleManagement',
    routeName: 'RoleManagement',
  },
  // @scaffold:menu
];
`;

test("injectChildMenu: 父对象无 children → 正确创建 children（含逗号、缩进）", () => {
  const out = injectChildMenu(MENU_MULTI, "用户管理", "子菜单", "SubMenu");
  assert.notEqual(out, null);
  assert.ok(out!.includes("children: ["));
  // 子项缩进 6 空格
  assert.ok(out!.includes("        label: '子菜单'"));
  // 回归：父对象闭合 } 后必须有逗号（这几轮 menu.config 被改坏的根因）
  assert.ok(/children: \[[\s\S]*?\],\n\s*\},/m.test(out!));
});

test("injectChildMenu: 父对象已有 children → 追加到数组", () => {
  const withChildren = `export const menuConfig = [
  {
    label: '用户管理',
    code: 'UserManagement',
    children: [
      { label: '子A', code: 'SubA', routeName: 'SubA' },
    ],
  },
];
`;
  const out = injectChildMenu(withChildren, "用户管理", "子B", "SubB");
  assert.notEqual(out, null);
  assert.ok(out!.includes("label: '子A'"));
  assert.ok(out!.includes("label: '子B'"));
});

test("injectChildMenu: 父菜单不存在 → 返回 null", () => {
  const out = injectChildMenu(MENU_MULTI, "不存在的菜单", "子", "Sub");
  assert.equal(out, null);
});
