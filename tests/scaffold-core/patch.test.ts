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
  findMenuLabelByRouteName,
  parseTopLevelMenuLabels,
  parseRoutes,
  rebuildDomainMenu,
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

// ============ findMenuLabelByRouteName ============

test("findMenuLabelByRouteName: 按 code/routeName 命中 → 返回同对象的 label", () => {
  assert.equal(findMenuLabelByRouteName(MENU_MULTI, "UserManagement"), "用户管理");
  assert.equal(findMenuLabelByRouteName(MENU_MULTI, "RoleManagement"), "角色管理");
});

test("findMenuLabelByRouteName: routeName 不存在 → null", () => {
  assert.equal(findMenuLabelByRouteName(MENU_MULTI, "NotFound"), null);
});

test("findMenuLabelByRouteName: 含 children 的父对象仍能正确定位 label", () => {
  const nested = `[
  {
    label: '用户管理', code: 'UserManagement',
    children: [{ label: '子A', code: 'SubA', routeName: 'SubA' }],
  },
];`;
  assert.equal(findMenuLabelByRouteName(nested, "UserManagement"), "用户管理");
});

// ============ parseTopLevelMenuLabels ============

const MENU_NESTED = `export const menuConfig = [
  { label: '用户管理', code: 'UserManagement', routeName: 'UserManagement' },
  {
    label: '订单管理',
    code: 'OrderManagement',
    children: [
      { label: '订单列表', code: 'OrderList', routeName: 'OrderList' },
      { label: '订单概览', code: 'OrderOverview', routeName: 'OrderOverview' },
    ],
  },
  // @scaffold:menu
];`;

test("parseTopLevelMenuLabels: 只返回一级菜单，排除 children 子项（bug 回归）", () => {
  // 回归：旧实现用全局正则会把「订单列表 / 订单概览」也列出
  const labels = parseTopLevelMenuLabels(MENU_NESTED);
  assert.deepEqual(labels, ["用户管理", "订单管理"]);
});

test("parseTopLevelMenuLabels: 无 children 时返回全部顶层 label", () => {
  assert.deepEqual(parseTopLevelMenuLabels(MENU_MULTI), ["用户管理", "角色管理"]);
});

test("parseTopLevelMenuLabels: 找不到 menuConfig → 空数组", () => {
  assert.deepEqual(parseTopLevelMenuLabels("export const x = [];"), []);
});

test("parseTopLevelMenuLabels: label 值含 { } 字符时不被误判深度", () => {
  const tricky = `export const menuConfig = [
  { label: '用户{管理}', code: 'UserManagement' },
];`;
  assert.deepEqual(parseTopLevelMenuLabels(tricky), ["用户{管理}"]);
});

// ============ parseRoutes ============

const ROUTES_TS = `import type { RouteRecordRaw } from 'vue-router';

export const orderManagementRoutes: RouteRecordRaw[] = [
  {
    path: '/order-management',
    name: 'OrderManagement',
    component: () => import('./pages/OrderManagementList.page.vue'),
    meta: { code: 'OrderManagement', title: '订单管理列表', keepAlive: true },
  },
  {
    path: '/order-overview',
    name: 'OrderOverview',
    component: () => import('./pages/OrderOverviewList.page.vue'),
    meta: { code: 'OrderOverview', title: '订单概览', keepAlive: true },
  },
];`;

test("parseRoutes: 提取全部路由的 name 与 title", () => {
  const routes = parseRoutes(ROUTES_TS);
  assert.equal(routes.length, 2);
  assert.deepEqual(routes[0], { name: "OrderManagement", title: "订单管理列表" });
  assert.deepEqual(routes[1], { name: "OrderOverview", title: "订单概览" });
});

test("parseRoutes: title 缺失时回退为 name", () => {
  const noTitle = `export const x = [
  { path: '/a', name: 'Foo', component: () => import('./a.vue') },
];`;
  const routes = parseRoutes(noTitle);
  assert.equal(routes[0].name, "Foo");
  assert.equal(routes[0].title, "Foo");
});

// ============ rebuildDomainMenu ============

test("rebuildDomainMenu: 多路由 → 父级 + children 含第一个（不过滤）", () => {
  const menu = `export const menuConfig = [
  {
    label: '订单管理',
    code: 'OrderManagement',
    routeName: 'OrderManagement',
  },
];`;
  const routes = [
    { name: "OrderManagement", title: "订单管理列表" },
    { name: "OrderOverview", title: "订单概览" },
    { name: "OrderDetail", title: "订单详情" },
  ];
  const out = rebuildDomainMenu(menu, "OrderManagement", routes);
  assert.equal(out.ok, true);
  assert.equal(out.changed, true);
  // 父级保留 label（域中文名）
  assert.ok(out.content!.includes("label: '订单管理'"));
  // children 含三项，第一个是默认特性 OrderManagement（不过滤掉）
  assert.ok(out.content!.includes("{ label: '订单管理列表', code: 'OrderManagement', routeName: 'OrderManagement' }"));
  assert.ok(out.content!.includes("routeName: 'OrderOverview'"));
  assert.ok(out.content!.includes("routeName: 'OrderDetail'"));
});

test("rebuildDomainMenu: 单路由 → 降级为叶子（去掉 children）", () => {
  // 原 menu 是父级（多 children），但 routes 只剩 1 条 → 降级为叶子
  const menu = `export const menuConfig = [
  {
    label: '订单管理',
    code: 'OrderManagement',
    children: [
      { label: '订单管理列表', code: 'OrderManagement', routeName: 'OrderManagement' },
      { label: '订单概览', code: 'OrderOverview', routeName: 'OrderOverview' },
    ],
  },
];`;
  const routes = [{ name: "OrderManagement", title: "订单管理列表" }];
  const out = rebuildDomainMenu(menu, "OrderManagement", routes);
  assert.equal(out.changed, true);
  assert.ok(!out.content!.includes("children:"));
  assert.ok(out.content!.includes("routeName: 'OrderManagement'"));
});

test("rebuildDomainMenu: 幂等——已是正确结构则 changed=false", () => {
  const routes = [
    { name: "UserManagement", title: "用户管理列表" },
    { name: "OrderOverview", title: "订单概览" },
  ];
  const once = rebuildDomainMenu(MENU_MULTI, "UserManagement", routes);
  assert.equal(once.changed, true);
  const twice = rebuildDomainMenu(once.content!, "UserManagement", routes);
  assert.equal(twice.ok, true);
  assert.equal(twice.changed, false);
});

test("rebuildDomainMenu: 找不到域菜单 → 失败", () => {
  const out = rebuildDomainMenu("export const x = [];", "NotFound", []);
  assert.equal(out.ok, false);
});
