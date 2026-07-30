## 1. 依赖与基线审计

- [x] 1.1 实现前用 `npm view` 确认目标 `ant-design-vue` 和 `@ant-design/icons-vue` 版本。
- [x] 1.2 检查 `template/src` 当前 Ant 使用面，并记录所有必须迁移的 v3-only 样式/API 假设。
- [x] 1.3 审查 `template/src/core/theme/bridges/antd*` 下现有主题桥接文件，识别哪些行为应迁移到 ConfigProvider token。

## 2. 升级依赖与样式入口

- [x] 2.1 更新 `template/package.json`，使用 Ant Design Vue v4，并保持 icons 在兼容的 v7 版本线。
- [x] 2.2 刷新 `template/pnpm-lock.yaml`，确保 Ant Design Vue 依赖解析到升级后的版本。
- [x] 2.3 将 `ant-design-vue/dist/antd.css` 替换为 v4 兼容的 style/reset 入口。
- [x] 2.4 增加静态测试，确保已移除的 v3 样式表导入不会回归。

## 3. 主题 Token 集成

- [x] 3.1 新增聚焦映射器，将项目 `ThemeTokens` 转换为 Ant Design Vue v4 ConfigProvider theme 对象。
- [x] 3.2 将 Ant theme 对象接入根级 `a-config-provider`，同时保留现有中文 locale 行为。
- [x] 3.3 保留 `setupTheme()` 首屏 CSS 变量初始化，用于 Tailwind、VXE Table 和非 Ant 消费方。
- [x] 3.4 用 token-based 行为替换旧 v3 选择器密集型 Ant 桥接；只有浏览器验证证明存在缺口时，才保留有文档说明的 v4-specific fallback CSS。
- [x] 3.5 为 Ant token 映射器增加单元测试，覆盖主色、状态色、文本色、边框色、背景色和圆角映射。

## 4. 组件 API 迁移

- [x] 4.1 将 `CrossPageCheckboxHeader.vue` 从 `v-model:visible` 迁移到 v4 `open` 绑定契约。
- [x] 4.2 将主题预览页 Modal 和 Drawer 示例从 `v-model:visible` 迁移到 `v-model:open`。
- [x] 4.3 搜索 `template/src` 中残留的 `v-model:visible`、`:visible`、`visible=` Ant 弹层用法，并迁移或记录 v4 文档认可的例外。
- [x] 4.4 增加静态测试，防止 v3-only 弹层显隐绑定回归。

## 5. 文档与脚手架契约

- [x] 5.1 更新根目录 `README.md`，将模板 UI 技术栈描述为 Ant Design Vue v4。
- [x] 5.2 更新 `template/README.md`，将模板 UI 技术栈描述为 Ant Design Vue v4。
- [x] 5.3 更新根目录脚手架 README 契约测试，断言 v4 依赖文案。
- [x] 5.4 检查生成模板文档中是否仍残留 `ant-design-vue@^3.2.0`、`antd.css` 或 v3 弹层文案。

## 6. 自动化验证

- [x] 6.1 运行聚焦 template 测试，覆盖 Ant token 映射器、style-entry 契约、overlay API 契约、跨页选择行为和 README 契约变更。
- [x] 6.2 在 `template` 中运行 `pnpm test`。
- [x] 6.3 在 `template` 中运行 `pnpm build`。
- [x] 6.4 在根目录运行 `pnpm test`。
- [x] 6.5 在根目录运行 `pnpm build`。
- [x] 6.6 staging 或 commit 前，恢复构建生成的 `template/src/shared/constants/routeNames.ts` 时间戳噪音。

## 7. 浏览器与人工验证

- [x] 7.1 启动 template dev server，确认应用启动时没有 Ant Design Vue CSS-in-JS 或运行时 console error。
- [x] 7.2 验证主题预览页中的 Ant buttons、forms、data display、feedback、overlays、date/time controls、layout 和 menu。
- [x] 7.3 切换 light/dark 模式和每个 preset，确认 Ant 组件与 Tailwind、VXE Table、ECharts 一起跟随项目主题。
- [x] 7.4 打开并关闭主题预览页 Modal 和 Drawer，验证 `open` 绑定与关闭交互。
- [x] 7.5 验证跨页选择 Popover 可以打开、关闭，并能执行 select-current-page 和 select-all 操作。
- [x] 7.6 将任何剩余视觉缺口记录为明确的 v4 fallback CSS 或后续任务，不能静默接受回归。

## 8. 最终审查

- [x] 8.1 运行 `openspec validate upgrade-ant-design-vue-v4 --strict`。
- [x] 8.2 审查最终 diff，确认本变更范围限制在 `template/`、根目录 docs/tests 和本 OpenSpec change。
- [x] 8.3 确认现有 `upgrade-vxe-table-latest` OpenSpec 变更保持独立，且未被本工作标记完成。
