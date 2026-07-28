# tailwind-v4-upgrade Specification

## Purpose
TBD - created by archiving change upgrade-tailwind-v4. Update Purpose after archive.
## Requirements
### Requirement: 模板 Tailwind 依赖升级到 v4 并切换官方 Vite 构建插件

模板 SHALL 将 Tailwind 升级到 v4 主版本线，并将构建链路从 PostCSS 切换到官方 `@tailwindcss/vite` 插件。

#### Scenario: 依赖清单体现 v4 升级目标

- **WHEN** 实现后检查 `template/package.json`
- **THEN** 它 MUST 将 `tailwindcss` 声明为 v4 主版本范围（`^4.x` 或经批准的精确锁定）
- **AND** 它 MUST 将 `@tailwindcss/vite` 声明为 devDependency
- **AND** 它 MUST NOT 再将 `autoprefixer` 作为依赖保留

#### Scenario: 构建链路切换到 Vite 插件

- **WHEN** 实现后检查 `template/vite.config.ts`
- **THEN** 它 MUST 注册 `@tailwindcss/vite` 插件
- **AND** 实现 MUST NOT 再通过 `postcss.config.js` 注册 `tailwindcss` 作为 PostCSS 插件

#### Scenario: CSS 入口改用 v4 指令

- **WHEN** 实现后检查 `template/src/assets/styles/tailwind.css`
- **THEN** 它 MUST 使用 `@import "tailwindcss"`
- **AND** 它 MUST NOT 再包含 `@tailwind base`、`@tailwind components`、`@tailwind utilities`

#### Scenario: Lockfile 与依赖清单一致

- **WHEN** 实现后安装 template 依赖
- **THEN** `template/pnpm-lock.yaml` MUST 将 `tailwindcss` 解析到 v4 版本
- **AND** 它 MUST 将 `@tailwindcss/vite` 解析为已安装依赖

### Requirement: 主题配置迁移到 CSS-first 并保留运行时换肤契约

模板 SHALL 删除 JS 配置范式（`tailwind.config.js` 与生成的 `theme.tailwind.json`），改由 token 流水线输出 CSS `@theme inline` 块，且其值继续指向运行时 `:root` CSS 变量，保持亮/暗 + 主色预设换肤行为不变。

#### Scenario: 不再存在 v3 JS 配置源

- **WHEN** 实现后检查 `template`
- **THEN** 它 MUST NOT 存在 `template/tailwind.config.js`
- **AND** 它 MUST NOT 存在 `template/theme.tailwind.json`

#### Scenario: 生成 CSS 主题产物取代 JSON

- **WHEN** 实现后运行 `cd template && pnpm run tokens:export`
- **THEN** 它 MUST 产出一份包含 `@theme inline` 块的 CSS 产物
- **AND** 该产物 MUST 仍保留 `theme.tokens.json` 作为原始 token 校验源

#### Scenario: @theme inline 值指向运行时变量而非字面量

- **WHEN** 实现后检查生成的 `@theme inline` 块
- **THEN** 颜色/文本/背景/边框主题键的值 MUST 为 `var(--*)` 引用（如 `--color-primary: var(--color-primary)`）
- **AND** 实现 MUST NOT 在 `@theme` 中写入会与 `setupTheme()` 运行时注入冲突的字面量颜色值

#### Scenario: 运行时主题系统保持不变

- **WHEN** 实现后检查 `template/src/core/theme/**`
- **THEN** 运行时 `:root` 变量注入、antd 与 vxe-table 桥接逻辑 MUST 与升级前行为一致
- **AND** 实现 MUST NOT 为本次升级修改 `template/src/core/theme/tokens.ts`

#### Scenario: 运行时换肤不退化

- **WHEN** `ThemePreview` 在亮色、暗色、各主色预设间切换
- **THEN** Tailwind 工具类驱动的元素（primary 文本、page 背景、title 颜色等）MUST 跟随主题变化
- **AND** 切换 MUST NOT 出现颜色停留在某一主题不随切换的问题

