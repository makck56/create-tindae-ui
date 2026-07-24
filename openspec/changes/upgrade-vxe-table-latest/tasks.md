## 1. 依赖探针

- [ ] 1.1 使用 `npm view vxe-table version` 和 `npm view xe-utils version` 确认最终目标版本。
- [ ] 1.2 将 `template/package.json` 更新到选定的 `vxe-table` 与 `xe-utils` 版本。
- [ ] 1.3 使用 `cd template && pnpm install` 刷新 `template/pnpm-lock.yaml`。
- [ ] 1.4 运行 `cd template && pnpm test`，记录第一批兼容性失败。
- [ ] 1.5 运行 `cd template && pnpm build`，记录导入、类型和构建失败。

## 2. 运行时注册兼容

- [ ] 2.1 替换 `template/src/core/plugins/vxeTable.ts` 中已不适用的 VXE 深路径导入。
- [ ] 2.2 保留 VXE 中文 locale 设置。
- [ ] 2.3 注册当前页面和生成模板使用的全部 VXE 组件。
- [ ] 2.4 选择一种稳定样式导入策略，并移除过时的组件样式导入。
- [ ] 2.5 重新运行 `cd template && pnpm build`，验证导入兼容性。

## 3. 类型兼容

- [ ] 3.1 替换跨页选择代码和文档中的 `vxe-table/types/grid` 导入。
- [ ] 3.2 替换跨页选择代码和文档中的 `vxe-table/types/table` 导入。
- [ ] 3.3 验证或替换用户与角色 composable 中的 `VxeGridInstance` 用法。
- [ ] 3.4 当 VXE 公开导出无法提供稳定类型时，补充窄本地接口。
- [ ] 3.5 重新运行 `cd template && pnpm test` 和 `cd template && pnpm build`。

## 4. 行为回归

- [ ] 4.1 验证 `UserList` 可渲染、搜索、重置、分页、排序，并在删除后刷新。
- [ ] 4.2 验证 `RoleList` 可渲染、分页、排序、删除，并保持预期 grid 行为。
- [ ] 4.3 验证 `CrossPageCheckboxHeader` 可渲染，并能处理当前页选择与全页选择。
- [ ] 4.4 验证脚手架生成的 feature list 输出仍正确使用 `vxe-grid` 与 `gridOptions`。
- [ ] 4.5 验证模板使用的 VXE 组件没有 Vue unknown-component warning。

## 5. 主题桥接校准

- [ ] 5.1 检查 `vxe-table@4.20.7` 在 table、header、body、footer、pager、checkbox、sort 元素上的真实 DOM/CSS。
- [ ] 5.2 只有在新结构与当前结构不一致时，才更新 `template/src/core/theme/bridges/vxeTable.ts` 选择器。
- [ ] 5.3 更新主题桥接文件注释，标明最终已验证的 VXE 版本。
- [ ] 5.4 验证 `ThemePreview` 的 VXE showcase 在表头、边框、hover、current、checked、sort、pager、checkbox 状态下都跟随主题 token。

## 6. 最终门禁

- [ ] 6.1 运行 `cd template && pnpm test`。
- [ ] 6.2 运行 `cd template && pnpm build`。
- [ ] 6.3 运行根目录 `pnpm test`。
- [ ] 6.4 运行根目录 `pnpm build`。
- [ ] 6.5 检查最终 diff，确认依赖变更、兼容修复和主题校准都限制在本 OpenSpec change 范围内。
