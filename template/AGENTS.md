# AGENTS.md — AI 编码规范

> 本文件是 AI 助手（Claude / Cursor / Copilot 等）在本项目写代码时**必须遵守**的规范。
> 它是 `README.md` / `theme.md` / `ARCHITECTURE.md` 的精炼行动指南；细节查对应文档，遇冲突以本文件为准。

---

## 1. 技术栈与四层架构

Vue 3（`<script setup>` + TS）· Vite · Pinia · Vue Router · Tailwind CSS 4 · Ant Design Vue **v4** · VXE Table 4 · ECharts 6 · MSW 2.14 · Vitest。

**四层分层，依赖只能向下，严禁反向：**

```
pages ──► modules ──► shared ──► core
  │          │          │
  └──────────┴──────────┴──► core（被任何层使用）
```

| 层                | 放什么                           | 可引用          |
| :---------------- | :------------------------------- | :-------------- |
| `src/core/`       | 启动、插件、`http`、`theme` 基建 | 被任何层使用    |
| `src/shared/`     | 无业务的通用组件/工具/常量       | 只能引用 core   |
| `src/modules/`    | 跨域复用业务（auth / app）       | shared          |
| `src/pages/<域>/` | 具体业务功能                     | modules、shared |

❌ **跨域禁止直接 import** —— 用 `router.push()`、下沉到 `modules/`、或全局 Store 交互。

---

## 2. 铁律（违反必返工）

- **强制 TypeScript**：杜绝隐式 `any`，接口 + 泛型严格约束；组件 `defineOptions({ name })` 必填，且用 `ROUTE_NAMES` 常量。
- **不可变优先**：`{ ...obj, key: value }`，禁止原地修改。
- **中文注释**：函数、复杂逻辑、类型都要中文注释，方便阅读。
- **小文件**：单文件 200~400 行，不超 800；按 feature 拆分。
- **`index.ts` 策略**：仅 `models/` 允许 re-export；`components/ / composables/ / api/` **不**用 `index.ts`（显式路径防循环依赖）。

---

## 3. 写新页面（标准流程）

### 3.1 Page / View 分离（架构灵魂）

每个业务页面拆两文件：

| 文件               | 角色                    | 职责                                      | 禁止                   |
| :----------------- | :---------------------- | :---------------------------------------- | :--------------------- |
| `XxxList.page.vue` | **路由壳**（极薄）      | keep-alive 锚点、取 `$route` 参数传 View  | ❌ 业务逻辑、❌ 调 API |
| `XxxList.view.vue` | **业务核**（100% 功能） | 组合 composables + 组件、处理交互/loading |                        |

### 3.2 新建域 / 特性

优先用脚手架，**勿手建目录**：

```bash
pnpm scaffold:domain    # 创建业务域（目录 + 域路由 + page 壳 + 默认特性）
pnpm scaffold:feature   # 在现有域下加特性
```

脚手架后**三件事必做**（否则 404 / 菜单不显示 / 403）：

1. 在 `src/core/bootstrap/router.ts` 手动 `import` 并加入 `routes`（路由**不**自动发现）。
2. 在 `src/modules/app/config/menu.config.ts` 加菜单项。
3. 菜单 `code` 用 **PascalCase**（如 `OrderManagement`），且与路由 `meta.code` 一致。

用 `pnpm scaffold:feature` 在已有域下新增页面时，脚手架会把域名拼入新增 feature 的路由名（如 `sales/order` → `SalesOrder`），避免不同域下同名特性产生 Vue Router `name` 冲突。

### 3.3 命名约定

| kebab（目录/URL/文件前缀） | camel（路由变量/api 文件） | Pascal（组件名/类/路由 name） |
| :------------------------- | :------------------------- | :---------------------------- |
| `order-management`         | `orderManagement`          | `OrderManagement`             |

---

## 4. 数据请求

**统一用 `@/core/http` 的 `request`**，禁止各自 `axios.create()`。

```ts
// features/order/api/order.api.ts
import { request } from '@/core/http';
export const getOrderList = (params: OrderListParams) =>
  request.get<OrderListResult>('/orders', { params }); // → Promise<ApiResponse<OrderListResult>>
```

- 响应是**业务信封** `{ code, data, message }`，`code === 0` 为成功；拦截器已剥掉 axios 外壳，**直接拿 `ApiResponse<T>`**（不要再 `const { data: res } = ...` 解一层）。
- 泛型 `<T>` 传**业务数据类型**（`data` 字段），不是整个信封。

**三层职责（严格分层）**：

| 层                      | 做                                                          | 禁止                          |
| :---------------------- | :---------------------------------------------------------- | :---------------------------- |
| `*.api.ts`              | 发请求、返回 `ApiResponse<T>`                               | ❌ UI 反馈（`message.error`） |
| `use*.ts`（composable） | `await getXxx()` → 取 `res.data`、管 loading/error、UI 反馈 | ❌ 关心请求细节               |
| `*.vue`（View）         | 组合 composables + 组件                                     | ❌ 直接调 `request`           |

