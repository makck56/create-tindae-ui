# eslint-flat-config Specification

## Purpose
TBD - created by archiving change upgrade-eslint-flat-config. Update Purpose after archive.
## Requirements
### Requirement: 模板使用 ESLint 10 主版本线
模板与 demo SHALL 将 `eslint` 解析到 v10 主版本线，并同步升级其配套 ESLint 生态依赖。

#### Scenario: 依赖清单体现 ESLint 10
- **WHEN** 实现后检查 `template/package.json` 与 `demo/package.json`
- **THEN** `eslint` MUST 解析到 v10 主版本线
- **AND** `eslint-plugin-vue` MUST 解析到 v10 主版本线
- **AND** `@vue/eslint-config-typescript` MUST 解析到 v14 主版本线
- **AND** `@vue/eslint-config-prettier` MUST 解析到 v10 主版本线

#### Scenario: Lockfile 解析到兼容组合
- **WHEN** 实现后安装依赖
- **THEN** `template/pnpm-lock.yaml` 与 `demo/pnpm-lock.yaml` MUST 将 `@typescript-eslint/parser`、`@typescript-eslint/eslint-plugin`、`vue-eslint-parser` 解析到支持 ESLint 10 的版本
- **AND** lockfile MUST NOT 保留只支持 eslintrc 的旧解析（如 `@vue/eslint-config-typescript@13`）

### Requirement: 模板使用 Flat Config 配置结构
模板与 demo SHALL 使用 Flat Config（`eslint.config.mjs`）替代 legacy `.eslintrc.cjs`。

#### Scenario: 移除 legacy eslintrc 文件
- **WHEN** 实现后检查 `template/` 与 `demo/` 根目录
- **THEN** `.eslintrc.cjs` MUST 不存在
- **AND** `eslint.config.mjs` MUST 存在

#### Scenario: 配置使用 Vue + TS 组合辅助
- **WHEN** 检查 `eslint.config.mjs` 导出
- **THEN** 配置 MUST 使用 `@vue/eslint-config-typescript` 的 `withVueTs` 组合 Vue 与 TypeScript 规则集
- **AND** 配置 MUST 包含 `eslint-plugin-vue` 的 `flat/vue3-recommended` 规则集
- **AND** 配置 MUST 包含 `vueTsConfigs.recommended` TypeScript 规则集

#### Scenario: 保留自定义规则
- **WHEN** 检查 `eslint.config.mjs`
- **THEN** `vue/multi-word-component-names` MUST 保持关闭状态

### Requirement: 格式化与 Lint 关注点分离
模板 SHALL 使用 `@vue/eslint-config-prettier/skip-formatting` 关闭与 Prettier 冲突的规则，将格式化职责保留给独立 `prettier` 命令。

#### Scenario: skip-formatting 生效
- **WHEN** 检查 `eslint.config.mjs` 末尾
- **THEN** 配置 MUST 包含 `@vue/eslint-config-prettier/skip-formatting`
- **AND** `prettier/prettier` 规则 MUST 被关闭

### Requirement: lint 脚本移除 --ext 并忽略构建产物
模板与 demo 的 `lint` 脚本 SHALL 移除 flat config 下已失效的 `--ext` 参数，且 Flat Config MUST 显式忽略构建产物目录。

#### Scenario: 脚本不再使用 --ext
- **WHEN** 检查 `template/package.json` 与 `demo/package.json` 的 `lint` 脚本
- **THEN** 脚本 MUST NOT 包含 `--ext`
- **AND** 脚本 MUST 仍以 `eslint . --fix` 与 `prettier --write` 组合形式存在

#### Scenario: 构建产物被忽略
- **WHEN** 在 `template/` 与 `demo/` 运行 `pnpm lint`
- **THEN** `dist/**`、`public/**`、`node_modules/**` MUST 不被 ESLint 扫描

### Requirement: 升级后 lint 通过且无回归
迁移完成后，模板与 demo SHALL 通过 `pnpm lint`、`pnpm test`、`pnpm build`，且业务代码不因升级产生新语义错误。

#### Scenario: 全链路验证通过
- **WHEN** 迁移完成
- **THEN** `pnpm lint` MUST 退出码为 0（或仅剩可接受的 warn）
- **AND** `pnpm test` MUST 通过
- **AND** `pnpm build` MUST 通过

#### Scenario: 升级带来的增量报错被显式处理
- **WHEN** 第一轮 `pnpm lint` 因 `eslint:recommended` v10 新规则或 typescript-eslint v8 默认值变化产生报错
- **THEN** 报错 MUST 被逐项分类处理（修复代码或按理由关闭规则）
- **AND** 处理结果 MUST 记录在 `design.md` 或任务说明中

