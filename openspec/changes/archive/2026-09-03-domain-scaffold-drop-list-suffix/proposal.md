# Proposal: Domain Scaffold Drops Redundant List Suffix From Domain Default Feature Naming

## Why

`pnpm scaffold:domain` 生成域时，域默认特性的 .vue 文件名带多余的 `List` 后缀（`pages/DataManagementList.page.vue`、`views/DataManagementList.view.vue`），而路由 name / path 已是 `DataManagement` / `/data-management`（无 List）。仓库内手写域（login / readme / theme-preview）均使用 `DataManagement.page.vue` / `DataManagement.view.vue` 的无后缀约定，脚手架产物与其不一致。同时 keep-alive 按组件名缓存，现缓存 key `DataManagementList` 与路由 name `DataManagement` 对不上，语义错位。

## What Changes

- `scaffold:domain` 生成的 **page 壳、默认 view 文件名**去掉 `List` 后缀：`DataManagement.page.vue`、`DataManagement.view.vue`（PascalCase，等于路由 name）。
- 域默认特性的 **view 组件注册名（`defineOptions`）** 与 **composable 文件名 / 函数名** 同步去掉 `List`：`defineOptions('DataManagement')`、`useDataManagement.ts`。
- `domain/routes.ts.hbs` 的路由懒加载 import 路径与 `domain/page-list.vue.hbs` 的 page 壳引用同步去掉 `List`，保持文件名与引用一致。
- **不改** `scaffold:feature`：子特性页面（`features/order/views/OrderList.view.vue`）保留 `List` 类型后缀——那里 `List` 是页面类型语义，且 api 层 `getXxxList` 保持不动。
- 模板内部由"硬编码 `List`"改为数据驱动（`featureSuffix`），仅对 domain 默认特性注入空后缀，`scaffold:feature` 的渲染结果不变。

## Capabilities

### New Capabilities
- `scaffold-domain-naming`: 定义 `scaffold:domain` 生成产物的命名契约——域默认特性的 page / view 文件名、组件名、composable 名与路由 name（PascalCase）保持一致，不拼接 `List` 类型后缀。

### Modified Capabilities
<!-- 无：scaffold-route-safety 仅约束路由名唯一性与菜单一致性，与本次文件命名无关，不改动。 -->

## Impact

- **Affected code**：
  - `template/scripts/scaffold-core/actions.ts`（`scaffoldDomain`：page/view/composable 文件名）
  - `template/scripts/scaffold-core/template.ts`（`TemplateData` 新增 `featureSuffix`）
  - `template/scripts/templates/domain/routes.ts.hbs`、`domain/page-list.vue.hbs`（import 引用路径）
  - `template/scripts/templates/feature/view-list.vue.hbs`、`feature/composable-list.ts.hbs`（硬编码 `List` → `{{featureSuffix}}`）
- **Tests**：`tests/scaffold-core/*`。现有断言均落在 feature 级，保持绿色；新增 domain 命名契约断言。
- **文档**：`template/AGENTS.md` / `template/README.md` 中提及 `scaffold:domain` 命名约定处需同步。
- **兼容性**：仅影响 `scaffold:domain` 的**新产出**；已存在的脚手架产物（如 `user-management` 的 feature 命名）不受影响；打包 / 运行期无行为变化。