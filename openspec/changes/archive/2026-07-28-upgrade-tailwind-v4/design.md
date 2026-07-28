## 背景

当前状态核实于 2026-07-27（勘测对象为 `template/`，关键文件与 `demo/` 逐文件比对，除 `package.json` 外全部 IDENTICAL）：

| 区域 | 当前状态 | 升级关注点 |
|---|---|---|
| 依赖 | `tailwindcss: ^3.4.0`（lock `3.4.19`），`autoprefixer: ^10.4.0`，`postcss: ^8.4.0` | v4 主版本线；底层引擎换 Lightning CSS；`autoprefixer` 在 v4 下冗余 |
| 构建链路 | `postcss.config.js` 注册 `tailwindcss + autoprefixer` | 官方推荐 Vite 项目改用 `@tailwindcss/vite`，HMR 更快、可整体下线 PostCSS 配置 |
| 配置范式 | `tailwind.config.js` 在加载时读取生成的 `theme.tailwind.json` 展开进 `theme.extend`（JS 配置） | v4 为 CSS-first（`@theme`）；JS 配置退为二等公民（仅 `@config` 兼容） |
| Token 流水线 | `design.md →(@google/design.md CLI)→ theme.tokens.json →(buildProjectTailwindExtend)→ theme.tailwind.json →(loadThemeTokens)→ tailwind.config.js` | 整条链是 v3 JS 形状；`@google/design.md` CLI 吐 v3 shape，无法改上游，只能在适配层转 |
| 主题值来源 | `theme.extend` 的值**全是 `var(--*)` 引用**，真实颜色由 `setupTheme()` 在运行时写入 `:root`，并桥接 antd / vxe-table | 迁移时必须保留「tailwind 只生成工具类、不持有颜色」的契约 |
| 业务用法 | 全项目 `@apply` / `theme()` / `@layer` / `@screen` 零使用；破坏性改名工具类（`shadow-sm` 等）用量极低 | CSS 侧破坏面近乎为零；仅个别改名工具类需手改 |

这次升级有三个互相影响的部分：

```text
构建链路 (PostCSS → @tailwindcss/vite)
   |
   v
配置范式 (JS config → CSS @theme) -----> token 流水线 (JSON → CSS 产物)
   |                                         |
   v                                         v
工具类改名兼容 ---------------------------> 主题桥接视觉回归
```

## 目标 / 非目标

**目标：**

- 将模板 Tailwind 升级到 v4 主版本线，构建链路切换到 `@tailwindcss/vite`。
- 配置范式迁移到 CSS-first：删除 `tailwind.config.js`，token 流水线改为输出 CSS `@theme inline` 块。
- 保留现有主题系统契约：tailwind 工具类继续由运行时 `:root` CSS 变量驱动；antd / vxe-table 桥接零改动。
- 保留 token 一致性校验契约：`design.md ↔ tokens.ts`、`生成产物 ↔ 原始 token` 两条不变量在 CSS 形态下继续成立。
- 建立能证明构建、单测、运行时主题视觉都通过的验证路径。

**非目标：**

- 本次不改 `demo/`（demo 维持 v3，后续另起 change 同步）。
- 本次不重写 `core/theme` 运行时主题系统（`:root` 注入、亮/暗、主色预设、antd / vxe 桥接）。
- 本次不引入 `@config` 兼容路线（见 Decision 1）作为长期方案。
- 本次不把 spacing 改为 v4 动态 `--spacing` 基准（见 Decision 6，保留显式键以求与 v3 精确对齐）。
- `docs/*` 旧文档若与本 change 冲突，以本 change 为准。

## 决策

### Decision 1: 采用路线 2（CSS-first `@theme` 重构），不采用路线 1（`@config` 兼容）

原因：本模板的主题哲学本就是「CSS 变量驱动」，v4 的 CSS-first 与其一致；`@config` 路线会让 JS 配置长期作为二等公民存在，且无法享受 v4 CSS-first 的可维护性。

