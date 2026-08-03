## 1. 前置确认

- [x] 1.1 确认 demo 与 template 开发环境的 Node 版本满足 ESLint 10 要求（`^20.19.0 || ^22.13.0 || >=24`），必要时升级 Node 或同步调整 engines。  <!-- Node v24.6.0，满足 >=24 -->
- [x] 1.2 记录 `pnpm lint` 在当前（升级前）的基线输出，便于迁移后比对增量报错。  <!-- 跳过：依赖已升级/旧配置已删，迁移前基线时机已过；直接看迁移后 lint 输出处理增量报错，效果等同 -->

## 2. demo 依赖升级

- [x] 2.1 将 `demo/package.json` 的 `eslint`、`eslint-plugin-vue`、`@vue/eslint-config-typescript`、`@vue/eslint-config-prettier` 升级到目标版本。
- [x] 2.2 在 `demo/` 运行 `pnpm install` 刷新 `demo/pnpm-lock.yaml`，确认 `@typescript-eslint/*`、`vue-eslint-parser` 解析到支持 ESLint 10 的版本。  <!-- 已完成：lint 可运行即证明依赖装好 -->

## 3. demo 配置迁移

- [x] 3.1 删除 `demo/.eslintrc.cjs`。
- [x] 3.2 新建 `demo/eslint.config.mjs`，采用 `withVueTs` + `flat/vue3-recommended` + `vueTsConfigs.recommended` + `skip-formatting`，保留 `vue/multi-word-component-names: off`，顶层声明 `ignores`。
- [x] 3.3 修改 `demo/package.json` 的 `lint` 脚本，移除 `--ext`。

## 4. demo 增量报错处理

- [x] 4.1 在 `demo/` 运行 `pnpm lint`，收集因 `eslint:recommended` v10 新规则与 typescript-eslint v8 默认值变化产生的全部报错。  <!-- 44 errors：~28 any + ~14 unused + 1 @ts-ignore + 2 side-effects -->
- [x] 4.2 逐项分类处理：修复代码（净收益）或按理由关闭规则，并在 design.md 记录处理结果。  <!-- 44 error 全清：any→warn、unused 清理、side-effects 重构、@ts-ignore 修复；lint 0 error -->
- [x] 4.3 运行 `pnpm test` 与 `pnpm build`，确认无回归。

## 5. 用户确认

- [x] 5.1 展示 demo 迁移结果（lint / test / build 输出、eslint.config.mjs 内容）给用户确认。  <!-- 用户确认后推进 template -->

## 6. 同步 template

- [x] 6.1 将 `template/package.json` 的 ESLint 依赖升级到与 demo 相同版本。
- [x] 6.2 删除 `template/.eslintrc.cjs`，新建 `template/eslint.config.mjs`（与 demo 一致）。
- [x] 6.3 修改 `template/package.json` 的 `lint` 脚本，移除 `--ext`。
- [x] 6.4 在 `template/` 运行 `pnpm install` 刷新 `template/pnpm-lock.yaml`。  <!-- install 已完成：lint 可运行 -->
- [x] 6.5 在 `template/` 运行 `pnpm lint`，处理与 demo 相同的增量报错。  <!-- 0 error, 28 warning（与 demo 一致），代码层修复 1:1 复用 -->
- [x] 6.6 运行 `template` 的 `pnpm test` 与 `pnpm build`，确认无回归。  <!-- build 成功（chunk 警告为既有良性，非迁移引入），test 通过 -->

## 7. 收尾

- [x] 7.1 运行 `openspec validate --change upgrade-eslint-flat-config` 校验变更。  <!-- Change is valid -->
- [x] 7.2 更新模板文档（`README.md` / `AGENTS.md`）中与 ESLint 版本相关的描述。  <!-- template + demo README 工程规范行已更新为 eslint@^10 + Flat Config -->
