# scaffold-domain-naming Specification

## Purpose

Defines the naming contract for `pnpm scaffold:domain` output: the domain default feature's page / view / component names align with the domain's PascalCase route name and carry no redundant `List` type suffix, so scaffold output matches the repo's hand-written domain convention and satisfies route-level keep-alive matching.

## ADDED Requirements

### Requirement: 域默认特性的 page / view 文件名与域路由名一致（无 List 后缀）
`scaffold:domain` MUST 生成 page 壳与默认 view 时，使用域名的 PascalCase 形式（等价于路由 `name`），且不拼接 `List` 类型后缀。

#### Scenario: 生成新域 data-management
- **WHEN** 开发者以域名 `data-management` 执行 `scaffold:domain`
- **THEN** 生成的 page 壳路径 MUST 为 `src/pages/data-management/pages/DataManagement.page.vue`，默认 view 路径 MUST 为 `src/pages/data-management/features/data-management/views/DataManagement.view.vue`

#### Scenario: 路由与 page 壳引用对齐
- **WHEN** 域路由 `data-management.routes.ts` 引用默认页面
- **THEN** 懒加载路径 MUST 指向 `./pages/DataManagement.page.vue`（不带 `List`），page 壳组件 imports 与渲染 MUST 指向无后缀的 `DataManagementView`

### Requirement: 域默认特性的组件名与 composable 名不带 List 后缀
`scaffold:domain` 生成的默认 view MUST 以域名 PascalCase 注册组件名（`defineOptions`），生成的默认 composable 文件名与函数名 MUST 为 `use<DomainPascal>`，与文件名一致，避免"文件名与内部组件名不符"。

#### Scenario: view 组件名与路由 name 对齐
- **WHEN** 渲染 `data-management` 的默认 view
- **THEN** view 的 `defineOptions` name MUST 为 `DataManagement`，与路由 `name` 一致，使 keep-alive 缓存 key 与路由名对齐

#### Scenario: composable 命名
- **WHEN** 生成 `data-management` 域的默认特性
- **THEN** composable 文件 MUST 为 `src/pages/data-management/features/data-management/composables/useDataManagement.ts`，导出函数 MUST 为 `useDataManagement`

### Requirement: scaffold:feature 的 feature 级命名不受影响
`scaffold:feature` 在现有域下新增子特性时 MUST 保留 `featurePascal + 页面类型后缀`（如 `OrderList` / `OrderOverview`）的命名，不得因本次 domain 命名调整而改变。

#### Scenario: 为已有域新增 order 特性
- **WHEN** 开发者在 `data-management` 域下用 `scaffold:feature` 新增表格型特性 `order`
- **THEN** 生成的 view 仍 MUST 为 `OrderList.view.vue`，page 壳仍 MUST 为 `OrderList.page.vue`，composable 仍 MUST 为 `useOrderList.ts`