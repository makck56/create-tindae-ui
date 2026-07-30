# Ant Design Vue v4 Upgrade Specification

## Purpose
定义模板升级到 Ant Design Vue v4 后的依赖、样式入口、主题 token、弹层 API、文档和验证要求。

## Requirements

### Requirement: 模板依赖 Ant Design Vue v4
模板 SHALL 声明 Ant Design Vue v4 作为 Ant Design Vue 依赖，并保持 icon package 与该版本线兼容。

#### Scenario: 依赖清单体现 Ant Design Vue v4
- **WHEN** 实现后检查 `template/package.json`
- **THEN** `ant-design-vue` MUST 解析到 v4 主版本线
- **AND** `@ant-design/icons-vue` MUST 保持在与 Ant Design Vue v4 兼容的版本线

#### Scenario: Lockfile 解析到升级后的 package
- **WHEN** 实现后安装 template 依赖
- **THEN** `template/pnpm-lock.yaml` MUST 将 `ant-design-vue` 解析到 v4 版本
- **AND** lockfile MUST NOT 保留 v3 `ant-design-vue` package resolution

### Requirement: 模板使用 Ant Design Vue v4 样式加载方式
模板 SHALL 移除 v3-only 的 `ant-design-vue/dist/antd.css` 样式入口，并使用 v4 兼容的样式接入方式。

#### Scenario: 移除 v3 全局样式表
- **WHEN** 实现后搜索 `template/src`
- **THEN** 代码 MUST NOT import `ant-design-vue/dist/antd.css`

#### Scenario: v4 reset style 可用
- **WHEN** 实现后 template app 启动
- **THEN** Ant Design Vue 组件 MUST 获得 v4 所需的 base reset/style 行为
- **AND** app MUST NOT 依赖已移除的 v3 全局样式表实现组件样式

### Requirement: Ant Design Vue 主题由项目 token 驱动
模板 SHALL 将现有项目 `ThemeTokens` 映射为 Ant Design Vue v4 `ConfigProvider` theme 对象，使 Ant 组件跟随 light/dark mode 和 preset 变化。

#### Scenario: 用户交互前应用初始主题
- **WHEN** app 使用持久化 theme mode 或 preset 首次渲染
- **THEN** Ant Design Vue 组件 MUST 使用与 Tailwind、VXE Table、ECharts 相同项目主题派生出的 token 值渲染

#### Scenario: 运行时主题切换更新 Ant 组件
- **WHEN** 用户切换 light/dark mode 或 active theme preset
- **THEN** Ant Design Vue primary color、text color、border color、container background 和 radius tokens MUST 在不刷新页面的情况下更新

#### Scenario: 选择器桥接收敛到已验证缺口
- **WHEN** 实现完成
- **THEN** Ant theme bridge MUST NOT 依赖旧 v3-only selector override set 作为主要主题机制
- **AND** 任何剩余 Ant fallback CSS MUST 被记录为 v4-specific gap，并说明原因

### Requirement: 迁移 v3 弹层显隐 API
模板 SHALL 对 overlay 组件使用 Ant Design Vue v4 显隐契约。

#### Scenario: Popover 使用 open 绑定
- **WHEN** 跨页选择 header popover 被打开和关闭
- **THEN** 它 MUST 使用 v4 `open` binding contract
- **AND** select-current-page 和 select-all 工作流 MUST 保持可交互

#### Scenario: Modal 和 Drawer 使用 open 绑定
- **WHEN** 主题预览页 Modal 和 Drawer 示例被打开和关闭
- **THEN** 它们 MUST 使用 v4 `open` binding contract
- **AND** 它们的 confirm/cancel/close 交互 MUST 保持可用

#### Scenario: 不残留 v3 visible 绑定
- **WHEN** 实现后搜索 `template/src`
- **THEN** Ant Design Vue overlay 用法 MUST NOT 保留 `v-model:visible`、`:visible` 或 `visible=` 绑定，除非 v4 文档证明某个具体组件仍然需要该写法

### Requirement: 文档和脚手架测试描述升级后的 UI 技术栈
脚手架 SHALL 文档化真实的 Ant Design Vue v4 依赖线，并通过测试强制该契约。

#### Scenario: README 文件声明当前依赖
- **WHEN** 实现后检查根目录 `README.md` 和 `template/README.md`
- **THEN** 两个文件 MUST 将模板 UI 技术栈描述为 Ant Design Vue v4
- **AND** 它们 MUST NOT 声称模板使用 `ant-design-vue@^3.2.0`

#### Scenario: 脚手架契约测试强制文档一致
- **WHEN** 实现后运行根目录脚手架测试
- **THEN** README 契约测试 MUST 断言 Ant Design Vue v4 依赖描述
- **AND** 如果文档回退到 v3 文案，测试套件 MUST fail

### Requirement: 升级通过自动化与浏览器验证
升级 SHALL 通过仓库自动化验证门槛，并包含高风险 Ant Design Vue 表面的浏览器/人工检查。

#### Scenario: Template 自动化验证通过
- **WHEN** 在 `template` 中运行 `pnpm test`
- **THEN** 所有 template 测试 MUST pass
- **WHEN** 在 `template` 中运行 `pnpm build`
- **THEN** template production build MUST pass

#### Scenario: 根目录自动化验证通过
- **WHEN** 在 repo root 运行 `pnpm test`
- **THEN** 所有 scaffold tests MUST pass
- **WHEN** 在 repo root 运行 `pnpm build`
- **THEN** CLI build MUST pass

#### Scenario: 浏览器验证覆盖关键 Ant 表面
- **WHEN** 在浏览器中验证升级后的 template
- **THEN** 主题预览页 MUST 在 buttons、forms、data display、feedback、overlays、date/time controls、layout 和 menu 上展示正确的 Ant Design Vue 样式
- **AND** 切换 theme mode 和 preset MUST 可见地更新 Ant 组件
- **AND** 跨页选择 popover MUST 可以打开、关闭，并正确执行 selection actions
