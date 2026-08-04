## Context

`template` 是生成项目的源头，使用者会依赖它判断默认页面、技术栈、业务脚手架和验证命令。当前问题集中在三类漂移：

- 文档描述与真实文件/依赖不一致，例如 README 提到不存在的 `/order-management`，AGENTS 仍写 Ant Design Vue v3。
- 路由只在开发态注册 `/readme`、`/theme-preview`，但菜单配置无条件包含这两个入口。
- 脚手架新增 feature 时使用单独的 `FeaturePascal` 作为路由名，跨域同名 feature 会冲突。

本次设计只处理模板一致性和脚手架安全性，不改变业务页面视觉，不引入新 UI 框架。

## Goals / Non-Goals

**Goals:**

- 让模板文档、菜单、路由和 `package.json` 表达同一个事实。
- 让生产构建不会出现指向开发态专用页面的菜单入口。
- 让脚手架生成的 route name、menu code、page component name 默认具备跨域唯一性。
- 增加模板健康检查命令，降低发布前漏检概率。
- 为关键规则补充单测，避免后续模板迭代再次漂移。

**Non-Goals:**

- 不把 `@kibus/tm-ui` 纳入模板默认依赖。
- 不重构现有页面布局和主题视觉。
- 不改变 HTTP 响应封装、权限模型和 MSW 基本架构。
- 不改 CLI 主包的模板定位逻辑。

## Decisions

### 1. 开发态菜单从配置层过滤，而不是让路由兜底

生产构建下 `/readme` 和 `/theme-preview` 的路由不会注册，因此菜单也必须在同一环境下隐藏。优先在菜单配置导出处按 `import.meta.env.DEV` 组合，保持侧边栏和 mock 登录返回的 `menuConfig` 使用同一真相源。

备选方案是在路由守卫遇到缺失路由时跳 404，但这只能处理结果，不能阻止用户看到无效入口。

### 2. 脚手架 route name 使用域名前缀

新增 feature 的默认 route name 调整为 `${DomainPascal}${FeaturePascal}`，例如 `SalesOrder`、`FinanceOrder`。这样同名 feature 在不同业务域下仍具备全局唯一性。

备选方案是要求使用者手动避免同名 feature，但这会把模板可自动规避的风险转嫁给业务开发者。

### 3. 文档只描述模板真实内置能力

README 内置页面列表必须来自当前真实路由；不存在的 `/order-management` 先移除，不在文档里保留“计划能力”。AGENTS 技术栈必须与 `package.json` 当前依赖一致。

### 4. 健康检查命令采用组合脚本

新增 `template:check` 聚合现有 `tokens:check`、`test`、`build` 和脚手架 dry-run。它不替代单项命令，而是作为模板同步/发布前的默认检查入口。

## Risks / Trade-offs

- [Risk] 改 route name 会影响之后由脚手架生成的新页面命名习惯。→ Mitigation：只调整新增生成逻辑，并同步 README/AGENTS 说明；已有路由不做迁移。
- [Risk] 生产菜单过滤依赖 `import.meta.env.DEV`，测试环境需要注入 Vite 环境语义。→ Mitigation：通过纯函数或可测试导出覆盖菜单过滤逻辑。
- [Risk] 健康检查命令耗时比单项命令更长。→ Mitigation：保留单项命令，`template:check` 仅作为发布前总闸口。
