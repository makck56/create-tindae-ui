## 1. 依赖探针

- [x] 1.1 使用 `npm view vxe-table version` 和 `npm view xe-utils version` 确认最终目标版本。
- [x] 1.2 将 `template/package.json` 更新到选定的 `vxe-table` 与 `xe-utils` 版本。
- [x] 1.3 使用 `cd template && pnpm install` 刷新 `template/pnpm-lock.yaml`。
- [x] 1.4 运行 `cd template && pnpm test`，记录第一批兼容性失败。
- [x] 1.5 运行 `cd template && pnpm build`，记录导入、类型和构建失败。

## 2. 运行时注册兼容

- [x] 2.1 替换 `template/src/core/plugins/vxeTable.ts` 中已不适用的 VXE 深路径导入。
- [x] 2.2 保留 VXE 中文 locale 设置。
- [x] 2.3 注册当前页面和生成模板使用的全部 VXE 组件。
- [x] 2.4 选择一种稳定样式导入策略，并移除过时的组件样式导入。
- [x] 2.5 重新运行 `cd template && pnpm build`，验证导入兼容性。
- [x] 2.6 引入 `vxe-pc-ui@4.16.21`（vxe-table 4.6+ 拆分出的 PC UI 组件包，与 `@vxe-ui/core@4.4.18` 配对），在 `setupVxeTable` 中先 `app.use(VxeUIPcUi)` 注册 `VxePager`/`VxeForm` 等，消除 grid 的 `缺少组件(reqComp)` 警告并恢复分页器渲染。
- [x] 2.7 将 `proxyConfig.props` 改名为 `proxyConfig.response`（`useUser.ts`、`useRoleList.ts`、`composable-list.ts.hbs`、`useRoleList.spec.ts`），消除 grid 的 `参数已废弃(delProp)` 警告。

## 3. 类型兼容

- [x] 3.1 替换跨页选择代码和文档中的 `vxe-table/types/grid` 导入。
- [x] 3.2 替换跨页选择代码和文档中的 `vxe-table/types/table` 导入。
- [x] 3.3 验证或替换用户与角色 composable 中的 `VxeGridInstance` 用法。
- [x] 3.4 当 VXE 公开导出无法提供稳定类型时，补充窄本地接口。
- [x] 3.5 重新运行 `cd template && pnpm test` 和 `cd template && pnpm build`。

## 4. 行为回归

- [ ] 4.1 验证 `UserList` 可渲染、搜索、重置、分页、排序，并在删除后刷新。
- [ ] 4.2 验证 `RoleList` 可渲染、分页、排序、删除，并保持预期 grid 行为。
- [ ] 4.3 验证 `CrossPageCheckboxHeader` 可渲染，并能处理当前页选择与全页选择。
- [x] 4.4 验证脚手架生成的 feature list 输出仍正确使用 `vxe-grid` 与 `gridOptions`。
- [ ] 4.5 验证模板使用的 VXE 组件没有 Vue unknown-component warning。（根因已修复：注册 `vxe-pc-ui` 提供 `VxePager`，并将 `proxyConfig.props` 改为 `proxyConfig.response`；运行时冒烟待 `pnpm dev`）

## 5. 主题桥接校准

- [ ] 5.1 检查 `vxe-table@4.20.7` 在 table、header、body、footer、pager、checkbox、sort 元素上的真实 DOM/CSS。
- [ ] 5.2 只有在新结构与当前结构不一致时，才更新 `template/src/core/theme/bridges/vxeTable.ts` 选择器。
- [ ] 5.3 更新主题桥接文件注释，标明最终已验证的 VXE 版本。
- [ ] 5.4 验证 `ThemePreview` 的 VXE showcase 在表头、边框、hover、current、checked、sort、pager、checkbox 状态下都跟随主题 token。

## 6. 最终门禁

- [x] 6.1 运行 `cd template && pnpm test`。
- [x] 6.2 运行 `cd template && pnpm build`。
- [x] 6.3 运行根目录 `pnpm test`。
- [x] 6.4 运行根目录 `pnpm build`。
- [x] 6.5 检查最终 diff，确认依赖变更、兼容修复和主题校准都限制在本 OpenSpec change 范围内。

## 7. 测试案例补充

- [x] 7.1 更新 `template/src/pages/user-management/features/user/composables/useUser.spec.ts`，覆盖 `gridOptions.columns`、`pagerConfig`、`proxyConfig.ajax.query`、`gridRef.commitProxy('query')`。
- [x] 7.2 新增或更新 `template/src/pages/user-management/features/role/composables/useRoleList.spec.ts`，覆盖角色列表 `gridOptions`、分页、proxy 查询和删除处理函数。
- [x] 7.3 新增或更新 `template/src/shared/components/cross-page-select/__tests__/useCrossPageGrid.test.ts`，用模拟 gridRef 覆盖 `clearCheckboxRow()`、`setCheckboxRow(rows, true)` 和同步保护逻辑。
- [x] 7.4 新增或更新 `template/src/core/plugins/vxeTable.spec.ts`，mock Vue app 和 VXE 安装入口，验证 `setupVxeTable(app)` 注册所需组件并设置中文 locale。
- [x] 7.5 扩展 `tests/scaffold-core/template.test.ts`，断言表格型 feature 模板输出 `<vxe-grid`、`gridOptions`、`proxyConfig`、`ajax.query`。
- [x] 7.6 新增 VXE 升级专项静态测试，断言 `template/src` 不再包含 `vxe-table/types/grid`、`vxe-table/types/table`，且 `vxeTable.ts` 不再包含已移除的 VXE 深路径导入。
- [x] 7.7 将以上测试纳入最终门禁，确保 `cd template && pnpm test` 与根目录 `pnpm test` 都能覆盖升级风险点。