### Requirement: Token 流水线在 CSS 形态下保持一致性校验不变量

升级 SHALL 保留两条一致性不变量：`design.md ↔ tokens.ts` 的 light token 同步，以及「生成主题产物 ↔ 原始 token」的派生一致，且后者在 CSS 形态下继续成立。

#### Scenario: design.md 与 light token 保持同步

- **WHEN** 运行 `cd template && pnpm run tokens:check`
- **THEN** `assertLightTokensMatchRawTokens` MUST 仍校验 `theme.tokens.json` 与 `tokens.ts` 一致
- **AND** 二者不一致时 MUST 抛出明确错误

#### Scenario: 生成 CSS 与原始 token 保持一致

- **WHEN** 运行 `cd template && pnpm run tokens:check`
- **THEN** 校验 MUST 断言生成的 `@theme inline` CSS 与 `theme.tokens.json` 一致
- **AND** 二者不一致时 MUST 抛出明确错误，提示重新执行 `tokens:export`

#### Scenario: 颜色命名空间映射遵循 v4 统一规范

- **WHEN** 由固定 raw token 生成 CSS 产物
- **THEN** v3 的 `colors` / `textColor` / `backgroundColor` / `borderColor` MUST 统一映射为 v4 `--color-*` 键
- **AND** 每个键的值 MUST 指向对应的运行时变量（`var(--color-*)` / `var(--text-*)` / `var(--bg-*)` / `var(--border-*)`）

### Requirement: v4 破坏性改名工具类完成兼容修复

升级 SHALL 修复 `template/src` 内全部 v4 已改名工具类，确保现有 UI 视觉不因改名而退化。

#### Scenario: 已改名工具类不再残留

- **WHEN** 实现后搜索 `template/src`
- **THEN** 代码 MUST NOT 再使用 `shadow-sm` 等 v4 已改名工具类的旧形态
- **AND** 实现 MUST 按官方 v4 改名表将其映射到新形态（如 `shadow-sm → shadow-xs`）

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

#### Scenario: 本次升级不触及 demo

- **WHEN** 实现后检查最终 diff
- **THEN** `demo/` 目录 MUST NOT 出现因本次升级产生的改动
- **AND** 改动 MUST 限制在 `template/` 与本 OpenSpec change 范围内

### Requirement: 升级具备明确测试案例覆盖

升级 SHALL 增加或调整能覆盖 token CSS 产物、一致性校验、v3 范式残留约束、工具类改名约束和脚手架输出的测试案例。

#### Scenario: token CSS 产物测试覆盖映射契约

- **WHEN** 运行 token 契约相关测试
- **THEN** 测试 MUST 由固定 raw token 验证 `buildProjectTailwindThemeCss` 产出确定的 `@theme inline` CSS 串
- **AND** 测试 MUST 锁定 v3 → v4 命名空间映射

#### Scenario: 一致性校验测试覆盖失败路径

- **WHEN** 运行一致性校验测试
- **THEN** 测试 MUST 验证「生成 CSS 与 raw token 不一致」时 `tokens:check` 抛错

#### Scenario: 静态测试禁止 v3 范式回归

- **WHEN** 运行 tailwind v4 专项静态测试
- **THEN** 测试 MUST 断言 `template` 中不存在 `tailwind.config.js`、`theme.tailwind.json`、`@tailwind base`/`components`/`utilities` 与 PostCSS `tailwindcss` 配置
- **AND** 测试 MUST 断言 `template/src` 中不存在已改名 v3 工具类旧形态

#### Scenario: 脚手架模板测试覆盖 v4 入口

- **WHEN** 运行根目录脚手架模板测试
- **THEN** 生成的模板 MUST 含 `@import "tailwindcss"`
- **AND** 生成的模板 MUST 含 `@theme inline` 主题入口
