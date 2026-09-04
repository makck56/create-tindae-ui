---
name: tindae-standards-review
description: Use when in a create-tindae-ui generated Vue3 enterprise project, after adding or modifying src/** code, before committing or merging; or when asked to check whether current code complies with the project's coding standards (layering, naming, Page/View split, data requests, theme, permission, immutability, tests).
---

# tindae-standards-review — 规范评审检查器

## Overview

对 create-tindae-ui 生成的 Vue3 企业业务项目做**系统性**规范合规审查：按六组必备清单**逐项**扫描，输出**统一格式**报告，并**当场修复**违规后复检。

它把 `AGENTS.md` 与深文档（`CODING_STANDARDS.md` / `ARCHITECTURE.md` / `theme.md`）的规范落实为一张**强制走查表**，防止审查者凭记忆抽查而**漏维度**。

## When to Use

- 在生成项目里刚改完 / 新建完 `src/**`（含 mock、路由、菜单、样式、主题），提交或合并**之前**
- 被要求"自查代码是否符合规范 / 过一遍规范 / 先做静态规范检查"
- 进入不熟悉的生成项目，想快速摸清该代码库必须遵守的铁律

**When NOT to use**：纯 UI 视觉走查、性能 profiling、业务逻辑正确性评审——那是另一回事，不做。

## 工作流（严格按序执行）

### 1. 定范围

- 优先 `git status` + `git diff`（未提交变更）；有 MR/PR 用 `git diff <base>...HEAD`
- 用户给路径就只查该路径
- 无 git：全量扫 `src/`

### 2. 按六组必备清单逐组扫描

> 每组是 **REQUIRED**：即使你判断"这组没问题"，也必须**逐条**扫一遍并**逐条**落报告。禁止"一眼扫过即跳过"。

#### G1 分层与依赖（pages → modules → shared → core）

- [ ] 反向依赖：shared 引用 modules / modules 引用 pages / 下文中任何"上层引用下层"之外的引用
- [ ] 跨域直连 import：A 域页面直接 import B 域的组件 / 模型 / api（应改走 `router.push()`、下沉到 `modules/`、或全局 Store 交互）
- [ ] shared 层复用业务数据（store / 接口）或直接发请求

#### G2 命名与枚举

- [ ] 目录 `kebab-case`；`.vue` 组件 `PascalCase`；`.ts/.js` 逻辑文件 `camelCase`；TS 类/模型 `PascalCase`
- [ ] 离散枚举用 `as const` 对象 + 派生联合类型（**禁止 TS `enum`**）：`as const` 禁止用字符串字面量散落；`CODING_STANDARDS.md 1.2` 是权威依据，即使 `AGENTS.md` 未明文禁 `enum` 也要执行
- [ ] 路由 name 一律走 `ROUTE_NAMES` 常量（**禁止手工字符串** `name: 'xxx'`），且与 `defineOptions({ name })` 一致
- [ ] 新建域 / 特性后三件套：`core/bootstrap/router.ts` 已手动 `import` 并加入 `routes`（路由**不**自动发现）、`menu.config.ts` 已加菜单项、菜单 code 与路由 `meta.code` 用 PascalCase 一致（`AGENTS.md 3.2`）
- [ ] barrel：只有 `models/` 允许 `index.ts` re-export；`components/`、`composables/`、`api/` 一律显式路径 import

#### G3 Page/View 分离与文件组织

- [ ] `.page.vue` 只做**路由壳**：无业务逻辑、无 API、无 loading / error 编排（`AGENTS.md 3.1`）
- [ ] `.view.vue` 承担业务：组合 composables + 组件、处理交互 / loading
- [ ] 组件 `defineOptions({ name })` **必填**（含层次壳、shared 组件）
- [ ] feature 目录深度 / 极简模式符合 `CODING_STANDARDS.md 2.7`；单文件 200~400 行、不超 800

#### G4 数据请求三层

- [ ] `*.api.ts`：只发请求并返回 `ApiResponse<T>`，泛型 `<T>` 传**业务数据类型**（`data` 字段），**禁止 `any`**；**禁止 UI 反馈**（`message.error` 等）
- [ ] composable（`use*.ts`）：`await getXxx()` → 取 `res.data`，管 loading / error / UI 反馈；不关心请求细节
- [ ] View：**禁止**直接 `import request`；**禁止** `const { data: res } = await x()` 二次解壳（拦截器已剥 axios 壳，直接拿业务信封）
- [ ] 传输层失败统一抛 `HttpError`（`@/core/http`）；业务码 `code !== 0` 默认不抛，由调用方判断

#### G5 主题 / 权限 / Mock

- [ ] **禁用字面色** `#...` / `rgb(...)`（模板、`<script>`、全局 CSS 都查，**勿漏样式文件**）；只用 CSS 变量 / Tailwind 语义类（`bg-primary` / `text-title` / `border-light` …）
- [ ] 路由 `meta.code`、菜单项 `code`、权限码三者**一致**（PascalCase 语义，如 `OrderManagement`），守卫配置正确；路由 name 变更同步 `defineOptions`
- [ ] 权限：按钮走 `v-permission="'Xxx:edit'"`；脚本走 `usePermission().has / hasAny / hasAll`
- [ ] MSW：新接口在 `src/mock/handlers/` 新建 / 扩展并聚合到 `handlers/index.ts`；`fallbackHandlers` 必须排在**最后**（业务 mock 先匹配，遗漏的 `/api/...` 再返回结构化 404）

#### G6 工程细节

- [ ] 不可变：改对象 / 数组**返回新实例**（`{ ...obj, key: value }`），**禁止原地修改**（含 store、composable 内部）
- [ ] 状态管理优先级：局部 `ref()` ＞ 域内共享 ＞ 全局 Pinia Store；能用 `ref()` 解决就别上 Pinia
- [ ] 文案管理：固定文案走 copy 常量配置，View / 组件不裸写字符串（`CODING_STANDARDS.md 2.5`）
- [ ] 单测：新增工具函数 / composable / store 有 `*.test.ts` 覆盖（`AGENTS.md 9`）；同目录存放

### 3. 输出统一报告

报告**必须**逐条三要素齐全：

```
❌ [G4] View 直接调 request — features/order-management/order-list.view.vue:20
   规则：AGENTS.md §4　修法：下沉到 composables/useOrderList.ts，View 只组合
```

- **判定**：`✅ 通过` / `❌ 违规` / `⚠️ 存疑（需人工裁定）`
- **证据**：文件路径:行号
- **规则出处**：AGENTS.md §x 或 CODING_STANDARDS.md y.y
- **修法**：一句话给出合规改法

结尾汇总：各维度 ✅ / ❌ / ⚠️ 计数，以及"**没查什么**"（如无 mock 目录、无测试则如实标注已跳过）。

### 4. 修复并复检

- 对 **❌** 先读上下文再改；遵守不可变、中文注释、小文件；**只修违规点**，不做无关重构
- **⚠️** 不擅自改，罗列事实交给用户 / 团队裁定
- 修复后**回头重跑**受影响组，确认 ❌ → ✅，并汇报修复 diff 概要

### 5. 收尾

- 汇总审查结果 + 修复概要
- 深挖入口：`ARCHITECTURE.md`（依赖 / 归属决策树）、`CODING_STANDARDS.md`（命名 / 文案 / 目录深度细则）、`theme.md`（主题细节）

## 规则依据速查（防"依据较弱"漏判）

| 维度 | 主依据 | 深挖 |
| --- | --- | --- |
| 分层 / 跨域 | AGENTS.md §1 | ARCHITECTURE.md §1、§5 |
| as-const / 命名 | CODING_STANDARDS.md 1.1–1.7 | AGENTS.md §3.3 |
| Page/View | AGENTS.md §3.1 | ARCHITECTURE.md §3 |
| 数据三层 | AGENTS.md §4 | CODING_STANDARDS.md 2.1 |
| 状态 / 不可变 | AGENTS.md §2、§5 | CODING_STANDARDS.md 2.2、ARCHITECTURE.md §6 |
| 主题 SSOT | AGENTS.md §7 | theme.md |
| 权限 | AGENTS.md §6 | ARCHITECTURE.md §6 |
| Mock | AGENTS.md §8 | — |
| 目录深度 | CODING_STANDARDS.md 2.7 | ARCHITECTURE.md §2 |
| 引用 / barrel | CODING_STANDARDS.md 2.4 | AGENTS.md §2 |
| 文案管理 | CODING_STANDARDS.md 2.5 | — |

## Common Mistakes（自我纠错）

- "这组我确定没问题，跳过" → **六组全走**；跳组 = 漏检
- 只报违规不给行号 / 规则出处 / 修法 → 报告三要素必须齐全
- 找到违规就顺手大改重写 → 只修违规点，遵守不可变与小文件
- 只查 `.vue` 不查 CSS / 路由 / 菜单 / mock → 主题色常藏在样式文件，权限不一致常藏在路由与菜单
- 用"不知道模型里有没有 ROUTE_NAMES"当借口 → 先 `grep ROUTE_NAMES src/`，没有就先补常量再复用