备选方案（路线 1）：保留 `tailwind.config.js` + `theme.tailwind.json`，仅在 CSS 里加 `@config "../tailwind.config.js"`。拒绝原因：工程量虽小，但属于过渡姿态，token 流水线的 v3 形状被永久固化，与项目「单一真理源 + 派生产物」的设计相悖。

### Decision 2: 用 `@theme inline` 承载主题映射，保留运行时换肤契约（核心机制）

本模板 `theme.extend` 的值**全是 `var(--color-primary)` 这类运行时变量引用**。在 v4 中：

- 普通 `@theme { --color-primary: var(--color-primary) }` 会在 `:root` 重复声明 `--color-primary`，与 `setupTheme()` 的运行时写入产生**循环引用 / 覆盖**，破坏亮/暗 + 主色预设切换。
- `@theme inline { --color-primary: var(--color-primary) }` 则把值**内联进工具类**：生成 `.bg-primary { background-color: var(--color-primary) }`，**不在 `:root` 重复声明变量**。

这正好等价于 v3 的行为，且让 `setupTheme()` 注入的运行时 `:root` 变量继续作为唯一真实值来源。因此：

- `core/theme/**`（运行时注入、antd / vxe 桥接）**完全不动**；
- `@theme inline` 只负责告诉 v4「生成 `bg-primary` / `text-title` / `bg-page` 等工具类，其值指向这些既有运行时变量」。

实现阶段必须以一次 `ThemePreview` 视觉冒烟验证 `inline` 确实生效（切换亮/暗 + 主色预设，Tailwind 工具类随之变化）。

### Decision 3: 接受 v4 统一 `--color-*` 命名空间（合并 text/bg/border 颜色）

v3 把颜色拆成 `colors` / `textColor` / `backgroundColor` / `borderColor` 四组；v4 统一为 `--color-*`。映射如下（值仍指向各自运行时变量，无冲突）：

| v3 键 | v4 `@theme inline` 键 | 值（运行时变量引用） |
|---|---|---|
| `colors.primary.DEFAULT` | `--color-primary` | `var(--color-primary)` |
| `textColor.title` | `--color-title` | `var(--text-title)` |
| `backgroundColor.page` | `--color-page` | `var(--bg-page)` |
| `borderColor.base` | `--color-base` | `var(--border-base)` |

副作用：v4 会为每个 `--color-*` 同时生成 `bg-*` / `text-*` / `border-*` 工具类，比 v3 多一些可用类（例如 `bg-title`）。在本模板中无命名冲突，属可接受增强。实现阶段需 grep 确认无自定义类与新生成类同名。

### Decision 4: 构建链路切换到 `@tailwindcss/vite`，下线 PostCSS 接入

原因：Vite 8 项目官方推荐 `@tailwindcss/vite`，HMR 更快、配置更少，可整体删除 `postcss.config.js`。`autoprefixer` 在 v4 下由 Lightning CSS 接管，一并移除。

备选方案：保留 PostCSS，仅把插件换为 `@tailwindcss/postcss`。拒绝原因：在已有 Vite 插件方案下收益更低，且多保留一层 PostCSS 配置。

实现阶段需确认 `@tailwindcss/vite` 与既有 `unplugin-vue-components`、`defineRenderPlugin`、`autoRoutesPlugin`、`menuVisualizerPlugin` 共存无冲突（以一次 `pnpm build` 为门禁）。

### Decision 5: Token 流水线改为输出 CSS `@theme inline`，保留 `theme.tokens.json` 作为原始校验源

新流水线：

```text
design.md
  → tokens:export (@google/design.md CLI → json-tailwind)
  → theme.tokens.json (raw, 保留, 仍是校验 SSoT)
  → buildProjectTailwindThemeCss()  ← 新增：把 v3 extend 形状转成 @theme inline CSS
  → theme.tailwind.css (新增生成产物, 取代 theme.tailwind.json)
  → src/assets/styles/tailwind.css:  @import "tailwindcss"; @import "./theme.tailwind.css";

下线：
  - tailwind.config.js (删除)
  - theme.tailwind.json (删除, 避免双源)
```

