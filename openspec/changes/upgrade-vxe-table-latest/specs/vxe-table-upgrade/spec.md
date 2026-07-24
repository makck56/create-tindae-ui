## ADDED Requirements

### Requirement: 模板依赖栈升级到最新已核实的 VXE v4 版本线

模板 SHALL 使用本 change 已核实的最新兼容 VXE v4 依赖组合：`vxe-table@4.20.7` 与 `xe-utils@^4.0.11`。

#### Scenario: 依赖清单体现升级目标

- **WHEN** 实现后检查 `template/package.json`
- **THEN** 它 MUST 将 `vxe-table` 声明为 `4.20.7`，或声明为经过明确批准的 patch 兼容范围 `~4.20.7`
- **AND** 它 MUST 将 `xe-utils` 声明为 `^4.0.11`，或声明为经过明确批准的兼容范围

#### Scenario: Lockfile 与依赖清单一致

- **WHEN** 实现后安装 template 依赖
- **THEN** `template/pnpm-lock.yaml` MUST 将 `vxe-table` 解析到选定升级目标
- **AND** 它 MUST 将 `xe-utils` 解析到兼容 v4 的版本

### Requirement: 运行时注册避开已不适用的 VXE 深路径

VXE 插件 SHALL 避免从 `vxe-table@4.20.7` 包文件清单中不存在的深路径导入 VXE 模块。

#### Scenario: 已不适用路径不再被使用

- **WHEN** 实现后检查 `template/src/core/plugins/vxeTable.ts`
- **THEN** 它 MUST NOT 从 `vxe-table/es/filter` 导入
- **AND** 它 MUST NOT 从 `vxe-table/es/checkbox` 导入
- **AND** 它 MUST NOT 从 `vxe-table/es/vxe-pager` 导入
- **AND** 它 MUST NOT 从 `vxe-table/es/vxe-modal` 导入
- **AND** 它 MUST NOT 从 `vxe-table/es/tooltip` 导入

#### Scenario: 模板所需组件在运行时可用

- **WHEN** 实现后的后台模板渲染列表页
- **THEN** `vxe-grid`、checkbox 选择、分页、排序、modal、tooltip 等模板使用的行为 MUST 可用
- **AND** 运行时 MUST NOT 出现与这些 VXE 组件相关的 Vue unknown-component warning

### Requirement: VXE 查询与表格行为保持兼容

升级 SHALL 保持现有基于 `proxyConfig`、列表查询函数、分页、排序和 checkbox 选择的 `vxe-grid` 数据流。

#### Scenario: 搜索触发 VXE proxy query

- **WHEN** 用户在 `UserList` 中触发搜索或重置
- **THEN** grid MUST 调用 `commitProxy('query')`
- **AND** MUST NOT 抛出 `getCheckedFilters is not a function`

#### Scenario: 生成列表页保持 grid 契约

- **WHEN** 从脚手架模板生成 feature list 页面
- **THEN** 生成的 view MUST 仍渲染 `vxe-grid`
- **AND** 生成的 composable MUST 仍提供包含 `columns`、`pagerConfig`、`proxyConfig.ajax.query` 的 `gridOptions`

### Requirement: VXE 类型使用与不稳定内部路径解耦

升级后的模板 SHALL 避免依赖不属于稳定包根契约的 VXE 内部类型路径。

#### Scenario: 移除内部类型路径

- **WHEN** 实现后搜索 `template/src` 中的 VXE 类型导入
- **THEN** 代码 MUST NOT 从 `vxe-table/types/grid` 导入
- **AND** 代码 MUST NOT 从 `vxe-table/types/table` 导入

#### Scenario: 跨页选择保持类型约束

- **WHEN** TypeScript 检查 `useCrossPageGrid`
- **THEN** checkbox change handler、checkbox-all handler 和 grid checkbox 方法 MUST 具有显式类型或窄本地接口
- **AND** 实现 MUST NOT 将宽泛 `any` 作为 grid 接入的主要类型策略

### Requirement: 主题桥接按 VXE 4.20.7 校验

升级 SHALL 在完成前，按真实 `vxe-table@4.20.7` DOM 和 CSS 结构重新校准 VXE 主题桥接选择器。

#### Scenario: 主题预览验证 VXE 视觉状态

- **WHEN** `ThemePreview` 渲染 VXE showcase
- **THEN** 表头背景、边框线、hover 行、current 行、checked 行、激活排序图标、激活分页项和 checkbox 颜色 MUST 跟随模板主题 token

#### Scenario: 主题桥接注释标明已验证 VXE 版本

- **WHEN** 实现后检查 `template/src/core/theme/bridges/vxeTable.ts`
- **THEN** 文件头部文档 MUST 将 `vxe-table@4.20.7` 或最终选定升级版本标记为已验证 CSS 基线

### Requirement: 升级通过构建与测试门禁

升级 SHALL 在视为完成前通过 template 和根目录验证门禁。

#### Scenario: Template 验证通过

- **WHEN** 运行 `cd template && pnpm test`
- **THEN** 所有 template 测试 MUST 通过
- **WHEN** 运行 `cd template && pnpm build`
- **THEN** template 构建 MUST 通过

#### Scenario: 根目录验证通过

- **WHEN** 运行根目录 `pnpm test`
- **THEN** 所有脚手架 CLI 测试 MUST 通过
- **WHEN** 运行根目录 `pnpm build`
- **THEN** CLI 构建 MUST 通过

