## 为什么

模板当前固定使用 `tailwindcss@^3.4.0`（lock 解析为 `3.4.19`），接入方式是经典 PostCSS + `tailwind.config.js` JS 配置。本次核实于 2026-07-27：tailwindcss 已进入 v4 主版本线。v4 不是版本号微调，而是一次配置范式迁移——从 JS 配置（`theme.extend`）转向 CSS-first（`@theme`），底层引擎换为 Lightning CSS，PostCSS 插件也被官方 Vite 插件取代。

这次升级必须按「配置范式迁移」处理，而不是只升版本号。但本模板的 tailwind 接入风险面其实很窄：

- 全项目 `@apply` / `theme()` / `@layer` / `@screen` **零使用**，CSS 侧几乎无耦合；
- tailwind 在业务里只承担工具类，主题真实颜色全部由运行时 `:root` CSS 变量（`setupTheme` 注入）持有，tailwind 配置里的值**全是 `var(--*)` 引用**，不持有任何颜色字面量；
- 破坏性改名工具类（如 `shadow-sm`）在 `template/src` 内用量极低。

真正的工程量集中在**主题 token 流水线**：当前 `design.md → theme.tokens.json → theme.tailwind.json → tailwind.config.js` 这条链是 v3 JS 形状，v4 下需要改为输出 CSS `@theme`。这是本次 change 的主战场。

## 变更内容

- 将 `template` 依赖目标从 `tailwindcss@^3.4.0` 升级到 v4 主版本线（`^4.x`），并新增官方 `@tailwindcss/vite` 构建插件。
- 构建链路从 PostCSS 路线切换到 `@tailwindcss/vite`：移除 `tailwindcss` 作为 PostCSS 插件的接入，移除冗余的 `autoprefixer`（v4 由 Lightning CSS 自带前缀处理）。
- CSS 入口从 `@tailwind base/components/utilities` 改为 `@import "tailwindcss"`。
- 主题配置范式迁移：删除 `tailwind.config.js` 与生成的 `theme.tailwind.json`，改为由 token 流水线输出一份 CSS `@theme inline` 块（`theme.tailwind.css`），其值继续指向现有运行时 CSS 变量（`var(--color-primary)` 等），保持运行时换肤契约不变。
- 改造 token 流水线脚本：`theme-token-contract.mjs` 新增 CSS 构建器与一致性校验；`export-theme-tokens.mjs` 写出 `theme.tailwind.css`；`check-theme-consistency.ts` 改为校验「生成 CSS ↔ 原始 token」一致。
- 修复 v4 破坏性改名工具类（如 `shadow-sm → shadow-xs`）在 `template/src` 中的残留用法。
- 保持 `core/theme` 运行时主题系统（`:root` 变量注入、antd / vxe-table 桥接）完全不动。

## 能力

### 新增能力

- `tailwind-v4-upgrade`：覆盖升级后的 Tailwind v4 依赖契约、CSS-first 配置范式、token 流水线 CSS 输出、构建链路切换、工具类改名兼容，以及三端主题桥接的视觉回归要求。

### 修改能力

- 无。当前仓库 `openspec/specs/` 下没有需要修改的既有主规格。

## 影响范围

- 依赖：
  - `template/package.json`
  - `template/pnpm-lock.yaml`
- 构建链路：
  - `template/vite.config.ts`（新增 `@tailwindcss/vite` 插件）
  - `template/postcss.config.js`（移除 tailwind / autoprefixer，或整体下线）
- 配置范式（删除 / 替换）：
  - `template/tailwind.config.js`（删除）
  - `template/theme.tailwind.json`（删除，由 CSS 产物取代）
  - `template/theme.tailwind.css`（新增，生成产物）
- CSS 入口：
  - `template/src/assets/styles/tailwind.css`（改 `@import "tailwindcss"`，引入生成的 `@theme inline`）
- Token 流水线：
  - `template/scripts/theme-token-contract.mjs`（新增 CSS 构建器与校验）
  - `template/scripts/export-theme-tokens.mjs`（输出 `theme.tailwind.css`）
  - `template/scripts/check-theme-consistency.ts`（重写一致性校验目标）
- 工具类改名修复：
  - `template/src` 内含 `shadow-sm` 等 v4 改名工具类的位置（实现阶段 grep 定位）
- 明确不动（非目标）：
  - `template/src/core/theme/**`（运行时 `:root` 变量注入、antd / vxe-table 桥接逻辑）
  - `template/src/core/theme/tokens.ts`（light token 源）
  - `demo/`（本次范围只限 `template/`，demo 维持 v3，后续另起 change 同步）
- 验证：
  - `template` 单元测试与构建
  - 根目录 CLI 测试与构建
  - `ThemePreview` 的 Tailwind showcase 在亮/暗 + 主色预设下的视觉冒烟
