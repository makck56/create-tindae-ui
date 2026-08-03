## 为什么

`template` 与 `demo` 当前仍使用 ESLint 8（`eslint@^8.57.0`）配合 legacy `.eslintrc.cjs` 配置。该配置链依赖的 `@vue/eslint-config-typescript@13`、`@vue/eslint-config-prettier@9`、`eslint-plugin-vue@9` 都只支持旧式 eslintrc 格式。

而 ESLint 生态在 2026 年已演进到 v10（2026-02 发布，完全移除 legacy eslintrc 系统；`@vue/eslint-config-typescript@14`、`@vue/eslint-config-prettier@10`、`eslint-plugin-vue@10` 均已只支持 flat config）。停在 v8 意味着：

- 拿不到 ESLint 9/10 的安全修复与能力更新（`eslint:recommended` 在 v10 新增 `no-unused-private-class-members`、`no-useless-assignment` 等规则）。
- `.eslintrc` 生态即将全面退出，越晚迁移，配套插件版本越难凑齐。
- 当前 `lint` 脚本使用 `--ext` 参数，flat config 下已失效，且 legacy 默认只忽略 `node_modules`，`eslint .` 一直把 `dist/` 下的构建产物也扫描一遍（隐藏的无效扫描）。

本次变更把 ESLint 升级到 v10 并完整迁移到 Flat Config，是一次依赖与工程规范层面的现代化改造。

## 变更内容

- 将 `template` 与 `demo` 的 ESLint 依赖栈升级到：`eslint@^10`、`eslint-plugin-vue@^10`、`@vue/eslint-config-typescript@^14`、`@vue/eslint-config-prettier@^10`，并同步解析 `@typescript-eslint/parser`、`@typescript-eslint/eslint-plugin`、`vue-eslint-parser` 至支持 ESLint 10 的版本。
- 删除 `template/.eslintrc.cjs` 与 `demo/.eslintrc.cjs`，改为 Flat Config `eslint.config.mjs`。
- 使用 `@vue/eslint-config-typescript@14` 的 `withVueTs` 组合 `eslint-plugin-vue` 的 `flat/recommended` 与 `vueTsConfigs.recommended`。
- 使用 `@vue/eslint-config-prettier/skip-formatting`（分离式，格式化交给独立 `prettier --write`，与现有 `lint` 脚本哲学一致）。
- 保留自定义规则 `vue/multi-word-component-names: off`。
- 调整 `lint` 脚本：移除 `--ext`，在 Flat Config 顶层声明 `ignores`（`dist/**`、`public/**`、`node_modules/**`），修复当前 lint 扫描构建产物的问题。
- 迁移后第一轮 `pnpm lint` 可能因 `eslint:recommended` v10 新增规则 / typescript-eslint v8 默认值变化产生增量报错，逐项处理并回归。

## 能力

### 新增能力

- `eslint-flat-config`: 约束模板的 ESLint 必须使用 v10 + Flat Config 配置结构，并保证 `lint` / `test` / `build` 全链路通过。

### 修改能力

- 无。当前 `openspec/specs/` 下没有需要修改的既有主规格。

## 影响范围

- 依赖：
  - `template/package.json`
  - `template/pnpm-lock.yaml`
  - `demo/package.json`
  - `demo/pnpm-lock.yaml`
- 配置：
  - `template/.eslintrc.cjs`（删除）
  - `template/eslint.config.mjs`（新增）
  - `demo/.eslintrc.cjs`（删除）
  - `demo/eslint.config.mjs`（新增）
  - `template/package.json`、`demo/package.json` 的 `lint` 脚本
- 验证：
  - `template` 与 `demo` 的 `pnpm lint`
  - `template` 与 `demo` 的 `pnpm test`、`pnpm build`（回归不受影响）
  - 按既有工作流：先改 `demo` 验证，确认后同步 `template`
