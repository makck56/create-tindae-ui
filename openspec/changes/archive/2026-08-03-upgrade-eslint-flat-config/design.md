## 背景

当前状态核实于 2026-08-03：

| 区域 | 当前状态 | 迁移关注点 |
|---|---|---|
| ESLint | `eslint@^8.57.0`，`.eslintrc.cjs`（legacy） | 最新已核实为 `eslint@10.8.0`，完全移除 legacy eslintrc |
| 配套插件 | `eslint-plugin-vue@^9`、`@vue/eslint-config-typescript@^13`、`@vue/eslint-config-prettier@^9` | 均为 legacy eslintrc 格式；新主版本（vue@10、typescript@14、prettier@10）只支持 flat config |
| TS 解析 | `@typescript-eslint/parser` / `eslint-plugin` / `vue-eslint-parser` 为间接依赖 | peer 已支持 `eslint ^8.57 || ^9 || ^10`，需解析到支持 v10 的版本 |
| lint 脚本 | `eslint . --ext .vue,.js,.jsx,.cjs,.ts,.tsx --fix && prettier --write` | flat config 下 `--ext` 已失效 |
| 忽略规则 | legacy 默认只忽略 `node_modules` | `dist/` 下的 11 个构建产物 JS 一直被扫描（无效扫描） |
| .vue 脚本语言 | 39 个 `.vue` 全部 `lang="ts"`，src 下无 `.js` | 满足 `@vue/eslint-config-typescript@14` 的强制要求 |

核心迁移路径：

```text
.eslintrc.cjs (legacy)          eslint.config.mjs (flat)
        │                              │
        ├─ eslint 8 ─────────────► eslint 10（移除 legacy）
        ├─ plugin-vue 9 ─────────► plugin-vue 10（flat/recommended）
        ├─ @vue/typescript 13 ───► @vue/typescript 14（withVueTs + vueTsConfigs）
        └─ @vue/prettier 9 ──────► @vue/prettier 10（skip-formatting）
```

## 目标 / 非目标

**目标：**

- 将 `template` 与 `demo` 升级到 ESLint 10 + Flat Config。
- 保持项目自定义规则（`vue/multi-word-component-names: off`）在迁移后不丢失。
- 保持格式化与 lint 关注点分离（Prettier 独立运行）。
- 修复当前 `lint` 扫描 `dist/` 构建产物的隐藏问题。
- 建立可证明 lint、测试、构建都通过的验证路径。

**非目标：**

- 本次不引入 Biome 或其他 lint 工具替换 ESLint。
- 本次不重写业务代码逻辑，只处理升级带来的增量 lint 报错。
- 本次不改动 `vue-tsc` / `tsconfig` 的类型检查链路。
- 本次不涉及 `package.json` 中除 `eslint` 相关依赖与 `lint` 脚本外的其他变更。

## 决策

### Decision 1: 升级到 ESLint 10，而不是停在 9

原因：ESLint 9 的 flat config 已经是默认，但 legacy eslintrc 仍在；10 才完整移除。所有相关依赖（`eslint-plugin-vue@10`、`@vue/eslint-config-typescript@14`、`@vue/eslint-config-prettier@10`、`@typescript-eslint@8.65`）peer 均已声明支持 ESLint 10。模板已处于最新生态（Vite 8 / Vitest 4 / Tailwind 4），停在 9 只是把同一次一次性迁移成本推迟。

备选方案：升级到 ESLint 9。拒绝原因是 v9→v10 对「纯 flat config 新用户」破坏面很小（API 移除主要影响插件作者），且 9 需要二次迁移。

⚠️ 注意：ESLint 10 要求 Node `^20.19.0 || ^22.13.0 || >=24`。模板 engines 声明 `>=22.12.0`，开发机若为 22.12 需升至 22.13+。此差异在实施前需确认。

### Decision 2: Prettier 集成使用 skip-formatting（分离式）

原因：`@vue/eslint-config-prettier` 默认模式把 Prettier 作为 ESLint 规则运行（`prettier/prettier: warn`），会拖慢 lint 且与当前 `eslint --fix && prettier --write` 的分离哲学重复。`skip-formatting` 只关闭冲突规则、保留 `prettier/prettier: off`，格式化完全交给独立 `prettier` 命令。

### Decision 3: 用 withVueTs 组合规则，不手写 parser 配置

原因：`@vue/eslint-config-typescript@14.9` 提供的 `withVueTs` 自动处理 `.vue` 文件中 `<script lang="ts">` 的分块解析，与 `vueTsConfigs.recommended` 组合后，Vue 规则与 TypeScript 规则按文件类型正确分流。手写 `parserOptions.parser` 映射（旧 index.js 的做法）在 flat config 下易出错。

### Decision 4: ignores 在 flat config 顶层声明

