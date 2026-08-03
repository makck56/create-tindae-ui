# Template 优化候选清单（临时备忘）

> 本文件是探索过程中整理的**待办优化点**，尚未立项。已立项/进行中的变更见 `openspec/changes/`。
> 优先级仅为建议排序，落地前需逐项评估价值与成本。

## P0 — 低成本高收益（可直接做）

| # | 优化点 | 说明 | 文件 |
|:--|:--|:--|:--|
| 1 | 删除空导出文件 | `src/types/index.ts` 仅含 `export type {}`，无实际内容 | `template/src/types/index.ts` |
| 2 | 冗余类型归位 | `MenuItem` 类型定义在 `modules/app/config/menuTypes.ts`，但被 `modules/auth/stores/auth.ts` 反向 import，破坏模块边界。建议下沉到 `shared/types` | `template/src/modules/app/config/menuTypes.ts`、`template/src/modules/auth/stores/auth.ts` |

## P1 — 测试覆盖（模板级产品最该补）

核心基建 0 测试，是最容易出 bug 的地方：

| # | 优化点 | 说明 |
|:--|:--|:--|
| 3 | `core/http` 全量补测试 | `instance.ts`、`interceptors.ts`、`token-refresh.ts`（并发去重/防死循环）、`pending.ts`（竞态取消）、`file-transfer.ts`、`error.ts`——8 个文件 0 测试 |
| 4 | `modules/auth` 补测试 | `stores/auth.ts`（登录/登出/权限）、`api/auth.api.ts`——4 个文件 0 测试 |
| 5 | `modules/app` 补测试 | `stores/app.ts`、`menu.config.ts`——3 个文件 0 测试 |
| 6 | 缺测试小项 | `usePermission.ts`、`useCaptcha.ts`、`useLoginForm.ts`、`useRsaEncrypt.ts`、`permission.ts`、`copy.ts`、`spin.ts` |

> 统计：有测试的 `.ts` 22 个，缺测试核心 `.ts` 约 28 个。

## P1 — 功能补齐（企业模板定位）

| # | 优化点 | 说明 | 涉及 |
|:--|:--|:--|:--|
| 7 | Tab 标签持久化 | 刷新页面后标签丢失；建议 `sessionStorage` 持久化 + `router.beforeEach` 恢复 | `template/src/layouts/tab/` |
| 8 | 菜单递归渲染 | 侧栏仅渲染一级 `a-sub-menu`，无递归组件，三级以上菜单层级丢失 | `template/src/layouts/Default.layout.vue` |
| 9 | `refreshTab` 固定延时 | 靠 `SPIN_MIN_DURATION` 固定延时模拟卸载，受网络影响 | `template/src/layouts/tab/` |
| 10 | `closeAllTabs` 硬编码 `/` | 首页路径变更会 404，应读路由配置 | `template/src/layouts/tab/` |

## P2 — 工程化改进

| # | 优化点 | 说明 |
|:--|:--|:--|
| 11 | vxe-table 注册迁移 | 现在 `app.use()` 传统模式，`@vxe-ui/core@4.4.18` 声明但从未 import；4.6+ 推荐 `VxeUI.setup()` | `template/src/core/plugins/vxeTable.ts` |
| 12 | vxe 固定版本 | `vxe-table`/`vxe-pc-ui` 锁死 `4.20.7`/`4.16.21`，可改 `~4.20.x` 收补丁 | `template/package.json` |
| 13 | TS 严格度 | `tsconfig.json` 未开 `noUnusedLocals`/`noUnusedParameters`，建议开启 | `template/tsconfig.json` |
| 14 | 双解析器漂移 | `menuVisualizerPlugin` 用正则解析 `routeNames.ts`，`generator` 用 AST，同一数据两种解析 | `template/build-plugins/plugins/menu-visualizer/` |
| 15 | 脚手架回滚盲区 | scaffold 失败回滚只覆盖 router/menu，建议抽象可注册 `PatchTarget[]`；`getExistingDomains` 静默吞掉 FS 错误 | `template/scripts/scaffold-core/` |
| 16 | `fetchUser` 幂等语义 | guarded-return 更像缓存保护，建议拆 `fetchUser(force)` 或 `refreshUser()` | `template/src/modules/auth/stores/auth.ts` |
| 17 | bootstrap 内联回调膨胀 | `configureHttp` 三个回调全内联在 bootstrap，配置膨胀可拆独立工厂 | `template/src/core/bootstrap/index.ts` |
| 18 | `mock` 目录被 tsconfig exclude | `tsconfig.json` exclude `src/mock`，MSW handlers 不在类型检查范围 | `template/tsconfig.json` |
| 19 | 生产错误上报 TODO | `bootstrap/index.ts:40` 的 TODO：生产接入错误上报（Sentry 等） | `template/src/core/bootstrap/index.ts` |

## 参考：已归档的演进

- Tailwind v4 升级：`openspec/changes/archive/2026-07-28-upgrade-tailwind-v4/`
- Ant Design Vue v4 升级：`openspec/changes/archive/2026-07-30-upgrade-ant-design-vue-v4/`
- Ant v4 遗留清理：`openspec/changes/archive/2026-07-30-cleanup-ant-v4-leftovers/`
- VXE Table 最新版升级：`openspec/changes/archive/2026-07-30-upgrade-vxe-table-latest/`
