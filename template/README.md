# create-tindae-ui 使用文档

> Vue 3 企业级后台管理系统脚手架。
> 本文档基于 `create-tindae-ui@1.0.0` 及其内置模板的真实代码编写，新人照着做即可跑通。

---

## 目录

- [一、它是什么](#一它是什么)
- [二、技术栈](#二技术栈)
- [三、5 分钟快速开始](#三5-分钟快速开始)
- [四、CLI 完整参数](#四cli-完整参数)
- [五、生成项目的目录结构](#五生成项目的目录结构)
- [六、必须先理解的 6 个核心机制](#六必须先理解的-6-个核心机制)
- [七、内置通用能力（拿来即用）](#七内置通用能力拿来即用)
- [八、开发一个新页面（完整实战）](#八开发一个新页面完整实战)
- [九、脚手架脚本（scaffold）详解](#九脚手架脚本scaffold详解)
- [十、命令速查表](#十命令速查表)
- [十一、对接真实后端](#十一对接真实后端)
- [十二、常见问题 FAQ](#十二常见问题-faq)
- [十三、规范（提交 / 编码 / IDE）](#十三规范提交--编码--ide)

---

## 一、它是什么

`create-tindae-ui` 是一个**项目脚手架**（scaffolding tool）。它做三件事：

1. 把内置的 `template/` 模板**完整复制**到你的目标目录；
2. 把生成项目的 `package.json` 里的 `name` 改成你输入的项目名；
3. 自动 `安装依赖` + `git init` + 首次提交。

> ⚠️ **重要澄清**：早期版本的 README 曾描述过「minimal / standard / full 三种预设」「ProTable / ProForm / 字典系统」等内容。**当前模板（v1.0.0）并未包含这些**。本章节之后的所有内容都以**真实代码**为准，请以本文档为准，避免照着不存在的模块找代码。（注：请求层已实装为 `@/core/http`，详见 [6.5 数据请求层](#65-数据请求层封装与使用)。）

**两个概念务必分清：**

| 概念                                 | 路径                        | 作用                                    |
| :----------------------------------- | :-------------------------- | :-------------------------------------- |
| **脚手架本身**（本仓库）             | `bin/`、`src/`、`template/` | 一个 npm 包，用来「生成项目」           |
| **生成的项目**（你用脚手架建出来的） | `my-project/`               | 一个 Vue 3 后台应用，你日常在这里写业务 |

本文档前四章讲「脚手架怎么用」，第五章起讲「生成的项目怎么用」。

---

## 二、技术栈

| 类别     | 技术                                          | 说明                                                              |
| :------- | :-------------------------------------------- | :---------------------------------------------------------------- |
| 框架     | Vue 3.5（Composition API + `<script setup>`） |                                                                   |
| 语言     | TypeScript 5.5（strict 严格模式）             |                                                                   |
| 构建     | Vite 5.4                                      | 开发端口 **3000**，启动自动开浏览器                               |
| 路由     | Vue Router 4.4                                | 手动聚合（非自动发现）                                            |
| 状态管理 | Pinia 2.2                                     | Setup Store 风格                                                  |
| UI 库    | Ant Design Vue 3.2                            | 按需自动导入（unplugin-vue-components）                           |
| 表格     | VXE Table 4.3（`vxe-grid`）                   | 列表页主力                                                        |
| 图表     | ECharts 5.5                                   |                                                                   |
| CSS      | Tailwind CSS 3.4 + CSS Variables              | 统一主题系统（亮暗 + 主色预设，见 [7.7](#77-主题系统与统一换肤)） |
| Mock     | MSW 2.14                                      | 仅开发环境启用                                                    |
| 测试     | Vitest 1.6 + Vue Test Utils 2.4               |                                                                   |
| 代码规范 | ESLint 8.57 + Prettier 3.3                    |                                                                   |
| 提交规范 | Husky + Commitlint + lint-staged              |                                                                   |
| 加密     | JSEncrypt 3.5（RSA）                          | 登录密码加密                                                      |

---

## 三、5 分钟快速开始

### 1. 环境要求

- **Node.js >= 18.0.0**
- 推荐包管理器：**pnpm**（也支持 npm / yarn，不支持 bun）
- 推荐 IDE：VS Code + 插件 `Vue - Official (Volar)` / `ESLint` / `Prettier`

### 2. 创建项目

**方式 A：包已发布到 npm 时（最常用）**

```bash
# pnpm
pnpm create tindae-ui my-project

# npm
npm create tindae-ui my-project

# yarn
yarn create tindae-ui my-project
```

**方式 B：克隆本仓库本地使用（包未发布 / 想改脚手架）**

```bash
git clone <本仓库地址> create-tindae-ui
cd create-tindae-ui
pnpm install      # 安装脚手架自身依赖
pnpm build        # 编译 src/*.ts -> dist/（bin 指向 dist/bin/create-tindae-ui.js）

# 用编译产物生成项目
node dist/bin/create-tindae-ui.js my-project

# 或在脚手架开发阶段直接用 tsx 跑源码（package.json 里映射为 pnpm dev）
pnpm dev my-project
```

执行后终端会输出类似：

```text
✨ Scaffolding tindae-ui project in /xxx/my-project...

   ├── Copying template...
   ├── Setting project name...
   ├── Installing dependencies via pnpm...
   ├── Initializing git repository...

✅ Done! Next steps:

  cd my-project
  pnpm dev
```

### 3. 启动生成出来的项目

```bash
cd my-project
pnpm dev          # 实际执行：vite
```

浏览器会自动打开 `http://localhost:3000`，并自动重定向到登录页。

### 4. 默认登录账号（Mock 模式）

开发环境下，项目通过 **MSW** 拦截 `/api/*` 请求，**任意用户名 + 任意密码 + 正确的图形验证码**即可登录成功（验证码图片上显示什么就填什么）。

- 登录成功后会自动拉取用户信息与权限菜单，重定向到 `/user-management`。
- 菜单默认显示「用户管理」「角色管理」两项（可在 `src/modules/app/config/menu.config.ts` 配置）。

---

## 四、CLI 完整参数

### 参数总表

| 参数                     | 说明                                                          | 默认值           |
| :----------------------- | :------------------------------------------------------------ | :--------------- |
| `<project-name>`         | 项目名称，必须匹配 `^[a-z0-9-]+$`（小写字母 / 数字 / 连字符） | 不传则交互式询问 |
| `--package-manager <pm>` | 包管理器，可选 `pnpm` / `npm` / `yarn`                        | `pnpm`           |
| `--skip-install`         | 跳过依赖安装                                                  | `false`          |
| `--no-install`           | `--skip-install` 的别名                                       | `false`          |
| `--skip-git`             | 跳过 `git init` 与首次提交                                    | `false`          |

> 注：CLI **没有**预设模板选择交互，也没有 `upgrade` 子命令。模板是单一的。

### 参数写法（两种都支持）

```bash
# 等号形式
pnpm create tindae-ui my-app --package-manager=npm

# 空格形式
pnpm create tindae-ui my-app --package-manager npm
```

### 常用组合示例

```bash
# 跳过装依赖和 git（适合离线 / CI 想自己控制）
pnpm create tindae-ui my-app --skip-install --skip-git

# 用 npm 创建
pnpm create tindae-ui my-app --package-manager npm

# 不传项目名，交互式输入（不合法的名称会被实时校验拦截）
pnpm create tindae-ui
```

### 行为细节

- **目录已存在且非空**时，会询问 `Overwrite?`，选否则中止。
- **不支持的包管理器**（如 `bun`）会直接报错退出。
- 依赖安装失败、git 初始化失败都**不会中断**流程，只会打印 ⚠️ 警告，你可稍后手动补。

---

## 五、生成项目的目录结构

生成的项目采用**四层分层架构**，依赖方向**只能向下**，严禁反向：

```
pages ──► modules ──► shared ──► core
  │          │          │
  └──────────┴──────────┴──► core（被任何层使用）
```

完整目录（基于真实模板）：

```text
my-project/
├── index.html
├── package.json
├── vite.config.ts            # 构建配置（含插件装配、端口、分包）
├── vitest.config.ts          # 单测配置
├── tsconfig.json             # @ -> src 别名
├── tailwind.config.js
├── postcss.config.js
├── env.d.ts
├── .eslintrc.cjs
├── .prettierrc.json
├── .gitignore
├── .vscode/typescript.code-snippets
├── ARCHITECTURE.md           # 架构总览
├── README.md                 # 模板自带说明
├── theme.md                  # 主题说明
│
├── build-plugins/            # 自定义 Vite 插件
│   ├── index.ts              #   统一导出
│   ├── cli.ts
│   └── plugins/
│       ├── vite-plugin-route-names/   # 扫描 *.routes.ts 生成 routeNames 常量
│       ├── menu-visualizer/           # 菜单可视化编辑器（开发态 UI）
│       └── vite-plugin-define-render.ts
│
├── scripts/                  # 工程脚本（生成项目自带）
│   ├── scaffold.ts           #   域 / 特性脚手架入口
│   ├── scaffold-core/        #   脚手架实现（actions / io / route-manager ...）
│   └── templates/            #   Handlebars 模板（.hbs）
│
├── public/
│   └── mockServiceWorker.js  # MSW Worker
│
├── docs/                     # 架构白皮书 / 编码规范 / 迁移指南
│
└── src/
    ├── main.ts               # 入口（dev 下先启动 MSW 再 setupApp）
    ├── App.vue               # 根组件（a-config-provider + router-view）
    ├── auto-components.d.ts  # Ant Design Vue 自动导入类型（自动生成，勿手改）
    │
    ├── core/                 # 【第 1 层 · 应用基建】启动、插件初始化
    │   ├── bootstrap/
    │   │   ├── index.ts      #   setupApp()：Pinia -> Router -> Tab -> UI 库 -> mount
    │   │   └── router.ts     #   ★ 路由聚合 + 全局守卫（登录/权限）
    │   ├── plugins/          #   antd / echarts / vxeTable 初始化
    │   └── types/global.d.ts
    │
    ├── layouts/              # 【全局布局】
    │   ├── Default.layout.vue#   侧边栏 + Header + TabBar + Content(keep-alive)
    │   └── tab/              #   多页签 + Keep-Alive 管理
    │
    ├── shared/               # 【第 2 层 · 通用底层】无业务依赖，严禁引用 pages/modules
    │   ├── components/
    │   │   ├── page-wrapper/    #   PageWrapper 页面骨架
    │   │   ├── query-filter/    #   QueryFilter 搜索条件区
    │   │   └── cross-page-select/ # 跨页选择
    │   ├── composables/
    │   │   └── useSpin.ts       #   4 态防闪烁 loading
    │   ├── constants/
    │   │   ├── copy.ts          #   ★ 全站文案常量 COPY
    │   │   ├── routeNames.ts    #   ★ 自动生成的路由名常量 ROUTE_NAMES
    │   │   └── spin.ts
    │   ├── ui-kit/              #   UI Kit 占位（composables/ styles/ 为空）
    │   └── utils/               #   工具占位
    │
    ├── modules/              # 【第 3 层 · 全局业务】跨域复用
    │   ├── app/
    │   │   ├── config/
    │   │   │   ├── menu.config.ts  # ★ 侧边栏菜单配置
    │   │   │   └── menuTypes.ts
    │   │   └── stores/app.ts       #   应用状态（appName、sidebarCollapsed）
    │   └── auth/
    │       ├── index.ts            #   统一出口（re-export）
    │       ├── api/auth.api.ts     #   登录 / 登出 / 获取用户信息
    │       ├── models/Auth.ts      #   UserInfo / AuthData / LoginParams
    │       └── stores/auth.ts      #   ★ 认证 Store（user、权限码、login/logout/hasPermission）
    │
    ├── pages/               # 【第 4 层 · 业务域】所有业务代码
    │   ├── error/           #   403 页
    │   ├── login/           #   登录页（含验证码、RSA 加密）
    │   └── user-management/ #   ★ 用户管理示例域
    │       ├── user-management.routes.ts   # 域路由
    │       ├── pages/                      # 路由壳 .page.vue
    │       │   ├── UserList.page.vue
    │       │   └── RoleList.page.vue
    │       └── features/
    │           ├── user/    #   用户特性（api / models / composables / views）
    │           └── role/    #   角色特性
    │
    ├── mock/                # MSW Mock
    │   ├── browser.ts       #   worker 入口
    │   ├── handlers/        #   auth.ts / user.ts / index.ts
    │   └── data/            #   内存测试数据
    │
    ├── assets/styles/       # global.css / tailwind.css / variables.css
    └── types/index.ts
```

**记忆口诀：**

| 层级        | 放什么                        | 能引用谁        |
| :---------- | :---------------------------- | :-------------- |
| **core**    | 应用启动、插件初始化          | 被任何层使用    |
| **shared**  | 无业务的通用工具、组件、常量  | 只能引用 core   |
| **modules** | 跨域复用的业务模块（如 auth） | shared          |
| **pages**   | 具体业务功能                  | modules、shared |

---

## 六、必须先理解的 6 个核心机制

### 6.1 Page vs View 分离（架构的灵魂）

每个业务页面拆成两个文件：

| 文件               | 角色                    | 职责                                                | 禁止                         |
| :----------------- | :---------------------- | :-------------------------------------------------- | :--------------------------- |
| `XxxList.page.vue` | **路由壳**（极薄）      | 作为 keep-alive 锚点、从 `$route` 取参数传给 View   | ❌ 不写业务逻辑、❌ 不调 API |
| `XxxList.view.vue` | **业务核**（100% 功能） | 组合 composables、使用 components、处理交互/loading |                              |

**为什么？** View 与路由解耦后，可被弹窗、抽屉、其他页面任意复用。真实示例：

```vue
<!-- pages/UserList.page.vue（路由壳，只有 6 行） -->
<script setup lang="ts">
import UserListView from '../features/user/views/UserList.view.vue';
import { ROUTE_NAMES } from '@/shared/constants/routeNames';
defineOptions({ name: ROUTE_NAMES.UserManagement.USER_MANAGEMENT });
</script>
<template>
  <UserListView />
</template>
```

### 6.2 路由系统：手动聚合 + 名称常量

> **路由不是自动发现的**，需要手动在 `src/core/bootstrap/router.ts` 里 `import` 并加入 `routes` 数组。

```ts
// src/core/bootstrap/router.ts（节选）
import { loginRoutes } from '@/pages/login/login.routes';
import { errorChildRoutes } from '@/pages/error/error.routes';
import { userManagementRoutes } from '@/pages/user-management/user-management.routes';

const routes = [
  ...loginRoutes,
  {
    path: '/',
    component: DefaultLayout, // 带侧边栏的布局
    children: [
      { path: '', redirect: '/user-management' },
      ...userManagementRoutes, // 业务页都挂在 DefaultLayout 下
      ...errorChildRoutes, // 403/404 也挂 DefaultLayout：错误页渲染在主内容区，保留侧边栏/顶栏/TabBar
    ],
  },
];
```

**什么是 `vite-plugin-route-names`？** 它扫描所有 `*.routes.ts`，自动生成 `src/shared/constants/routeNames.ts` 常量，避免你手写路由 `name` 拼错：

```ts
// 自动生成，请勿手改
export const ROUTE_NAMES = {
  UserManagement: {
    USER_MANAGEMENT: 'UserManagement',
    ROLE_MANAGEMENT: 'RoleManagement',
  },
} as const;
```

> 用法：在 `.page.vue` 里 `defineOptions({ name: ROUTE_NAMES.Xxx.YYY })`，路由 `name` 与之对应，多页签 / keep-alive 才能正常工作。

### 6.3 权限系统：后端菜单驱动 + 路由守卫 + 按钮指令

权限**完全由后端下发**，前端以 `authStore.menus` 为**唯一真相源**——侧边栏与权限码都从它派生，消除了「前端 `menu.config.ts` 与后端菜单」双源对齐的维护负担。登录后 `GET /api/user/info` 返回：

```ts
{ code: 0, data: { user: UserInfo, menus: [{ label: '用户管理', code: 'UserManagement', routeName: 'UserManagement' }, ...] } }
```

> mock 直接回吐 `src/modules/app/config/menu.config.ts` 的 `menuConfig` 作为演示单一源；生产环境由真实后端按用户角色返回**已过滤**的菜单树。`menu.config.ts` 仍是 mock 的数据来源（也是 `menu-visualizer` 插件的输入）。

`authStore` 做两件事：存下完整 `menus` 树（侧边栏直接渲染）；递归收集 `menus[].code` 进 `permissionCodes`（`Set<string>`）。

```ts
// src/modules/auth/stores/auth.ts
function hasPermission(code: string): boolean {
  return permissionCodes.value.has(code);
}
```

**三道防线：**

1. **路由守卫**（`router.ts` 的 `beforeEach`，**默认拒绝**模型）：
   - `meta.public`（`/login`、`/403`、`/404`）→ 放行；已登录访问 `/login` 跳首个业务菜单；
   - 其余一律需登录——未登录 → `/login`（带 `redirect` 回跳）；
   - `fetchUser` 真失败 → `/403`；
   - 路由声明了 `meta.code` 但 `hasPermission` 返回 false → `/403`；
   - 容器 / 布局路由（无 `meta.code`，如布局壳）→ 已登录即放行；
   - 末尾 `/:pathMatch(.*)*` catch-all → 404 页。

2. **侧边栏**（`Default.layout.vue`）：**直接渲染后端 `menus` 树**（后端已按角色过滤，前端无需 `filterMenu`），点击按 `routeName` 跳转。

3. **按钮级 `v-permission` 指令**（全局已注册）：无权限的元素自动 `display: none` 隐藏。

```vue
<!-- 单个 code -->
<a-button v-permission="'UserManagement:delete'">删除</a-button>
<!-- 传数组：任一命中即显示 -->
<a-button v-permission="['UserManagement:edit', 'UserManagement:create']">编辑</a-button>
```

脚本逻辑里用 `usePermission()` composable（`has` / `hasAny` / `hasAll`），或直接 `authStore.hasPermission()`。

```ts
import { usePermission } from '@/shared/composables/usePermission';
const { has, hasAny } = usePermission();
if (has('UserManagement')) {
  /* ... */
}
```

> ⚠️ 前端隐藏仅为 UX，真正的权限边界**必须**在后端校验。模板当前未含数据权限 / 字段级权限，需要时在 `hasPermission` 之上扩展。

> 🧪 **验证样例（多角色 mock）**：demo 内置三个演示账号（密码任意，需填验证码），用来肉眼验证守卫与 `v-permission`：
>
> | 账号      | 现象                                                                                        |
> | --------- | ------------------------------------------------------------------------------------------- |
> | `admin`   | 侧边栏全量（用户/角色管理）；列表「删除」按钮可见                                           |
> | `manager` | 仅「用户管理」；**删除按钮被 `v-permission` 隐藏**；地址栏直敲 `/role-management` → **403** |
> | `viewer`  | 侧边栏空；登录后**直接 403**（默认拒绝守卫生效的铁证）                                      |
>
> 切换账号登录即可观察：`manager` 缺 `UserManagement:delete` → 按钮隐藏；缺 `RoleManagement` → 路由 403。

### 6.4 认证流程（登录 / RSA / 验证码）

调用链：`Login.view.vue` → `useLoginForm` → `useRsaEncrypt`(RSA 加密密码) → `authStore.login()` → `POST /api/auth/login` → 成功后 `fetchUser()`。

```ts
// 真实登录参数（密码是 RSA 密文）
interface LoginParams {
  username: string;
  password: string; // RSA 加密后的密文
  captchaCode: string; // 图形验证码
}
```

**Mock 行为**（`src/mock/handlers/auth.ts`）：任意账号密码 + 验证码正确即放行，登录态用 `sessionStorage['mock-auth']='1'` 标记，刷新页面后仍保持登录（直到登出或关标签页）。

### 6.5 数据请求层封装与使用

模板内置统一请求层 **`@/core/http`**：基于 axios 封装单例实例 + 拦截器，自动处理 **token 注入、业务信封解包、401 跳转、超时 / 网络错误**，并提供多种自定义扩展方式。所有业务 api 文件**复用同一实例**，不再各自 `axios.create()`。

> 本节是 `@/core/http` 的完整使用手册：从快速上手 → 日常写 api → 错误处理 → 高级扩展，按需阅读即可。

#### ① 模块结构

`src/core/http/` 按职责拆成 6 个小文件（高内聚、低耦合，每个文件聚焦一件事）：

| 文件              | 职责             | 关键导出                                                                                   |
| :---------------- | :--------------- | :----------------------------------------------------------------------------------------- |
| `types.ts`        | 类型定义         | `ApiResponse<T>`、`HttpRequestConfig`、`HttpInstance`、`HttpOptions`                       |
| `error.ts`        | 统一错误类       | `HttpError`（含 `status` / `isTimeout` / `isNetworkError`）                                |
| `config.ts`       | 运行时可注入配置 | `configureHttp()`、`HttpRuntimeConfig`                                                     |
| `interceptors.ts` | 默认拦截器       | `setupInterceptors()`、`attachAuthHeader`、`unwrapBusinessEnvelope`、`handleResponseError` |
| `instance.ts`     | 实例工厂         | `createHttp()`、`request`（默认实例）                                                      |
| `index.ts`        | 统一出口         | 汇总导出上述全部                                                                           |

> 日常开发只需从 `@/core/http` 导入 `request`（发请求）和必要的类型即可，其余文件是封装实现细节，一般无需直接碰。

#### ② 统一响应格式（前后端约定）

所有接口最外层固定为业务信封：

```ts
interface ApiResponse<T = unknown> {
  code: number; // 0 = 成功，非 0 = 业务错误
  data: T; // 业务数据，类型由泛型 T 决定
  message?: string; // 可选提示文案，常用于错误时展示
}
```

#### ③ 核心机制：响应拦截器「解壳」

axios 原生 `.get()` 返回 `AxiosResponse<T>`（含 `status / headers / config` 等传输层信息，业务数据藏在 `.data` 里）。本封装的响应拦截器自动剥掉这层外壳，**直接返回 `ApiResponse<T>`**：

```ts
// 原生 axios：要解两层
const { data: res } = await axios.get('/users/1'); // res = ApiResponse
const user = res.data; // User

// 本封装：直接拿到业务信封
const res = await request.get<User>('/users/1'); // res: ApiResponse<User>
if (res.code !== 0) throw new Error(res.message);
console.log(res.data); // User
```

> 因此调用方从 `const { data: res } = await x()` 简化为 `const res = await x()`，少一层解构、类型也更直接。

#### ④ 快速开始（三步）

**第 1 步** —— 写 api（复用默认实例 `request`）：

```ts
// src/pages/.../features/order/api/order.api.ts
import { request } from '@/core/http';
import type { Order, OrderListParams, OrderListResult } from '../models/Order';

export const getOrderList = (params: OrderListParams) =>
  request.get<OrderListResult>('/orders', { params });
// 返回 Promise<ApiResponse<OrderListResult>>
```

**第 2 步** —— 在 composable 里调用，从 `res.data` 取业务数据：

```ts
const res = await getOrderList({ page: 1, pageSize: 10 });
return res.data; // { list: Order[], total: number }
```

**第 3 步** —— 完成。token 注入、错误处理、信封解包都已自动就绪（`bootstrap` 启动时已配置好，见 ⑨）。

#### ⑤ 典型 api 文件（CRUD 全家桶）

参考 `features/user/api/user.api.ts`：

```ts
import { request } from '@/core/http';
import type { User, UserListParams, UserListResult } from '../models/User';

export const getUserList = (params: UserListParams) =>
  request.get<UserListResult>('/users', { params });

export const getUserDetail = (id: string) => request.get<User>(`/users/${id}`);

export const createUser = (data: Omit<User, 'id' | 'createdAt'>) =>
  request.post<User>('/users', data);

export const updateUser = (id: string, data: Partial<User>) =>
  request.put<User>(`/users/${id}`, data);

export const deleteUser = (id: string) => request.delete(`/users/${id}`);
```

> 泛型 `<T>` 传的是**业务数据类型**（即 `data` 字段的类型），不是整个信封——封装方法会自动包成 `ApiResponse<T>`。

#### ⑥ 分层调用约定

| 层                             | 职责                                                                           | 禁止                                |
| :----------------------------- | :----------------------------------------------------------------------------- | :---------------------------------- |
| **API 层**（`*.api.ts`）       | 只发请求、返回 `ApiResponse<T>`                                                | ❌ 做 UI 反馈（`message.error` 等） |
| **Composable 层**（`use*.ts`） | `const res = await getXxx()`，取 `res.data`，管 `loading` / `error` 与 UI 反馈 | ❌ 关心请求细节                     |
| **View 层**（`*.vue`）         | 组合 composables + 组件                                                        | ❌ 直接调用 `request`               |

#### ⑦ 错误处理

封装把所有**传输层失败**归一为统一错误类 **`HttpError`**（`@/core/http` 导出），按类型区分：

| 错误类型      | 判断字段                         | 触发场景                   | 默认行为                                |
| :------------ | :------------------------------- | :------------------------- | :-------------------------------------- |
| HTTP 状态错误 | `e.status`（如 401 / 404 / 500） | 服务端返回非 2xx           | 401 → `onUnauthorized`（登出 + 跳登录） |
| 请求超时      | `e.isTimeout === true`           | 超过 `timeout`（默认 10s） | `onNetworkError` 提示                   |
| 网络中断      | `e.isNetworkError === true`      | 断网 / DNS / CORS          | `onNetworkError` 提示                   |

在 composable 里 catch：

```ts
import { HttpError } from '@/core/http';
import { message } from 'ant-design-vue';

async function fetchDetail(id: string) {
  try {
    const res = await getOrderDetail(id);
    if (res.code !== 0) {
      message.error(res.message || '加载失败'); // 业务错误（HTTP 成功但 code≠0）
      return;
    }
    order.value = res.data;
  } catch (e) {
    if (e instanceof HttpError) {
      // 传输层错误：401 已被拦截器自动跳登录；超时 / 网络已被全局提示
      // 这里通常只需静默或做局部兜底
    }
  }
}
```

> **业务码 `code !== 0` 默认不抛错**——不同场景策略不同（登录要展示 message、列表要静默重试），故保留给调用方判断；如需全局兜底，可在 `configureHttp({ onBusinessError })` 中统一处理。

#### ⑧ 单请求级开关

`HttpRequestConfig`（请求方法的第 2 / 3 个参数）扩展了三个开关，按单次请求关闭默认行为：

| 开关               | 作用                                                   | 典型场景                                       |
| :----------------- | :----------------------------------------------------- | :--------------------------------------------- |
| `skipAuth`         | 不附加 `Authorization` 头                              | 登录、验证码等匿名接口                         |
| `skipErrorHandler` | 不触发全局错误回调（401 / 网络提示），仅抛 `HttpError` | 自行 catch 定制提示；登出接口（防 401 死循环） |
| `rawResponse`      | 保留原始 `AxiosResponse`、跳过解包                     | 文件下载（`blob`）、流式响应                   |

```ts
// 登录接口：匿名 + 失败自行处理
export const login = (data: LoginParams) =>
  request.post<LoginResult>('/auth/login', data, { skipAuth: true });

// 登出：跳过全局处理，避免 401 触发 onUnauthorized 与本地清态循环
export const logout = () =>
  request.post<void>('/auth/logout', undefined, { skipErrorHandler: true });

// 文件下载：保留原始响应拿 blob
export const exportUsers = () =>
  request.get<Blob>('/users/export', { responseType: 'blob', rawResponse: true });
```

#### ⑨ 自定义扩展（三种方式）

**方式一：运行时依赖注入 `configureHttp()`**

`core/http` 刻意不 import router / pinia（否则会形成 `http → store → api → http` 循环依赖）。改为在 `src/core/bootstrap/index.ts` 启动时，把 token、跳转、提示等能力以回调注入：

```ts
// src/core/bootstrap/index.ts（模板已配好，一般无需改动）
import { configureHttp } from '@/core/http';

app.use(createPinia()); // 必须先就绪 Pinia
setupRouter(app);

configureHttp({
  getToken: () => localStorage.getItem('token'),
  onUnauthorized: () => {
    useAuthStore().logout();
    router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } });
  },
  onNetworkError: (e) => message.error(e.message),
  onBusinessError: (res) => message.error(res.message || '操作失败'), // 可选：业务错误全局兜底
});
```

**方式二：多实例 `createHttp()`**

对接不同后端 / 不同 `baseURL` 时，创建独立实例（各自独立的拦截器与配置）：

```ts
import { createHttp } from '@/core/http';

const payHttp = createHttp({ baseURL: '/payment-api', timeout: 30000 });
export const createPayment = (data) => payHttp.post<Payment>('/orders', data);
```

**方式三：自定义拦截器**

需要完全控制拦截逻辑（如自定义签名、响应转换）时，关闭默认拦截器再自行组装；也可复用内置的 `attachAuthHeader` 等单件：

```ts
import { createHttp, attachAuthHeader } from '@/core/http';

const http = createHttp({ withDefaultInterceptors: false });
// 复用内置 token 注入，再追加自定义签名
http.axios.interceptors.request.use(attachAuthHeader);
http.axios.interceptors.request.use((config) => {
  config.headers.set('X-Sign', sign(config.data));
  return config;
});
```

#### ⑩ 请求保护（防竞态与频繁触发）

「一个接口被频繁触发」会带来三个问题：

| 问题                       | 场景                                    | 后果                                 |
| :------------------------- | :-------------------------------------- | :----------------------------------- |
| **Race Condition（竞态）** | 搜索框快速输入 `a→ab→abc`，多个请求并发 | 后到的旧响应覆盖新响应，显示过期数据 |
| **重复请求堆积**           | 连点「查询」N 次                        | N 次后端查询，浪费带宽 / 服务器资源  |
| **输入无防抖**             | 每次按键都发请求                        | 高频轰炸后端                         |

封装提供两层防护：

**① cancelPrevious —— 相同请求自动取消（解决竞态 + 重复堆积）**

开启后，相同 key（`method + url + params + data`）的新请求会自动 `abort` 旧的，只保留最新；不同接口 key 不同、互不影响。被取消的旧请求抛 `RequestCanceledError`（**静默**，不触发全局错误提示）。

```ts
// 单请求级开启（推荐：仅给查询 / 搜索类接口开）
export const searchUsers = (q: string) =>
  request.get<UserListResult>('/users/search', { params: { q }, cancelPrevious: true });

// 或实例级开启：该实例所有请求都启用
const searchHttp = createHttp({ cancelPrevious: true });
```

> 默认 `cancelPrevious: false`（opt-in）。原因是 vxe-grid 等表格的 `proxyConfig` 会接管请求结果，自动取消会让表格收到 `RequestCanceledError` 而需额外处理；故查询 / 搜索接口**按需开启**，普通 CRUD 接口保持默认。也可用 `skipCancel: true` 反向关闭某个请求。

调用方处理被取消的请求：

```ts
import { RequestCanceledError } from '@/core/http';

async function search(keyword: string) {
  try {
    const res = await searchUsers(keyword);
    list.value = res.data.list;
  } catch (e) {
    if (e instanceof RequestCanceledError) return; // 被更新的请求取代，静默忽略
    message.error('搜索失败');
  }
}
```

**② 搜索框防抖（composable 层，解决输入高频）**

`cancelPrevious` 解决「重复请求」，但每次按键仍会发出请求。搜索框应配合**防抖**，只在用户停止输入后再发（项目无额外依赖，自实现即可）：

```ts
// 通用防抖工具（可放入 shared/composables）
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const debouncedSearch = debounce((keyword: string) => search(keyword), 300);
// 输入框 @input="debouncedSearch" —— 停止输入 300ms 后才真正请求
```

> 💡 组合最佳实践：**防抖（降低触发频率）+ cancelPrevious（兜底竞态）**，搜索体验最稳。

#### ⑪ 文件上传与下载

普通请求走 `{ code, data, message }` 信封，但文件传输不同：下载响应是二进制 blob、上传请求是 FormData。封装提供 `request.download` / `request.upload` 方法专门处理。

**下载 `request.download(url, options?)`**

- 以 `responseType: 'blob'` 请求，自动从响应头 `content-disposition` 提取文件名（支持 `filename*= UTF-8''` 中文编码）；
- **自动检测「blob 包装的 JSON 错误」**：下载接口出错时服务端返回 `{ code, message }`，axios 也会包成 blob，封装会读取判断并转成 `HttpError` 抛出，避免把错误信息当文件保存成乱码；
- 默认自动触发浏览器保存，返回 `{ blob, filename }` 备用（`autoSave: false` 可仅取 blob 用于预览）。

```ts
import { HttpError } from '@/core/http';

// 最简：点击导出 → 自动下载
async function handleExport() {
  try {
    const { filename } = await request.download('/users/export', {
      params: { format: 'xlsx' },
      onProgress: (p) => (progress.value = p), // 进度 0-100
    });
    message.success(`已下载 ${filename}`);
  } catch (e) {
    if (e instanceof HttpError) message.error(e.message);
  }
}

// 仅取 blob（如 PDF 预览，不触发保存）
const { blob } = await request.download('/report/preview', { autoSave: false });
previewUrl.value = URL.createObjectURL(blob);
```

**上传 `request.upload(url, data, options?)`**

- 传 `FormData`，axios 自动加 `multipart/form-data` boundary（**切勿手动设 Content-Type**，否则丢失 boundary 导致解析失败）；
- 支持 `onProgress` 上传进度；响应仍是业务信封，走正常解包返回 `ApiResponse<T>`。

```ts
async function handleUpload(file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await request.upload<{ url: string }>('/files/upload', form, {
    onProgress: (p) => (progress.value = p),
  });
  if (res.code === 0) message.success('上传成功');
}
```

> 💡 大文件上传可在 `UploadOptions` 传 `cancelPrevious: true`，配合「重新上传」按钮中断上一次未完成的上传。封装还导出 `saveBlob` / `extractFilename` 工具函数，供自定义保存 / 文件名场景使用。

#### ⑫ Token 无感续期（活跃用户不过期）

access token 有有效期，过期后请求会 401。封装内置「**主动刷新 + 401 兜底**」双保险，让**活跃用户的 token 自动续期、只有真正闲置才会过期**：

- **B 主动刷新**：请求拦截器发送前检查 token 剩余有效期 < 5 分钟 → 先调 refresh 换新 token 再发。活跃用户（持续发请求）的 token 永不过期。
- **C 401 兜底**：万一主动刷新没覆盖到（休眠唤醒、时钟漂移），token 真过期 → 401 → 自动 refresh + 重试原请求，用户完全无感。

三个关键工程点（均已内置，业务无需关心）：

- **并发去重**：多个请求同时临过期 / 同时 401，只发起**一次** refresh，其余 await 同一个 promise（`TokenRefreshCoordinator` 单例）；
- **重试队列**：refresh 期间到来的 401 请求排队，refresh 成功后用新 token 重试；
- **防递归**：refresh 请求自身带 `skipRefresh` 不进入续期逻辑；重试请求带 `__refreshRetried` 标记，二次 401 不再重试、直接登出。

**启用方式**：在 `bootstrap` 通过 `configureHttp` 注入 `refreshAccessToken` + `onTokenRefreshed`（模板已配好）。未注入则不启用续期，401 直接 `onUnauthorized`。

**本地存储约定**（与默认实现一致，auth store 登录时写入）：

| 键               | 含义                                          |
| :--------------- | :-------------------------------------------- |
| `token`          | access token（请求头 `Authorization` 用）     |
| `refreshToken`   | refresh token（续期换新 access 用）           |
| `tokenExpiresAt` | access token 绝对过期时间戳（主动刷新判断用） |

> mock 已实现完整双 token 流程：access 默认 2 分钟（可用 `VITE_MOCK_ACCESS_TTL_SEC` 调）、refresh 30 分钟。登录后持续操作即可观察自动续期；闲置超过 refresh 有效期才会真正登出。

> ⚠️ **排查「看不到 refresh 请求」**：
>
> 1. 本机制是**请求驱动**，不是后台定时器。用户停在页面**不动**（idle）时不会刷新——必须「发请求」才会触发方案 B，或「请求收到 401」才会触发方案 C。
> 2. 若登录后**立刻**也看不到 `/api/auth/refresh`，多半是 `localStorage.tokenExpiresAt` 残留了**旧的远期时间戳**（`isTokenExpiring` 据此判定「还很新鲜」→ 永不主动刷新）。清掉 `token` / `refreshToken` / `tokenExpiresAt` 三个 key 后重新登录即可。
> 3. 改 `.env.development` 的 `VITE_MOCK_ACCESS_TTL_SEC` 后**必须重启 dev server**，Vite 不会热加载环境变量。
> 4. 开发期协调器已内置 `[http:refresh]` trace 日志（`console.debug`，生产被 tree-shake），控制台可直接看到「为何没刷新 / 刷新了几次」。

> 🛠 **DEV 观测面板**：开发期右下角有「Token 续期」悬浮面板，实时显示剩余有效期 / 续期次数，并提供「发起测试请求 / 标记临过期 / 检查并续期 / 模拟 401」按钮，可确定性验证方案 B/C（闲置无请求时点「发起测试请求」即可造一个请求）。设 `VITE_DEV_TOKEN_PANEL=false` 关闭；生产构建不打包。

##### 与后端对接清单

接入真实后端时，把本节发给后端确认以下契约：

**1. 登录接口** `POST /auth/login`

- 响应 `data` 必须含三字段：

  ```json
  { "accessToken": "...", "refreshToken": "...", "expiresIn": 1800 }
  ```

- `expiresIn` 单位为**秒**（前端据此算过期时间戳）。若用 JWT，也可让前端从 `exp` 解析（需覆盖 `isTokenExpiring`）。

**2. 刷新接口** `POST /auth/refresh`

- 请求 body：`{ "refreshToken": "..." }`
- 成功响应 `data`：`{ "accessToken": "...", "expiresIn": 1800 }`（rolling 模式可附带新 `refreshToken`）
- **失败用 HTTP 401**（refresh token 失效）——前端据此判定「真正登出」，不再续期

**3. 鉴权约定**

- 所有需登录接口：前端发 `Authorization: Bearer <accessToken>`；
- access token 过期 → 后端返回 **HTTP 401**（前端自动 refresh 重试，后端无需感知续期）。

**4. 安全建议**

- access token 短（15~30 分钟）、refresh token 长（7~30 天）；
- refresh token 建议 **rolling**（每次 refresh 下发新的、旧的失效），便于吊销会话；
- 全程 HTTPS；refresh token 可考虑 httpOnly cookie（前端读不到时需调整存储约定）；
- refresh 接口建议做**单设备限制 / 频率限制**，防被盗用。

> 若后端无法提供 refresh 接口（如某些网关方案），可退化为「滑动续期」：后端在每次鉴权响应头带 `New-Token`，前端在 `onTokenRefreshed` 里更新本地即可——主动刷新与 401 兜底可按需关闭（不注入 `refreshAccessToken`）。

#### ⑬ 从旧写法迁移

若你的早期副本里 api 文件还在各自 `axios.create()`，按下表迁移：

| 旧写法                                                              | 新写法                                      |
| :------------------------------------------------------------------ | :------------------------------------------ |
| `import axios from 'axios'`                                         | `import { request } from '@/core/http'`     |
| `const request = axios.create({ baseURL: '/api', timeout: 10000 })` | 删除（复用默认实例）                        |
| `request.get<{ code; data: T }>(...)`                               | `request.get<T>(...)`（泛型传业务数据类型） |
| 调用方 `const { data: res } = await x()`                            | `const res = await x()`                     |
| `res.data.data`（解两层）                                           | `res.data`（解一层）                        |

> 💡 一句话总结：**api 层 `request.get<业务类型>(url)`，调用层 `const res = await api()` 后用 `res.data`**。token、401、超时、网络错误全部自动处理，业务只关心「成功拿 data / 失败看 code」。

### 6.6 Mock：MSW 仅开发环境

入口在 `src/main.ts`：

```ts
if (import.meta.env.DEV) {
  import('@/mock/browser').then(({ worker }) => {
    worker.start({ onUnhandledRequest: 'bypass' }).then(setupApp); // 未匹配的请求放行
  });
} else {
  setupApp(); // 生产构建不含 Mock
}
```

- Mock 处理器集中在 `src/mock/handlers/`，在 `index.ts` 聚合后注入 worker。
- 测试数据放在 `src/mock/data/`（如 `user.ts` 内置 30 条随机用户，支持增删改查）。
- 生产构建（`pnpm build`）**不会**打包 mock，可放心上线。

---

## 七、内置通用能力（拿来即用）

### 7.1 `PageWrapper` — 页面骨架

统一的「搜索头 + 内容区 + 页脚」布局，基于 Tailwind：

```vue
<script setup lang="ts">
import { PageWrapper } from '@/shared/components/page-wrapper';
</script>

<template>
  <PageWrapper>
    <template #search>
      <!-- 搜索条件区（自动放在右上角白色卡片里） -->
    </template>

    <!-- 默认插槽：主体内容（flex-1 滚动） -->
    <MyTable />

    <template #footer>
      <!-- 可选页脚 -->
    </template>
  </PageWrapper>
</template>
```

可选具名插槽：`header` / `search` / `extra`（右上角操作）/ 默认 / `footer`。

### 7.2 `QueryFilter` — 配置式搜索区

用一个 config 数组描述搜索项，支持 `input / select / tree-select / cascader / date-picker / date-range`：

```vue
<script setup lang="ts">
import { QueryFilter, type FilterItemConfig } from '@/shared/components/query-filter';
import { UserStatusOptions, UserRoleOptions } from '../models/User';

const filters = ref({ name: undefined, status: undefined, role: undefined });

const filterConfig: FilterItemConfig[] = [
  {
    type: 'input',
    label: '用户名',
    name: 'name',
    fieldProps: { placeholder: '请输入用户名', allowClear: true },
  },
  {
    type: 'select',
    label: '状态',
    name: 'status',
    fieldProps: { options: UserStatusOptions, allowClear: true, style: { width: '120px' } },
  },
  {
    type: 'select',
    label: '角色',
    name: 'role',
    fieldProps: { options: UserRoleOptions, allowClear: true, style: { width: '120px' } },
  },
  // 日期范围（注意 name 是二元组）
  // { type: 'date-range', label: '创建时间', name: ['startDate', 'endDate'] },
];
</script>

<template>
  <QueryFilter
    v-model:value="filters"
    :config="filterConfig"
    @search="handleSearch"
    @reset="resetFilters"
  />
</template>
```

> `input` 类型按回车会自动触发 `@search`。

### 7.3 `useSpin` — 4 态防闪烁 loading

避免「接口很快返回但 loading 闪一下」的体验问题。状态机：`IDLE → PENDING → SPINNING → LINGERING → IDLE`。

```ts
import { useSpin } from '@/shared/composables/useSpin';
const { spinning, start, stop } = useSpin({ delay: 300, minDuration: 400 });
// delay: 请求开始 300ms 后才显示 loading（短请求不闪）
// minDuration: 一旦显示，至少持续 400ms（避免一闪而过）

start(); // 请求开始
const data = await fetchData();
stop(); // 请求结束
// spinning 绑定到 <a-spin :spinning="spinning" />
```

### 7.4 `CrossPageSelect` — 跨页选择

用于「跨分页批量选择行」场景，导出 `useCrossPageSelect` / `useCrossPageGrid` / `CrossPageSelectBanner` 等（见 `src/shared/components/cross-page-select/README.md`）。

### 7.5 `COPY` — 全站文案常量

所有界面文案集中管理，方便后续做 i18n。定义在 `src/shared/constants/copy.ts`：

```ts
export const COPY = {
  COMMON: {
    CONFIRM: '确认',
    CANCEL: '取消',
    CREATE: '新建',
    EDIT: '编辑',
    DELETE: '删除',
    SEARCH: '搜索',
    RESET: '重置',
    SUCCESS: '操作成功',
    FAILED: '操作失败',
  },
  LOGIN: {
    /* ... */
  },
} as const;

// 使用
import { COPY } from '@/shared/constants/copy';
message.success(COPY.COMMON.SUCCESS);
```

### 7.6 `ROUTE_NAMES` — 路由名常量

见 [6.2](#62-路由系统手动聚合--名称常量)，自动生成，配合 `defineOptions({ name })` 使用。

### 7.7 主题系统与统一换肤

当前主题链路分成两层：

- **运行时真源**：`src/core/theme/` 里的 `ThemeTokens` 驱动 Tailwind、Ant Design Vue、VXE Table、ECharts 四端联动；现在已纳入 `colors / text / bg / border / typography / spacing / radius / layout`。
- **设计稿导出链路**：`design.md -> theme.tokens.json -> theme.tailwind.json -> tailwind.config.js`。其中 `theme.tokens.json` 是 `@google/design.md` 的 raw 导出，`theme.tailwind.json` 是项目内适配层产物，负责把第三方导出格式映射到本项目稳定的 Tailwind 语义结构。

**推荐命令**：

```bash
pnpm run tokens:export
pnpm run tokens:check
```

- `tokens:export`：从 `design.md` 生成 `theme.tokens.json` 和 `theme.tailwind.json`
- `tokens:check`：同时校验 raw 导出结构、Tailwind 适配结果，以及 `design.md` 与 `src/core/theme/tokens.ts` 中 `lightTokens` 默认值的一致性

**开箱即用**：`DefaultLayout` 顶栏右侧的 `ThemeSwitcher` 可切「亮/暗」与 5 套主色预设（蓝/绿/紫/橙/红）。登录后访问侧边栏「**主题预览**」（路由 `/theme-preview`，admin 可见）可对照色板 / antd 全组件 / VXE 表格 / ECharts 图表 / 业务卡片，肉眼验证联动效果。

**业务侧切换**：

```ts
import { useTheme } from '@/core/theme';
const { isDark, toggleMode, setPreset, presets } = useTheme();
```

**画 ECharts（自动跟随主题）**：

```ts
import * as echarts from 'echarts';
import { useEcharts } from '@/core/theme';
const el = ref<HTMLElement>();
const { setOption } = useEcharts(el, echarts);   // 自动：主题注入 + 容器 resize + 切主题重建回放
onMounted(() => setOption({ series: [{ type: 'bar', data: [...] }] }));
```

**调整 antd 组件的主题覆盖**：antd v3 主色在编译期固化为字面色，运行时跟随主题靠覆盖样式实现。覆盖样式按组件类别拆分为 `src/core/theme/bridges/antd/*.less`（`base` / `buttons` / `selection` / `navigation` / `inputs` / `feedback` / `containers` / `picker` / `misc`），由 `bridges/antd.ts` 用 Vite `?inline` 编译拼接后注入 `<head>`（位于 antd.css 之后，同特异性下后加载胜）。改某个组件的主题表现直接编辑对应 `.less` 即可（开发期 HMR 即时生效），新增组件覆盖按同模板追加规则。注意主题色为运行时 CSS 变量，less 仅用嵌套 / mixin 组织代码，其变量与颜色函数（`lighten` 等）对 `var()` 无效。日期类组件（DatePicker / TimePicker / Calendar）依赖 dayjs，中文 locale 已在 `core/plugins/antd.ts` 统一注入。

> 完整机制（SSOT 架构图、模块结构、扩展预设 / 自定义 Token、antd v3 局限与升级路径、Design Token 速查表）见 [`theme.md`](./theme.md)。

### 7.8 浏览器版本支持

脚手架默认采用「**声明下限 + 运行时只提示、不降级**」策略（A 方案）：浏览器版本低于下限时，启动即整屏提示「请升级浏览器」并**不挂载应用**；另提供一个可选开关启用 legacy 降级（B 方案）兼容更老浏览器。代码在 `src/core/browser-support/`。

**默认下限**（近 ~3 年主流浏览器）：

| 浏览器        | 最低版本 | 约对应时间 |
| :------------ | :------- | :--------- |
| Chrome / Edge | ≥ 100    | 2022       |
| Firefox       | ≥ 100    | 2022       |
| Safari        | ≥ 15     | 2021       |
| IE            | 不支持   | —          |

**工作原理**：`bootstrap` 在 `app.mount` 之前调用 `isBrowserSupported()`，不达标时渲染原生 DOM 整页提示（刻意不依赖 Vue，极老浏览器也能显示）并直接 `return`。判定是纯函数，单测见 `detectBrowser.spec.ts` / `isSupported.spec.ts`；UA 无法识别的浏览器默认放行（不误伤）。

**调整下限**：改 `src/core/browser-support/config.ts` 的 `MIN_BROWSER_VERSIONS`，并**同步** `package.json` 的 `browserslist`——前者是「运行时」判定源，后者是「构建期」声明（驱动 autoprefixer 加 CSS 前缀），两处口径必须一致，否则会出现「构建按旧范围加前缀、运行时按新范围拦截」的错位。

> ⚠️ **关于 `color-mix()`**：主题 hover 态用了 CSS `color-mix()`（Safari ≥16.2 / Chrome ≥111 / Firefox ≥113）。默认下限比它宽松，在略旧浏览器上 `color-mix` 会优雅降级（声明被忽略、回退为无该样式），不阻断使用；如需严格对齐，请相应上调下限。

**B 方案：兼容更老浏览器（可选，默认不开）**

默认不引入任何额外依赖。需要兼容到约 2018 年浏览器时：

```bash
# 1. 安装 legacy 插件（它依赖 terser 做压缩）
pnpm add -D @vitejs/plugin-legacy terser

# 2. 在构建 env（如 .env.production）开启开关
#    VITE_LEGACY_BUILD=true
```

开启后 `vite build` 会额外输出 SystemJS + polyfill 包，兼容到 Chrome ≥64 / Edge ≥79 / Firefox ≥67 / Safari ≥12。开关关闭或不装包时，构建与产物与 A 方案完全一致——`vite.config.ts` 用 dynamic import 按需加载，开启但未安装会抛清晰报错指引安装。

### 7.9 项目文档页（应用内阅读项目 Markdown）

内置一个「项目文档」页（路由 `/readme`，菜单「项目文档」，admin 可见），在应用内离线预览项目内常用 Markdown。代码在 `src/pages/readme/`，渲染器是通用组件 `src/shared/components/markdown/MarkdownViewer.vue`。

**实现要点**：

- **内容源**：构建期用 `import.meta.glob([...], { query: '?raw', import: 'default', eager: true })` 收录项目内白名单目录下的 Markdown，目前包含根目录文档、`docs/**/*.md`、`src/**/*.md`、`build-plugins/**/*.md`、`scripts/**/*.md`，避免把 `node_modules` 之类依赖文档打包进来。
- **切换方式**：页面顶部下拉和左侧目录共用同一份文档索引，路由仍是 `/readme`，当前文件通过查询参数传递，例如 `/readme?file=/docs/ARCHITECTURE.md`。
- **渲染**：`markdown-it` 转 HTML 后用 `v-html` 注入；样式引用主题 CSS 变量，自动跟随亮暗 / 主色；代码块统一深色背景（**未做语法高亮**，需要时可经 markdown-it 的 `highlight` 选项接入 highlight.js / shiki）。

**复用渲染器**（任何「Markdown 字符串 → 排版正文」的场景）：

```ts
import MarkdownViewer from '@/shared/components/markdown/MarkdownViewer.vue';
// <MarkdownViewer :source="markdownString" />
```

> 安全提示：`MarkdownViewer` 默认 `html:false`（转义内联 HTML），适合渲染可信文档（项目自带 README 等）；渲染外部不可信内容前请自行 sanitize。

---

## 八、开发一个新页面（完整实战）

目标：新增「订单管理」域，含一个订单列表页（搜索 + 分页表格 + 删除）。

### 方式 A：用脚手架（推荐，30 秒）

```bash
# 1) 创建域（会生成目录结构 + 域路由文件 + page 壳 + 默认特性）
pnpm scaffold:domain
#   请输入域名: order-management
#   请输入中文名: 订单管理
#   请输入默认特性名: (回车使用域名)

# 2) 在根路由里接入这个域（★ 必做，脚手架不会自动接，见下方避坑）
#    编辑 src/core/bootstrap/router.ts

# 3)（可选）在域下追加更多特性
pnpm scaffold:feature
```

**⚠️ scaffold:domain 三大避坑（极重要）：**

1. **不会自动接入根路由**：创建后必须手动在 `src/core/bootstrap/router.ts` 加入：

   ```ts
   import { orderManagementRoutes } from '@/pages/order-management/order-management.routes';
   // 在根布局 children 里追加
   children: [
     { path: '', redirect: '/user-management' },
     ...userManagementRoutes,
     ...orderManagementRoutes,   // ← 新增这一行
   ],
   ```

   > 终端会提示你在 `src/router/index.ts` 导入路由——**那个路径已过时**，真实文件是 `src/core/bootstrap/router.ts`。

2. **菜单 / 权限只需维护一处**：`scaffold:domain` 默认会把新菜单加进 `menu.config.ts`（`--no-menu` 可跳过）；而 `mock/handlers/auth.ts` **直接回吐 `menuConfig`**（单一真相源），不再单独维护 mock 菜单。若跳过了菜单，登录用户权限码里没有 `OrderManagement` → 访问 `/order-management` 会**直接跳 403**，在 `menu.config.ts` 补一项即可（mock 自动生效）：

   ```ts
   // src/modules/app/config/menu.config.ts 末尾追加（mock 自动回吐，无需改 mock）
   { label: '订单管理', code: 'OrderManagement', routeName: 'OrderManagement' },
   ```

   > `scaffold:feature` 也会自动更新 `menu.config.ts`（mock 随之生效）。省心姿势：domain 建骨架 + 手动接根路由，之后每个页面用 feature。

3. **API 路径是占位**：生成的 `api.ts` 里 URL 形如 `/order-management/order/list`，记得改成你的真实后端接口。

### 方式 B：手写（理解原理）

以「订单列表」为例，按数据流从下往上写 6 个文件：

**① Model**（`src/pages/order-management/features/order/models/Order.ts`）

```ts
/** 订单实体 */
export interface Order {
  id: string;
  orderNo: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
}

export const OrderStatuses = { PAID: 'paid', UNPAID: 'unpaid', CANCELLED: 'cancelled' } as const;
export type OrderStatus = (typeof OrderStatuses)[keyof typeof OrderStatuses];

export const OrderStatusOptions = [
  { label: '已支付', value: OrderStatuses.PAID },
  { label: '未支付', value: OrderStatuses.UNPAID },
  { label: '已取消', value: OrderStatuses.CANCELLED },
];

export interface OrderListParams {
  page: number;
  pageSize: number;
  orderNo?: string;
  status?: OrderStatus;
}
export interface OrderListResult {
  list: Order[];
  total: number;
}
```

**② API**（`features/order/api/order.api.ts`）

```ts
import { request } from '@/core/http';
import type { Order, OrderListParams, OrderListResult } from '../models/Order';

export const getOrderList = (params: OrderListParams) =>
  request.get<OrderListResult>('/orders', { params });

export const deleteOrder = (id: string) => request.delete(`/orders/${id}`);
```

**③ Composable**（`features/order/composables/useOrderList.ts`）—— 用 `vxe-grid` 的 `proxyConfig` 自动管分页：

```ts
import { ref, reactive } from 'vue';
import type { VxeGridInstance } from 'vxe-table';
import { message } from 'ant-design-vue';
import { getOrderList, deleteOrder } from '../api/order.api';
import type { OrderStatus } from '../models/Order';
import { COPY } from '@/shared/constants/copy';

export function useOrderList() {
  const filters = ref({
    orderNo: undefined as string | undefined,
    status: undefined as OrderStatus | undefined,
  });
  const gridRef = ref<VxeGridInstance | null>(null);

  const gridOptions = reactive({
    columns: [
      { field: 'orderNo', title: '订单号' },
      { field: 'amount', title: '金额' },
      { field: 'status', title: '状态', slots: { default: 'status_default' } },
      { field: 'createdAt', title: '创建时间' },
      { title: '操作', width: 160, slots: { default: 'actions_default' } },
    ],
    pagerConfig: { pageSize: 10 },
    proxyConfig: {
      props: { result: 'list', total: 'total' },
      ajax: {
        query: async ({ page }: { page: { currentPage: number; pageSize: number } }) => {
          const res = await getOrderList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...filters.value,
          });
          return res.data; // 返回 { list, total }
        },
      },
    },
  });

  function handleSearch() {
    gridRef.value?.commitProxy('query');
  }
  async function handleDelete(id: string) {
    try {
      await deleteOrder(id);
      message.success(COPY.COMMON.SUCCESS);
      handleSearch();
    } catch {
      message.error(COPY.COMMON.FAILED);
    }
  }

  return { gridRef, gridOptions, filters, handleSearch, handleDelete };
}
```

**④ View**（`features/order/views/OrderList.view.vue`）

```vue
<script setup lang="ts">
import { useOrderList } from '../composables/useOrderList';
import { OrderStatusOptions } from '../models/Order';
import { PageWrapper } from '@/shared/components/page-wrapper';
import { QueryFilter, type FilterItemConfig } from '@/shared/components/query-filter';
import { COPY } from '@/shared/constants/copy';

defineOptions({ name: 'OrderList' });

const { gridRef, gridOptions, filters, handleSearch, handleDelete } = useOrderList();

const filterConfig: FilterItemConfig[] = [
  {
    type: 'input',
    label: '订单号',
    name: 'orderNo',
    fieldProps: { placeholder: '请输入', allowClear: true },
  },
  {
    type: 'select',
    label: '状态',
    name: 'status',
    fieldProps: { options: OrderStatusOptions, allowClear: true, style: { width: '120px' } },
  },
];
</script>

<template>
  <PageWrapper>
    <template #search>
      <QueryFilter
        v-model:value="filters"
        :config="filterConfig"
        @search="handleSearch"
        @reset="handleSearch"
      />
    </template>

    <vxe-grid ref="gridRef" v-bind="gridOptions" border height="auto">
      <template #status_default="{ row }">
        <a-tag>{{
          OrderStatusOptions.find((o) => o.value === row.status)?.label ?? row.status
        }}</a-tag>
      </template>
      <template #actions_default="{ row }">
        <a-popconfirm title="确定删除？" @confirm="handleDelete(row.id)">
          <a-button type="link" danger size="small">{{ COPY.COMMON.DELETE }}</a-button>
        </a-popconfirm>
      </template>
    </vxe-grid>
  </PageWrapper>
</template>
```

**⑤ Page**（`pages/order-management/pages/OrderList.page.vue`）—— 极薄路由壳：

```vue
<script setup lang="ts">
import OrderListView from '../features/order/views/OrderList.view.vue';
import { ROUTE_NAMES } from '@/shared/constants/routeNames';
defineOptions({ name: ROUTE_NAMES.OrderManagement.ORDER_LIST }); // 若常量已生成
</script>
<template>
  <OrderListView />
</template>
```

**⑥ 域路由**（`pages/order-management/order-management.routes.ts`）

```ts
import type { RouteRecordRaw } from 'vue-router';

export const orderManagementRoutes: RouteRecordRaw[] = [
  {
    path: '/order-management',
    name: 'OrderManagement',
    meta: { code: 'OrderManagement', title: '订单管理', keepAlive: true },
    component: () => import('./pages/OrderList.page.vue'),
  },
];
```

**⑦ 接路由 + 配权限**：回到 [方式 A 的避坑 1、2](#方式-a用脚手架推荐30-秒)，把路由加入 `router.ts`、菜单加入 `menu.config.ts`（mock 自动回吐，无需改 mock）。

**⑧（可选）补 Mock**：在 `src/mock/handlers/` 新建 `order.ts` 仿照 `user.ts`，并在 `index.ts` 聚合：

```ts
// src/mock/handlers/index.ts
import { authHandlers } from './auth';
import { userHandlers } from './user';
import { orderHandlers } from './order'; // ← 新增
export const handlers = [...authHandlers, ...userHandlers, ...orderHandlers];
```

保存后浏览器热更新即可看到「订单管理」菜单和列表页。

---

## 九、脚手架脚本（scaffold）详解

生成项目内置的代码生成器，**在生成的项目里运行**（不是在 create-tindae-ui 仓库里）。基于 Handlebars 模板（`scripts/templates/*.hbs`）。

### 9.1 `pnpm scaffold:domain` — 创建新业务域

**交互输入：**

1. 域名（kebab-case，如 `order-management`）
2. 中文名（如「订单管理」）
3. 默认特性名（可选，回车则用域名）

**校验规则**（`scaffold-core/utils.ts`）：

- 必须匹配 `^[a-z][a-z0-9]*(-[a-z0-9]+)*$`：小写字母开头、只含小写字母/数字/连字符、不能以连字符开头或结尾。
- 长度 ≤ 50；中文名 ≤ 20。
- **保留字**会被拒：`src / pages / features / shared / components / utils / public / assets / test / node_modules / dist / build / .git / .vscode / __tests__ / coverage` 等。

**生成的目录结构：**

```text
src/pages/<domain>/
├── <domain>.routes.ts                       # 域路由（导出 <domain>Routes）
├── pages/
│   └── <Domain>List.page.vue                # 路由壳
├── features/<default-feature>/
│   ├── views/<Domain>List.view.vue          # 业务视图
│   ├── composables/use<Feature>List.ts      # 列表逻辑
│   ├── api/<feature>.api.ts                 # API（URL 占位，需改）
│   ├── models/<Feature>.ts + index.ts       # 数据模型
│   └── constants/index.ts
└── shared/{components,utils,assets}/        # 域内共享（空占位）
```

**生成后必须手动做**（再次强调）：

- 在 `src/core/bootstrap/router.ts` 接入 `<domain>Routes`；
- 在 `menu.config.ts` 加 `code`（mock 自动回吐），否则访问会 403。

### 9.2 `pnpm scaffold:feature` — 在现有域下创建新特性

**交互输入：**

1. 选择目标域（列出 `src/pages/` 下所有目录）；
2. 特性名（kebab-case）；
3. 特性中文名；
4. 是否创建页面（默认 yes）；
5. 是否添加侧边栏菜单（默认 yes）→ 选父级菜单 → 输入菜单标签。

**自动化处理（比 domain 智能）：**

| 动作                                                        | 是否自动     | 说明                                  |
| :---------------------------------------------------------- | :----------- | :------------------------------------ |
| 生成 feature 目录（views/composables/api/models/constants） | ✅           |                                       |
| 生成 `pages/<Feature>List.page.vue` 路由壳                  | ✅（选 yes） |                                       |
| **更新域路由** `<domain>.routes.ts` 追加新路由项            | ✅           | `route-manager.ts` 在数组末尾插入     |
| **更新菜单** `menu.config.ts` 追加菜单项（支持子级）        | ✅（选 yes） | `menu-manager.ts`                     |
| **Mock 菜单联动** 自动回吐 `menu.config.ts`                 | ✅（自动）   | 新页面自动有权限可见，无需手动改 mock |
| 更新域 `README.md`                                          | ✅           |                                       |

> 即：feature 脚手架帮你把「路由 + 菜单 + 权限」一条龙接好。所以**推荐工作流**是：`scaffold:domain` 建域骨架 → 手动接一次根路由 → 之后每个页面都用 `scaffold:feature`。

### 9.3 命名转换约定

| 输入                          | 转换结果                                       | 用在 |
| :---------------------------- | :--------------------------------------------- | :--- |
| `order-management`（kebab）   | 目录名、URL path、文件名前缀                   |      |
| → `orderManagement`（camel）  | 路由变量名 `orderManagementRoutes`、api 文件名 |      |
| → `OrderManagement`（Pascal） | 组件 `name`、类名 `Order`、路由 `name`         |      |

---

## 十、命令速查表

**生成项目内可用命令**（`my-project/package.json`）：

| 命令                    | 作用                                                        |
| :---------------------- | :---------------------------------------------------------- |
| `pnpm dev`              | 启动开发服务器（端口 3000，自动开浏览器）                   |
| `pnpm build`            | `vue-tsc --noEmit` 类型检查 + `vite build` 生产构建         |
| `pnpm preview`          | 预览生产构建产物                                            |
| `pnpm lint`             | ESLint 检查并修复 + Prettier 格式化 `src/**/*.{vue,ts,css}` |
| `pnpm test`             | `vitest run` 跑一次单测                                     |
| `pnpm test:watch`       | Vitest 监听模式                                             |
| `pnpm tokens:export`    | 从 `design.md` 导出 raw tokens，并生成项目内 Tailwind 适配文件 |
| `pnpm tokens:check`     | 校验导出结构、Tailwind 适配结果，以及 `design.md` 与 `lightTokens` 默认值一致性 |
| `pnpm scaffold`         | 显示脚手架帮助                                              |
| `pnpm scaffold:domain`  | 交互式创建业务域                                            |
| `pnpm scaffold:feature` | 交互式创建特性                                              |

> 模板**没有** `pnpm analyze`、`pnpm generate:api`、`npx tindae-ui upgrade` 等命令，请勿照旧文档找。

**create-tindae-ui 仓库自身命令**（改脚手架时用）：

| 命令              | 作用                                                     |
| :---------------- | :------------------------------------------------------- |
| `pnpm build`      | `tsc` 编译 `src/*.ts` → `dist/`（发布前必跑）            |
| `pnpm dev [name]` | `tsx` 直接跑 `bin/create-tindae-ui.ts`（开发脚手架本身） |
| `pnpm test`       | 跑 `tests/cli.test.ts`（CLI 参数解析单测）               |

---

## 十一、对接真实后端

模板默认全量 Mock。接真实接口时：

### 1. 加 Vite 代理（解决跨域）

当前 `vite.config.ts` 的 `server` 只有 `host/port/open`，**没有** proxy。开发时若后端在别的端口，需自行添加：

```ts
// vite.config.ts
server: {
  host: true,
  port: 3000,
  open: true,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',   // 你的后端地址
      changeOrigin: true,
      // 若后端不带 /api 前缀，取消下面这行
      // rewrite: (p) => p.replace(/^\/api/, ''),
    },
  },
},
```

### 2. （可选）用环境变量区分 baseURL

模板**没有**预置 `.env` 文件。需要区分环境时，可新建：

```bash
# .env.development
VITE_API_BASE_URL=/api

# .env.production
VITE_API_BASE_URL=https://api.example.com
```

然后把各 api 文件里的 `baseURL: '/api'` 改为 `baseURL: import.meta.env.VITE_API_BASE_URL`，并在 `env.d.ts` 补类型声明。

### 3. 关闭 Mock

- 临时关：把 `src/main.ts` 里的 `if (import.meta.env.DEV)` 分支直接改成 `setupApp()`；
- 生产构建天然不含 Mock（`import.meta.env.DEV` 为 false）。

### 4. 适配响应格式

模板统一约定 `{ code, data, message }` 且 `code === 0` 为成功。若你的后端用 HTTP 状态码或不同结构，需要：

- 调整 `core/http/interceptors.ts` 的解包逻辑（`unwrapBusinessEnvelope`），或经 `configureHttp()` 注入自定义转换；
- 调整 `authStore.fetchUser` 里 `res.code !== 0` 的判断，以及各 composable 中 `res.data` 的取值路径。

---

## 十二、常见问题 FAQ

**Q1：启动后访问任何页面都跳到 `/login`，登录后又跳 `/403`？**
A：典型的「权限码缺失」。Mock 登录后，用户权限 = `menu.config.ts`（mock 回吐）里各菜单的 `code` 集合。路由 `meta.code` 不在这个集合里就会 403。检查：菜单的 `code` / `routeName` 是否与路由 `name` 一致。

**Q2：用 `scaffold:domain` 建了新域，访问 404 / 菜单不出现？**
A：三个原因其一：① 没在 `src/core/bootstrap/router.ts` 接入域路由（404）；② 没在 `menu.config.ts` 加菜单（菜单不显示）；③ 菜单 `code` 与路由 `meta.code` 不一致（403）。见 [8.方式 A 的避坑](#方式-a用脚手架推荐30-秒)。

**Q3：改了路由 `name`，多页签 / keep-alive 失效？**
A：路由 `name` 必须与 `.page.vue` 里 `defineOptions({ name })` 一致，且建议用自动生成的 `ROUTE_NAMES` 常量。改完 `*.routes.ts` 后 `routeNames.ts` 会自动重新生成。

**Q4：`vxe-grid` 报错或样式错乱？**
A：确保已在 `core/plugins/vxeTable.ts` 正确初始化（模板已配好，勿删）。表格高度用 `height="auto"` 配合 `PageWrapper` 的 flex 布局自适应。

**Q5：MSW 没拦截请求，直接打到后端 / 报网络错误？**
A：① 确认在 dev 模式（`pnpm dev`）；② 确认 `public/mockServiceWorker.js` 存在；③ 未匹配的请求会被 `onUnhandledRequest: 'bypass'` 放行，所以「没拦到」时不会报错，只是走了真实网络——检查 handler 的 URL 是否带 `/api` 前缀。

**Q6：端口 3000 被占用？**
A：改 `vite.config.ts` 的 `server.port`，或启动时 `pnpm dev --port 3001`。

**Q7：登录密码为什么要 RSA 加密？能去掉吗？**
A：企业级项目防止明文传输密码。逻辑在 `pages/login/features/login/composables/useRsaEncrypt.ts`。若后端不要密文，在 `useLoginForm.ts` 里直接传 `formState.password` 即可。

**Q8：怎么加一个「不带布局」的全屏页（如大屏）？**
A：像 `login` / `error` 一样，把路由直接挂在顶层 `routes` 数组（不放进 `DefaultLayout` 的 `children`）。

---

## 十三、规范（提交 / 编码 / IDE）

### 提交规范（Conventional Commits）

```
type(scope): subject
```

合法 type：`feat / fix / refactor / docs / style / test / chore / perf / ci / build`

```bash
# ✅ 正确
git commit -m "feat(order): add order export feature"
git commit -m "fix(auth): handle token refresh race condition"

# ❌ 会被 commitlint 拦截
git commit -m "update code"
git commit -m "fix bug"
```

### 编码规范要点

- **强制 TypeScript**，杜绝隐式 any；接口 / 泛型严格约束。
- **不可变优先**：用 `{ ...obj, key: value }` 而非原地修改。
- **小文件优先**：单文件建议 200~400 行，勿超 800；按 feature 拆分。
- **`index.ts` 策略**：`models/` 允许用 `index.ts` re-export（类型编译后消失，无运行时风险）；`components/ / composables/ / api/` **不推荐**用 `index.ts`，显式路径防循环依赖。
- 状态优先级：**局部 `ref()` > 域内共享 > 全局 Pinia Store**。能用 `ref()` 解决就别上 Pinia。
- **跨域禁止直接 import**，通过 `router.push()`、下沉 `modules/`、全局 Store 三种方式交互。

### IDE 配置

VS Code 必装：① `Vue - Official (Volar)` ② `ESLint` ③ `Prettier`。模板已带 `.vscode/typescript.code-snippets`，开启「保存即格式化」。

---

## License

MIT