原因：flat config 默认只忽略 `node_modules`。`dist/**`、`public/**` 必须显式声明在 `ignores` 中，否则 `eslint .` 会继续扫描构建产物（当前 legacy 下就在发生）。

### Decision 5: demo 先行、template 同步

原因：遵循仓库 AGENTS.md「bug 修复优先在 demo，确认后同步 template」的工作流。demo 与 template 的 ESLint 配置、依赖、lint 脚本完全独立，需同步修改两处。

## 实现细节

### 目标依赖版本

```jsonc
// template/package.json 与 demo/package.json 的 devDependencies
"eslint": "^10.0.0",
"eslint-plugin-vue": "^10.0.0",
"@vue/eslint-config-typescript": "^14.0.0",
"@vue/eslint-config-prettier": "^10.0.0"
```

间接依赖（由上述包的 peer 驱动解析）：
- `@typescript-eslint/parser` / `@typescript-eslint/eslint-plugin`：`^8.65.0`
- `vue-eslint-parser`：`^10.4.1`

### 目标 eslint.config.mjs

```js
// eslint.config.mjs
import pluginVue from 'eslint-plugin-vue'
import { withVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default withVueTs(
  { ignores: ['dist/**', 'public/**', 'node_modules/**'] },
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  {
    name: 'tindae/custom-rules',
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  skipFormatting,
)
```

### lint 脚本

```jsonc
"lint": "eslint . --fix && prettier --write \"src/**/*.{vue,ts,css}\""
```

## 风险与缓解

| 风险 | 缓解 |
|---|---|
| `eslint:recommended` v10 新增规则（`no-unused-private-class-members`、`no-useless-assignment` 等）触发存量代码报错 | 第一轮 lint 后逐项分类：能修则修（净收益），确属模板预置产物则按理由关闭并记录 |
| typescript-eslint v8 与 v6/v7 的默认值或规则名变化 | 先跑 `pnpm lint` 收集全部报错，比对规则名差异，一次性处理 |
| Node 22.12 < ESLint 10 要求 22.13+ | 实施前确认开发机 Node 版本；必要时升级 Node 或调整 engines |
| demo/template 双轨不同步 | 严格按 demo 先改 → 用户确认 → 同步 template 的顺序 |
| `vueTsConfigs.recommended` 对 `.vue` 的 TS 强制要求 | 已核实 39 个 `.vue` 全部 `lang="ts"`，无迁移阻塞 |

## 迁移过程发现的两个关键点（demo 验证记录）

### 1. eslint-plugin-vue v10 的 flat config key 变化

v9 → v10 breaking change：vue3 的 flat config 导出 key 从 `flat/vue3-recommended` 改为 `flat/recommended`（v10 给 vue2 保留 `flat/vue2-*`，vue3 的去掉前缀）。

- 错误写法：`pluginVue.configs['flat/vue3-recommended']` → 返回 `undefined` → `withVueTs` 内部 `isVueTsConfig(undefined)` 抛 `TypeError: Cannot use 'in' operator to search for Symbol(...) in undefined`。
- 正确写法：`pluginVue.configs['flat/recommended']`。
- eslint.config.mjs、proposal.md、design.md 三处已统一修正。

### 2. 迁移后 lint 增量报错（44 error）分类处理

旧配置（`@vue/eslint-config-typescript@13` extends `plugin:@typescript-eslint/eslint-recommended`）只关闭与 TS 冲突的核心规则；新配置 `vueTsConfigs.recommended`（完整 `@typescript-eslint/recommended`）启用 `no-explicit-any`、严格化 `no-unused-vars` 等，暴露存量技术债。

| 类别 | 数量 | 处理 |
|---|---|---|
| `no-explicit-any` | 27 | 降级 `warn`（多为 echarts/vxe-table 第三方类型包装），记为「类型债清理」后续专项 |
| `no-unused-vars`（无下划线）| 12 | 清理：删死代码（`PENDING_KEY`/`PENDING_CTRL` 常量、`hmr` 变量、未用 import）、`catch(e)` → `catch {}` |
| `no-unused-vars`（下划线 `_options`/`_app`）| 2 | 配 `argsIgnorePattern/varsIgnorePattern/caughtErrorsIgnorePattern: '^_'`（社区约定豁免） |
| `ban-ts-comment`（`@ts-ignore`）| 1 | 改 `@ts-expect-error`（vite.config.ts legacy 插件按需导入） |
| `vue/no-side-effects-in-computed-properties` | 2 | 重构 MarkdownViewer：rules 移模块级 + env 传依赖，computed 变纯函数（逻辑等价） |
| `vue/one-component-per-file`（spec 文件）| 3 | 针对 `*.spec.ts/*.test.ts` 关闭（测试多组件合理） |
| `vue/no-v-html` | 1 | 保留 warning（markdown 渲染必需，已知） |

结果：demo `pnpm lint` → **0 error, 28 warning**（27 any + 1 v-html，均不阻断）。
