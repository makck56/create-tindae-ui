## 1. 依赖探针

- [x] 1.1 使用 `npm view tailwindcss version` 与 `npm view @tailwindcss/vite version` 确认 v4 目标版本。
- [x] 1.2 更新 `template/package.json`：`tailwindcss` 升至 v4，新增 `@tailwindcss/vite`，移除 `autoprefixer`。
- [x] 1.3 `cd template && pnpm install` 刷新 `template/pnpm-lock.yaml`。
- [x] 1.4 运行 `cd template && pnpm test`，记录第一批失败。
- [x] 1.5 运行 `cd template && pnpm build`，记录构建失败。

## 2. 构建链路切换（PostCSS → @tailwindcss/vite）

- [x] 2.1 在 `template/vite.config.ts` 注册 `@tailwindcss/vite` 插件。
- [x] 2.2 移除 `template/postcss.config.js`（或清空其中 tailwind/autoprefixer 配置）。
- [x] 2.3 `template/src/assets/styles/tailwind.css` 改为 `@import "tailwindcss"`。
- [x] 2.4 确认 `@tailwindcss/vite` 与 `unplugin-vue-components` / `defineRenderPlugin` / `autoRoutesPlugin` / `menuVisualizerPlugin` 共存无冲突。
- [x] 2.5 重新运行 `cd template && pnpm build`，验证构建链路可用（此阶段 utility 可能尚未恢复，先确认无插件冲突）。

## 3. Token 流水线改造（JSON → CSS @theme inline）

- [x] 3.1 在 `template/scripts/theme-token-contract.mjs` 新增 `buildProjectTailwindThemeCss(rawTokens)`，按 Decision 3 映射输出 `@theme inline` 块（含 colors / textColor / backgroundColor / borderColor / spacing / fontFamily / fontSize / borderRadius）。
- [x] 3.2 新增 `assertThemeCssMatchesRawTokens(rawTokens, cssText)` 校验函数，确保生成 CSS 与 raw token 一致。
- [x] 3.3 `template/scripts/export-theme-tokens.mjs` 写出 `theme.tailwind.css`，停止写出 `theme.tailwind.json`；保留 `theme.tokens.json`。
- [x] 3.4 删除 `template/tailwind.config.js` 与 `template/theme.tailwind.json`。
- [x] 3.5 `template/src/assets/styles/tailwind.css` 引入生成的 `theme.tailwind.css`（`@import "./theme.tailwind.css"`）。
- [x] 3.6 在 `template/src/assets/styles/` 落定生成产物位置（见未决问题，倾向同目录）。

## 4. 契约脚本重写

- [x] 4.1 重写 `template/scripts/check-theme-consistency.ts`：校验「`theme.tailwind.css` ↔ `theme.tokens.json`」一致。
- [x] 4.2 保留 `assertLightTokensMatchRawTokens`（`design.md ↔ tokens.ts`）不变量。
- [x] 4.3 运行 `cd template && pnpm run tokens:check`，确认双不变量在 CSS 形态下成立。

## 5. 工具类改名兼容

- [x] 5.1 grep `template/src` 命中 v4 已改名工具类（`shadow-sm` 等），列出全部位置。
- [x] 5.2 按官方 v4 改名表逐项修正（如 `shadow-sm → shadow-xs`）。
- [x] 5.3 复核是否还有其他常见改名（`rounded-sm`、`outline-none`、`ring`、`bg-opacity-*` 等）命中。

## 6. 主题桥接回归

- [x] 6.1 确认 `template/src/core/theme/**` 在本 change 内零改动（运行时注入、antd / vxe 桥接不变）。
- [x] 6.2 验证 `@theme inline` 下 Tailwind 工具类（`bg-primary` / `text-title` / `bg-page` 等）指向运行时 `:root` 变量而非重复声明。
- [x] 6.3 在 `ThemePreview` 切换亮/暗 + 主色预设，确认 Tailwind showcase 颜色、radius、spacing 跟随主题。
- [x] 6.4 grep `template/src` 自定义 class，确认与 v4 新生成的统一 `--color-*` 工具类无同名冲突。

## 7. 最终门禁

- [x] 7.1 运行 `cd template && pnpm test`。
- [x] 7.2 运行 `cd template && pnpm build`。
- [x] 7.3 运行根目录 `pnpm test`。
- [x] 7.4 运行根目录 `pnpm build`。
- [x] 7.5 检查最终 diff，确认依赖/构建链路变更、token 流水线改造、工具类改名都限制在本 OpenSpec change 范围内，且 `demo/` 未被改动。

## 8. 测试案例补充

- [x] 8.1 新增/扩展 token 契约单测：固定 raw token → `buildProjectTailwindThemeCss` 产出确定的 `@theme inline` CSS 串（锁定 Decision 3 映射）。
- [x] 8.2 新增/扩展一致性校验单测：「生成 CSS 与 raw token 不一致」时 `tokens:check` 抛错。
- [x] 8.3 新增 tailwind v4 专项静态测试：断言 `template` 不再存在 `tailwind.config.js`、`theme.tailwind.json`、`@tailwind base`/`components`/`utilities`、PostCSS `tailwindcss` 配置。
- [x] 8.4 扩展静态测试：断言 `template/src` 不再出现已改名 v3 工具类（如 `shadow-sm`）。
- [x] 8.5 扩展脚手架/模板测试：生成模板含 `@import "tailwindcss"` 与 `@theme inline` 入口。
- [x] 8.6 将以上测试纳入最终门禁，确保 `cd template && pnpm test` 与根目录 `pnpm test` 覆盖升级风险点。