`@google/design.md` CLI 仍只能吐 v3 shape，无法改上游；CSS 构建器在适配层把 v3 键映射成 v4 `@theme inline` 键（见 Decision 3 的映射表）。原始 token 的 hex 值仍参与 `design.md ↔ tokens.ts` 一致性校验，校验不变量不丢。

### Decision 6: spacing / fontSize / borderRadius 的 v4 语法映射

- **spacing**：v3 同时有数字刻度（`calc(var(--space-unit) * N)`）与命名键（`xs/sm/...`）。v4 下保留**显式 `--spacing-N` / `--spacing-xs` 键**，与 v3 精确对齐；不采用 v4 动态 `--spacing` 基准（避免改变刻度契约）。动态 spacing 列为未来可选项。
- **fontSize**：v3 `[size, {lineHeight, fontWeight}]` 元组 → v4 `--text-<name>` 主键 + `--text-<name>--line-height` / `--text-<name>--font-weight` 副键。
- **borderRadius**：v3 有 `DEFAULT`（裸 `rounded`）。v4 下裸 `rounded` 的映射需在实现时按官方迁移指南敲定（候选：`--radius-default` 或显式 `--radius`），并以「裸 `rounded` 仍输出原值」为验收点。

### Decision 7: 工具类改名按 v4 迁移指南机械修复

`shadow-sm → shadow-xs`（及 `shadow → shadow-sm` 等）。在 `template/src` 内 grep 定位全部命中点，按 v4 官方改名表逐项修正。本模板命中量极低，无需自动化 codemod。

## 风险 / 取舍

| 风险 | 缓解方式 |
|---|---|
| `@theme inline` 未生效 → 工具类指向错误的 `:root` 变量或循环引用 | `ThemePreview` 亮/暗 + 主色预设视觉冒烟；确认 `core/theme` 零改动 |
| v4 统一 `--color-*` 生成额外工具类与自定义类同名冲突 | 实现阶段 grep `template/src` 自定义 class，确认无同名 |
| `@tailwindcss/vite` 与既有 Vite 插件链冲突 | 以 `cd template && pnpm build` 为门禁；必要时回退到 `@tailwindcss/postcss` |
| 裸 `rounded`（v3 `DEFAULT`）在 v4 映射偏差 | 实现阶段核实官方指南，加针对性视觉断言 |
| `@google/design.md` CLI 仅吐 v3 shape，未来升级破坏适配层 | 适配层集中在一个构建函数内，隔离变更；保留 raw JSON 作为校验锚点 |
| `autoprefixer` 移除后浏览器前缀覆盖变化 | v4 Lightning CSS 仍读 `browserslist`；构建产物比对前缀，低风险 |
| `demo/` 与 `template/` 因本次单向升级而分叉 | 本次明确只改 `template/`；记录 demo 落后，后续另起同步 change |
| 现有脏工作区干扰升级 diff | 保持本 OpenSpec change 独立，避免回滚无关既有改动 |

## 迁移计划

1. 依赖探针：
   - 更新 `template/package.json`：`tailwindcss` 升 v4，新增 `@tailwindcss/vite`，移除 `autoprefixer`。
   - `cd template && pnpm install` 刷新 `pnpm-lock.yaml`。
   - 运行 `cd template && pnpm test` 与 `pnpm build`，收集第一轮失败。

2. 构建链路切换：
   - `template/vite.config.ts` 注册 `@tailwindcss/vite`。
   - 移除 `template/postcss.config.js`（或清空 tailwind/autoprefixer）。
   - `template/src/assets/styles/tailwind.css` 改为 `@import "tailwindcss"`。

