# Tasks: Domain Scaffold Drops Redundant List Suffix

## 1. 模板数据层（template.ts）

- [x] 1.1 `TemplateData` 新增 `featureSuffix: string` 字段，并在 `prepareTemplateData` 中按 `omitTypeSuffix` 派生（缺省 `= typeSuffix`，为 true 时 `""`），`config` 参数同步增加 `omitTypeSuffix?: boolean`
- [x] 1.2 保持缺省行为：不传 `omitTypeSuffix` 时 `featureSuffix` 与 `typeSuffix` 一致，`scaffold:feature` 渲染结果逐字节不变

## 2. Feature 模板：硬编码 List → 数据驱动

- [x] 2.1 `feature/view-list.vue.hbs`：`defineOptions({ name: '{{featurePascal}}List' })` 改为 `{{featurePascal}}{{featureSuffix}}`，composable import 名同步
- [x] 2.2 `feature/composable-list.ts.hbs`：`use{{featurePascal}}List` 改为 `use{{featurePascal}}{{featureSuffix}}`（函数名与文件引用）

## 3. Domain 模板：引用去 List

- [x] 3.1 `domain/routes.ts.hbs`：`import('./pages/{{domainPascal}}List.page.vue')` 改为 `{{domainPascal}}.page.vue`
- [x] 3.2 `domain/page-list.vue.hbs`：渲染标签 `<{{domainPascal}}ListView />` 改为 `<{{domainPascal}}View />`，import 路径 `views/{{domainPascal}}List.view.vue` 改为 `{{domainPascal}}.view.vue`

## 4. actions.ts：文件名去 List

- [x] 4.1 `scaffoldDomain` 的 page 壳文件名：`${domainPascal}List.page.vue` → `${domainPascal}.page.vue`
- [x] 4.2 `scaffoldDomain` 的 view 文件名：`${domainPascal}List.view.vue` → `${domainPascal}.view.vue`
- [x] 4.3 `scaffoldDomain` 的 composable 文件名：`use${Pascal(...)}List.ts` → `use${Pascal(...)}.ts`
- [x] 4.4 `scaffoldDomain` 调用 `prepareTemplateData` 时传 `omitTypeSuffix: true`

## 5. 测试

- [x] 5.1 新增 domain 命名契约测试：`prepareTemplateData({ omitTypeSuffix: true })` 产出空 `featureSuffix`；渲染 `domain/routes.ts.hbs` / `domain/page-list.vue.hbs` 含 `DataManagement.page.vue` / `DataManagementView` / `DataManagement.view.vue`，不含 `List`
- [x] 5.2 断言 `omitTypeSuffix` 缺省时 `featureSuffix === typeSuffix`，且 feature 模板仍产出 `use{{featurePascal}}List` 系列（对照 spec 场景）
- [x] 5.3 运行 `pnpm test`（或 tests/scaffold-core 子集）确认既有断言全绿

## 6. 文档与验证

- [x] 6.1 排查 `template/AGENTS.md`、`template/README.md` 及 openspec 文档中 `scaffold:domain` 命名示例，同步为无 `List` 写法
- [x] 6.2 干跑 `pnpm scaffold:domain`（一次交互 / 一次 `--name data-management --chinese 数据源管理` 非交互）验证生成文件名、路由 import 与 page 壳引用一致且项目可编译