错误：传输层失败统一抛 `HttpError`（`@/core/http`）；业务码 `code !== 0` **默认不抛**，由调用方判断。

---

## 5. 状态管理

优先级：**局部 `ref()` ＞ 域内共享 ＞ 全局 Pinia Store**。能用 `ref()` 解决就别上 Pinia。

---

## 6. 权限

- 后端菜单驱动，`authStore.menus` 是**唯一真相源**。
- 按钮：`v-permission="'Xxx:delete'"` 或 `v-permission="['Xxx:edit','Xxx:create']"`（任一命中即显示）。
- 脚本：`usePermission()` 的 `has / hasAny / hasAll`。
- 路由：`meta.code` 声明所需权限码，守卫**默认拒绝**。
- ⚠️ 前端隐藏只是 UX，**真正的权限边界必须后端校验**。

---

## 7. 主题（CSS 变量 SSOT）

- 配色**只用 CSS 变量 / Tailwind 语义类**（`bg-primary` / `text-title` / `border-light` …），**禁止**字面色（`#1890ff` / `rgb(...)`），否则切主题 / 暗色不联动。
- 改 Ant Design Vue 主题表现：优先编辑 `src/core/theme/bridges/antDesignVue.ts` 的 ConfigProvider token 映射；只有 v4 token 覆盖不了且经过浏览器验证的缺口，才在对应组件或布局本地补充带注释的 fallback CSS。
- 加组件预览：在 `src/pages/theme-preview/features/theme-preview/components/antd/` 加 `.block.vue`，到 `AntdShowcase.section.vue` 接入。
- 日期组件（DatePicker / TimePicker / Calendar）依赖 dayjs，中文 locale 已在 `core/plugins/antd.ts` 注入。

---

## 8. Mock（MSW 默认）

- 默认开发态由 `src/main.ts` 启动 MSW，生产构建不启动 mock。
- 新业务接口优先在 `src/mock/handlers/` 新建或扩展 handler，并在 `src/mock/handlers/index.ts` 聚合。
- `fallbackHandlers` 必须排在 handler 列表最后：业务 mock 先匹配，遗漏的 `/api/...` 再返回结构化 404。
- `public/mockServiceWorker.js` 带模板补丁：同源非 `/api/` 请求必须在 fetch 事件最前面直接绕过 MSW，避免 Vite 源码模块和 HMR 进入 passthrough 链路。
- `onUnhandledRequest: 'bypass'` 只放行 Vite 源码模块、HMR、静态资源和第三方资源；不要把默认 mock 架构改成 Vite middleware，除非先完成 OpenSpec 评估。

---

## 9. 测试

`vitest`。新增工具函数 / composable / store 写单测（`*.test.ts` 放同目录）。`pnpm test`。

---

## 10. 命令速查

| 命令                                | 作用                                       |
| :---------------------------------- | :----------------------------------------- |
| `pnpm dev`                          | 启动（端口 3000，自动开浏览器）            |
| `pnpm build`                        | `vue-tsc --noEmit` 类型检查 + `vite build` |
| `pnpm lint`                         | ESLint 修复 + Prettier 格式化              |
| `pnpm test`                         | `vitest run` 跑单测                        |
| `pnpm scaffold:domain` / `:feature` | 交互式创建域 / 特性                        |

---

## 11. 提交规范

Conventional Commits：`type(scope): subject`，type ∈ `feat / fix / refactor / docs / style / test / chore / perf / ci / build`。commitlint 会拦截不规范提交。

---

## AI 高频踩坑（务必规避）

| ❌ 错误做法                                    | ✅ 正确做法                           |
| :--------------------------------------------- | :------------------------------------ |
| 在 `.page.vue` 写业务逻辑 / 调 API             | 移到 `.view.vue`，Page 只做路由壳     |
| View 里 `import { request }`                   | 走 `api/*.ts` → `use*.ts` composable  |
| `const { data: res } = await x()`              | `const res = await x()`（封装已解壳） |
| 用字面色 `#1890ff`                             | 用 `var(--color-*)` / Tailwind 语义类 |
| 改路由 `name` 没同步 `defineOptions({ name })` | 都用 `ROUTE_NAMES` 常量               |
| 新建域后忘接路由 / 忘加菜单 / code 不一致      | 三件事全做（见 3.2）                  |
| `components/` / `api/` 用 `index.ts`           | 显式路径 import                       |
| 原地修改 state                                 | 返回新对象（不可变）                  |

---

> 完整机制（架构图、Page/View 全例、http 高级用法、主题 SSOT、权限三道防线、对接真实后端）见 `README.md`；主题细节见 `theme.md`；架构总览见 `ARCHITECTURE.md`。