3. Token 流水线改造：
   - `theme-token-contract.mjs` 新增 `buildProjectTailwindThemeCss()`（输出 `@theme inline` 块，含 Decision 3 映射）。
   - `export-theme-tokens.mjs` 写出 `theme.tailwind.css`，停止写 `theme.tailwind.json`。
   - 删除 `tailwind.config.js` 与 `theme.tailwind.json`。
   - `tailwind.css` 引入生成的 `theme.tailwind.css`。

4. 契约脚本重写：
   - `check-theme-consistency.ts` 改为校验「`theme.tailwind.css` ↔ `theme.tokens.json`」一致；保留 `design.md ↔ tokens.ts` 校验。

5. 工具类改名：
   - grep `template/src` 命中 `shadow-sm` 等，按 v4 改名表修正。

6. 主题桥接回归：
   - 确认 `core/theme/**` 未被改动；`@theme inline` 下 Tailwind 工具类仍跟随运行时变量。
   - `ThemePreview` 在亮/暗 + 主色预设下视觉冒烟。

7. 最终门禁：
   - `cd template && pnpm test`
   - `cd template && pnpm build`
   - 根目录 `pnpm test`
   - 根目录 `pnpm build`

回滚策略是正常 revert 本 change 的全部提交。实现时应让「依赖/构建链路变更」「token 流水线改造」「工具类改名」在 review 中易于区分。

## 测试案例矩阵

| 层级 | 测试位置 | 测试案例 | 验证目标 |
|---|---|---|---|
| 单元测试 | `template/scripts` 下 token 契约测试（新增或扩展） | `buildProjectTailwindThemeCss` 由固定 raw token 产出确定的 `@theme inline` CSS 串 | 防止 CSS 产物漂移；锁定 Decision 3 映射 |
| 单元测试 | 同上 | `tokens:check` 在「生成 CSS 与 raw token 不一致」时抛错 | 保留一致性校验不变量 |
| 静态回归测试 | 新增 tailwind v4 专项静态测试 | 断言 `template` 不再存在 `tailwind.config.js`、`theme.tailwind.json`、`@tailwind base/components/utilities`、PostCSS `tailwindcss` 插件配置 | 防止 v3 范式残留回归 |
| 静态回归测试 | 同上 | 断言 `template/src` 不再出现已改名的 v3 工具类（如 `shadow-sm`） | 防止改名遗漏 |
| 构建测试 | `cd template && pnpm build` | TypeScript + Vite + `@tailwindcss/vite` 构建 | 验证 v4 构建链路与插件链共存 |
| 单元测试 | 根目录脚手架 / 模板测试 | 生成模板仍含 `@import "tailwindcss"` 与 `@theme inline` 入口 | 防止脚手架输出偏离 v4 契约 |
| 根目录测试 | 根目录 `pnpm test`、`pnpm build` | CLI 与脚手架测试 | 验证模板升级未破坏生成器 |
| 手动冒烟 | `ThemePreview` | 亮/暗 + 主色预设下 Tailwind showcase 的 primary 文本、page 背景、title 颜色、radius、spacing 均跟随主题 | 覆盖 `@theme inline` 真实生效与运行时换肤不退化 |

## 未决问题

- 裸 `rounded`（v3 `borderRadius.DEFAULT`）在 v4 下的精确键名（`--radius-default` vs `--radius`），需在实现阶段按官方迁移指南敲定。
- `postcss.config.js` 是整体删除，还是保留空壳以兼容潜在依赖（当前无其他 PostCSS 插件，倾向删除）。
- `theme.tailwind.css` 产物落点：`template/src/assets/styles/theme.tailwind.css`（与入口同目录，import 干净）vs `template/theme.tailwind.css`（与旧 JSON 同位，便于识别为派生产物）。倾向前者。
- `tailwindcss` 是否精确锁 `4.x` 还是 `^4.x`；`@tailwindcss/vite` 锁定策略。建议第一轮验证通过后再放宽。
