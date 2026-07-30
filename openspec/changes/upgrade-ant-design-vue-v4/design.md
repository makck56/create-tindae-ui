## 背景

脚手架模板当前使用 `ant-design-vue@^3.2.0`，运行环境是 Vue 3.5 和 Vite 8。Ant Design Vue v3 提供全局编译样式表 `ant-design-vue/dist/antd.css`；项目再通过注入 `core/theme/bridges/antd/*.less` 覆盖样式，让 Ant 组件跟随项目运行时 CSS 变量。

Ant Design Vue v4 将样式模型改为 CSS-in-JS，并通过 `ConfigProvider` 暴露运行时主题 token。这让当前大量选择器覆盖的 Ant 桥接层不再合适，但迁移也会横跨多个面：依赖解析、样式入口、ConfigProvider 接入、弹层组件 API、文档、测试和浏览器视觉验证都需要一起处理。

仓库当前还存在未完成的 `upgrade-vxe-table-latest` OpenSpec 变更。本次 Ant Design Vue v4 迁移必须限定在 Ant/template 范围内，不能把 VXE 的浏览器/人工任务标记为完成。

## 目标 / 非目标

**目标：**
- 将模板迁移到 Ant Design Vue v4，同时保留脚手架现有 Vue 3.5 / Vite 8 运行栈。
- 替换 v3 专属 `antd.css` 和选择器覆盖式主题假设，改为 v4 兼容的样式加载与 ConfigProvider token 映射。
- 保持 Ant Design Vue、VXE Table、Tailwind CSS、ECharts 的统一主题联动行为。
- 将已知 v3 弹层显隐 API（`visible`）迁移到 v4 `open` 契约。
- 更新 README 和脚手架契约测试，让生成项目描述真实的 Ant Design Vue 版本。
- 定义包含单元测试、构建、主题预览与弹层行为浏览器/人工检查的验证门槛。

**非目标：**
- 不重新设计产品 UI 或改变页面工作流。
- 不在本变更中升级 Vue、Vite、Tailwind、VXE Table、ECharts、Pinia 或 router。
- 不完成或归档现有 VXE 升级变更。
- 除非后续实现明确需要 demo-first 的 bug 修复流程，否则不迁移生成的 `demo/` 子仓库。
- 不引入新的组件库抽象层。

## 技术决策

### 决策 1：将 Ant Design Vue v4 视为模板能力升级

依赖升级不只是 lockfile 变化。能力契约需要覆盖运行时样式加载、主题 token 行为、弹层 API 兼容、文档和验证。

备选方案：把它当作小型依赖 bump。这个方案风险过高，因为 `ant-design-vue/dist/antd.css` 和 `v-model:visible` 都是 v3 假设，可能在编译期或运行时直接破坏模板。

### 决策 2：以 ConfigProvider theme tokens 作为 Ant 主题桥接主路径

实现应从现有 `ThemeTokens` 构造 Ant Design Vue v4 theme 对象，并传入 `a-config-provider`。现有 `applyTokensToRoot()` 流程仍作为 CSS 变量的共享来源，而 Ant 通过直接 token 对象消费 v4 组件主题。

备选方案：升级后继续保留完整 `.less` 覆盖桥接。这个方案会保留当前系统中最脆弱的部分，并且与 v4 样式模型对抗。只有经过浏览器验证证明确有缺口时，才允许保留少量兜底 CSS。

### 决策 3：保持“首屏 CSS 变量初始化”和“组件级 token 传递”分层

`setupTheme()` 应继续在 mount 前写入项目 CSS 变量，避免首屏主题闪烁。`ThemeProvider` 或紧邻的 Provider 层应暴露传给 `a-config-provider` 的响应式 Ant theme 对象，使明暗模式和预设切换同时更新 CSS 变量与 Ant Design Vue token。

备选方案：把所有主题行为都移动到 `App.vue`。这会让根组件承担底层 token 翻译职责，并削弱现有 `core/theme` 的所有权边界。

