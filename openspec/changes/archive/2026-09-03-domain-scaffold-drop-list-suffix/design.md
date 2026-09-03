# Design: Domain Scaffold Drops Redundant List Suffix

## Context

See proposal.md - Why. 现状要点：

- `scaffold:domain` 的域默认特性复用 feature 模板（`feature/view-list.vue.hbs`、`feature/composable-list.ts.hbs`），模板内部把 `List` 后缀**硬编码**为字面量（`'{{featurePascal}}List'`、`use{{featurePascal}}List`），非数据驱动。
- page 壳 / view 文件名由 `actions.ts` `scaffoldDomain` 直接拼接 `${domainPascal}List`。
- 路由 name / path 已是 `domainPascal` / `domainKebab`（无 `List`）；路由 name、menu code 均不带后缀，唯独文件与组件名多挂了 `List`。
- 仓库手写域（login / readme / theme-preview）约定 `Login.page.vue` / `Login.view.vue`；`scaffold:feature` 子特性（user-management 的 `UserList.view.vue`）保留 `List` 语义。

## Goals / Non-Goals

**Goals:**
- `scaffold:domain` 产物（page 壳、默认 view 文件、view 组件名、composable）命名与域路由 name（PascalCase）对齐，不拼 `List`。
- 模板内命名数据驱动化（`featureSuffix`），domain 默认特性注入空后缀。
- 新增命名契约测试并保持既有测试全绿。

**Non-Goals:**
- 不改 `scaffold:feature`：子特性沿用 `featurePascal + typeSuffix`。
- 不改 api 层 `getXxxList` / `deleteXxx`（`List` 是查询动词语义）。
- 不迁移已存在的脚手架产物（`user-management` 等保持现状）。
- 不修复「`scaffold:domain` 显式传 `--feature` 时，view 文件名仍按 domainPascal 命名而组件名按 featurePascal」这一**既有**不一致（本次只做后缀去除，不改变该命名基准）。

## Decisions

### D1: 用 `featureSuffix` 数据字段取代硬编码 `List`，而非新增专用域模板
在 `TemplateData` 增加 `featureSuffix: string`，默认 `= typeSuffix`（`List`/`Overview`）；`scaffoldDomain` 渲染时传 `omitTypeSuffix: true` → `featureSuffix = ""`。两个 feature 模板把硬编码 `List` 改为 `{{featurePascal}}{{featureSuffix}}`。

- **Why**：域默认特性本质仍是 list 型（要渲染 vxe-grid），只是命名不该挂后缀。若新增专用 `domain/view-list.vue.hbs` 会整体复制 vxe-grid 模板体（违背 DRY）；若在模板里散落 `{{#if}}` 分支则难读。一个字符串字段最直接，且默认值保证 `scaffold:feature` 渲染结果逐字节不变。
- **Alternative considered**：专用域模板（复制模板体）、模板条件分支（侵入两处渲染逻辑）——均否。

### D2: 文件名改动集中在 `actions.ts` `scaffoldDomain` 三处
```
pages/${domainPascal}.page.vue             （原 List.page）
views/${domainPascal}.view.vue             （原 List.view）
composables/use${Pascal(feature||domain)}.ts （原 useXxxList.ts）
```
- **Why**：文件名与 `featureSuffix` 字段天然同步——当 `omitTypeSuffix` 时两者都去 `List`；公式简单、与模板约定一致。
- `featureType`/`typeSuffix` 不被触碰，故 vxe-grid 渲染、`pageComponentName`（feature 壳专用）均不受影响。

### D3: 引用侧同步去后缀（两处 domain 模板）
- `domain/routes.ts.hbs`：`import('./pages/{{domainPascal}}')` → `{{domainPascal}}.page.vue`。
- `domain/page-list.vue.hbs`：渲染 `<{{domainPascal}}View />` + import `views/{{domainPascal}}.view.vue`。
- **Why**：路由 name / path 本就无 `List`，引用路径随文件名改动即可完全对齐；`{{domainPascal}}` + 空后缀即为期望名。

### D4: 新增命名契约测试，不改既有 feature 断言
在 domain 模板 / `prepareTemplateData` 渲染路径上断言无后缀产出（`DataManagement.page.vue`、`...View`、`useDataManagement`），并断言 `scaffold:feature` 路径（`omitTypeSuffix` 缺省）仍产出 `OrderList` 系列。`template.test.ts` 既有 feature 断言因默认后缀不变而保持绿。

## Risks / Trade-offs

- **[既有产物命名不统一]** 已生成的 `user-management`（feature 级）与未来新域（domain 级无后缀）命名风格不同 → 属预期，domain 级对齐的是手写域约定，feature 级本就不该混同。
- **[显式 `--feature` 的域]** 文件名（domainPascal）与组件名（featurePascal）在本次改动后仍不一致 → 为**既有**行为，Non-Goal 明示，不扩大改动面。
- **[文档过期]** template 内 AGENTS.md / README 若含 `XxxList.page.vue` 示例会失准 → 作为实现任务同步排查更新。
- **[keep-alive 语义收益]** 组件名改为路由名后，`keepAlive: true` 的缓存 key 与路由 name 对齐，这正好修复既有语义错位（无破坏面）。

## Migration Plan

- 无数据迁移：仅影响 `scaffold:domain` **新产出**。旧域名如需统一，属未来单独的手工迁移，不在本 change 范围。
- 回滚：纯脚手架生成路径改动，若出问题 revert actions.ts + 模板 + 测试即可，不影响运行期代码。