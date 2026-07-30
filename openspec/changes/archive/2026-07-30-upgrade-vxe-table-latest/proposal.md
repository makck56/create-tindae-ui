## 为什么

模板当前仍固定使用 `vxe-table@4.3.7`，而 2026-07-24 已核实 npm 最新版本为 `vxe-table@4.20.7`。版本跨度较大，这次升级必须按 VXE 接入层兼容性改造处理，不能只当作依赖版本号调整。

当前模板已经在生成列表页、主题预览、用户管理、角色管理、跨页选择等位置依赖 `vxe-grid`。保持表格栈更新可以降低长期维护风险，但现有接入使用了 VXE 内部模块路径、内部类型路径和 CSS 选择器，这些点在升级过程中最容易破坏。

## 变更内容

- 将模板依赖目标从 `vxe-table@4.3.7`、`xe-utils@^3.5.0` 升级到当前已核实的兼容 v4 组合：`vxe-table@4.20.7`、`xe-utils@^4.0.11`。
- 重做 VXE 运行时注册策略，移除对已不适合作为顶层深路径使用的 `vxe-table/es/filter`、`vxe-table/es/checkbox`、`vxe-table/es/vxe-pager`、`vxe-table/es/vxe-modal`、`vxe-table/es/tooltip` 等路径的依赖。
- 规范 VXE 类型导入，避免继续依赖 `vxe-table/types/grid`、`vxe-table/types/table` 这类脆弱内部路径。
- 在宣布升级完成前，按 `4.20.7` 的真实 CSS 结构重新校准 VXE 主题桥接。
- 保持现有脚手架行为仍围绕 `vxe-grid`、`proxyConfig`、分页、排序、checkbox 选择和主题联动展开。

## 能力

### 新增能力

- `vxe-table-upgrade`: 覆盖升级后的 VXE 依赖契约、运行时注册行为、类型兼容、主题桥接验证，以及生成表格页的回归要求。

### 修改能力

- 无。当前仓库没有 `openspec/specs/` 下的既有主规格需要修改。

## 影响范围

- 依赖：
  - `template/package.json`
  - `template/pnpm-lock.yaml`
- 运行时接入：
  - `template/src/core/plugins/vxeTable.ts`
  - `template/src/core/bootstrap/index.ts`
- 类型与业务接入：
  - `template/src/pages/user-management/features/user/composables/useUser.ts`
  - `template/src/pages/user-management/features/role/composables/useRoleList.ts`
  - `template/src/shared/components/cross-page-select/useCrossPageGrid.ts`
  - `template/src/shared/components/cross-page-select/CrossPageCheckboxHeader.vue`
  - `template/src/shared/components/cross-page-select/README.md`
- 视觉接入：
  - `template/src/core/theme/bridges/vxeTable.ts`
  - `template/src/pages/theme-preview/features/theme-preview/components/VxeTableShowcase.section.vue`
- 生成结果：
  - `template/scripts/templates/feature/view-list.vue.hbs`
  - `template/scripts/templates/feature/composable-list.ts.hbs`
  - 必要时同步脚手架文档与自动生成组件类型输出
- 验证：
  - `template` 单元测试与构建
  - 根目录 CLI 测试与构建
  - 用户列表、角色列表、主题预览、跨页选择的运行时冒烟验证