### 决策 4：显式迁移已知弹层 API，并用测试防止 v3 回归

现有 `v-model:visible` 使用必须迁移到 v4 要求的 `v-model:open`。静态测试应防止 v3-only API 回到模板代码中。

备选方案：只依赖 TypeScript/构建错误发现 API 变化。构建错误能发现一部分问题，但不能覆盖所有视觉或交互回归；显式静态契约对脚手架更稳。

### 决策 5：同时使用自动化验证和浏览器/人工验证

自动化检查必须覆盖依赖版本、已移除样式入口、visible/open 使用、文档、token 桥接行为和构建。浏览器/人工检查必须覆盖 Ant 主题预览区块、布局/菜单、表单控件、Modal/Drawer/Popover、message/notification、日期/时间控件，以及跨页选择 Popover。

备选方案：只接受单元测试和构建验证。这不够，因为 CSS-in-JS 迁移可能构建通过，但仍出现颜色不跟随、弹层层级错误或交互失效。

## 风险 / 取舍

- Ant v4 CSS-in-JS 样式可能晚于项目兜底样式注入 -> Mitigation: 优先使用 ConfigProvider token 映射，而不是高特异性覆盖；任何兜底 CSS 都要保持最小且有明确加载意图。
- `bridges/antd/*.less` 中部分 v3 class 名在 v4 可能不再存在 -> Mitigation: 只有确认等价 v4 token 后才移除或改写选择器覆盖；对缺口保留浏览器截图/检查清单。
- `visible` 到 `open` 迁移可能漏掉低频组件 -> Mitigation: 为 `template/src` 中的 `v-model:visible`、`:visible`、`visible=` 增加静态搜索/测试覆盖。
- token 映射可能无法覆盖每个项目语义色 -> Mitigation: 先覆盖核心全局 token（`colorPrimary`、success/warning/error/info、圆角、文本、边框、容器背景），再根据浏览器验证补充组件级 token。
- lockfile 更新可能引入意外传递依赖变化 -> Mitigation: 提交前做聚焦依赖 diff review，并跑完整 template/root 验证。
- 现有 VXE 变更仍在进行中 -> Mitigation: 保持本 OpenSpec 变更范围独立，不触碰 VXE tasks 或 archive 状态。

## 迁移计划

1. 实现前用 `npm view` 确认准确目标版本。
2. 更新 `template/package.json` 和 lockfile 到 Ant Design Vue v4。
3. 替换 v3 全局样式表导入，接入 v4 兼容 reset/style。
4. 在 `core/theme` 中新增项目 token 到 Ant token 的映射器。
5. 将计算得到的 Ant theme 接入 `a-config-provider`，同时避免把无关布局职责移动到 `App.vue`。
6. 将已知弹层显隐 API 从 `visible` 迁移到 `open`。
7. 只有在 token 桥接覆盖当前视觉要求后，才删除或缩小过时 v3 `.less` 覆盖文件。
8. 更新 README 和脚手架契约测试。
9. 运行自动化验证。
10. 针对主题预览页和跨页选择 Popover 运行浏览器/人工验证。

回滚路径清晰：在发布前，整体回退依赖、lockfile、样式入口、token 桥接、API 迁移和文档/测试即可。由于这是脚手架模板，必须等待生成模板构建和浏览器验证都通过后再发布。

## 待确认问题

- 实现时应将 `ant-design-vue` 固定为 `^4.2.6` 还是精确 `4.2.6`？默认建议：使用 `^4.2.6`，与仓库现有 semver 风格一致；除非有更强的可复现性要求才精确锁定。
- 旧 `.less` 桥接目录应完全删除，还是保留一个小型 v4 fallback 文件？默认建议：删除过时 v3 选择器文件；如果浏览器验证发现缺口，最多保留一个命名清晰的 fallback bridge。
- 是否在同一实现中升级 `demo/`？默认建议：不升级，除非用户明确要求针对具体 bug 走 demo-first 验证。
