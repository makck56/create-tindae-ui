## Why

当前模板仍依赖 `ant-design-vue@^3.2.0`，但脚手架其余运行栈已经升级到 Vue 3.5 / Vite 8 / Tailwind v4。升级到 Ant Design Vue v4 可以让 UI 组件库与当前运行环境对齐，并把脆弱的选择器覆盖式主题桥接，迁移为更可维护的 ConfigProvider token 映射。

## What Changes

- 将模板依赖从 `ant-design-vue@^3.2.0` 升级到当前 v4 主版本线，并保持 `@ant-design/icons-vue` 在兼容的 v7 主版本线。
- **BREAKING**: 替换 v3 专属样式入口 `ant-design-vue/dist/antd.css`，改用 Ant Design Vue v4 所需的 CSS-in-JS/reset 样式接入方式。
- **BREAKING**: 将 Ant Design Vue 弹层显隐绑定从 `visible` 迁移到 v4 的 `open` 契约。
- 将当前注入大量 `.less` 选择器覆盖的 Ant Design 主题桥接，替换为消费项目主题 token 的运行时 `ConfigProvider` theme-token 映射。
- 保持现有项目主题契约：切换主题预设或明暗模式时，Ant Design Vue、VXE Table、Tailwind CSS 工具类和 ECharts 必须继续一致联动。
- 更新 README 和脚手架契约测试，确保生成模板文档描述真实的 UI 依赖版本和迁移行为。
- 新增或更新针对依赖契约、弹层 API、主题桥接行为、模板构建兼容性的聚焦测试。

## Capabilities

### New Capabilities
- `ant-design-vue-v4-upgrade`: 定义模板从 Ant Design Vue v3 迁移到 v4 后必须满足的行为，包括依赖版本、样式入口、弹层 API 兼容、以及 token 驱动的主题集成。

### Modified Capabilities
- None.

## Impact

- 受影响依赖：`template/package.json`、`template/pnpm-lock.yaml`，以及断言 UI 技术栈的生成模板文档和测试。
- 受影响运行时入口：`template/src/core/plugins/antd.ts`、`template/src/App.vue`，以及 `template/src/core/theme` 下的主题启动和 Provider 文件。
- 受影响主题桥接：`template/src/core/theme/bridges/antd.ts` 和 `template/src/core/theme/bridges/antd/*.less`。
- 受影响组件使用：Popover、Modal、Drawer 等 Ant Design Vue 弹层，尤其是现有 `v-model:visible` 绑定。
- 受影响验证：template Vitest 套件、根目录脚手架测试、template 构建、根目录构建，以及主题预览页和跨页选择 Popover 的浏览器/人工检查。
