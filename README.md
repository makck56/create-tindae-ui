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

> ⚠️ **重要澄清**：早期版本的 README 曾描述过「minimal / standard / full 三种预设」「统一请求层 `@/core/request`」「ProTable / ProForm / 字典系统」等内容。**当前模板（v1.0.0）并未包含这些**。本章节之后的所有内容都以**真实代码**为准，请以本文档为准，避免照着不存在的模块找代码。

**两个概念务必分清：**

| 概念 | 路径 | 作用 |
| :--- | :--- | :--- |
| **脚手架本身**（本仓库） | `bin/`、`src/`、`template/` | 一个 npm 包，用来「生成项目」 |
| **生成的项目**（你用脚手架建出来的） | `my-project/` | 一个 Vue 3 后台应用，你日常在这里写业务 |

本文档前四章讲「脚手架怎么用」，第五章起讲「生成的项目怎么用」。

---

## 二、技术栈

| 类别 | 技术 | 说明 |
| :--- | :--- | :--- |
| 框架 | Vue 3.5（Composition API + `<script setup>`） | |
| 语言 | TypeScript 5.5（strict 严格模式） | |
| 构建 | Vite 5.4 | 开发端口 **3000**，启动自动开浏览器 |
| 路由 | Vue Router 4.4 | 手动聚合（非自动发现） |
| 状态管理 | Pinia 2.2 | Setup Store 风格 |
| UI 库 | Ant Design Vue 3.2 | 按需自动导入（unplugin-vue-components） |
| 表格 | VXE Table 4.3（`vxe-grid`） | 列表页主力 |
| 图表 | ECharts 5.5 | |
| CSS | Tailwind CSS 3.4 + CSS Variables | |
| Mock | MSW 2.14 | 仅开发环境启用 |
| 测试 | Vitest 1.6 + Vue Test Utils 2.4 | |
| 代码规范 | ESLint 8.57 + Prettier 3.3 | |
| 提交规范 | Husky + Commitlint + lint-staged | |
| 加密 | JSEncrypt 3.5（RSA） | 登录密码加密 |

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

| 参数 | 说明 | 默认值 |
| :--- | :--- | :--- |
| `<project-name>` | 项目名称，必须匹配 `^[a-z0-9-]+$`（小写字母 / 数字 / 连字符） | 不传则交互式询问 |
| `--package-manager <pm>` | 包管理器，可选 `pnpm` / `npm` / `yarn` | `pnpm` |
| `--skip-install` | 跳过依赖安装 | `false` |
| `--no-install` | `--skip-install` 的别名 | `false` |
| `--skip-git` | 跳过 `git init` 与首次提交 | `false` |

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

| 层级 | 放什么 | 能引用谁 |
| :--- | :--- | :--- |
| **core** | 应用启动、插件初始化 | 被任何层使用 |
| **shared** | 无业务的通用工具、组件、常量 | 只能引用 core |
| **modules** | 跨域复用的业务模块（如 auth） | shared |
| **pages** | 具体业务功能 | modules、shared |

---

## 六、必须先理解的 6 个核心机制

### 6.1 Page vs View 分离（架构的灵魂）

每个业务页面拆成两个文件：

| 文件 | 角色 | 职责 | 禁止 |
| :--- | :--- | :--- | :--- |
| `XxxList.page.vue` | **路由壳**（极薄） | 作为 keep-alive 锚点、从 `$route` 取参数传给 View | ❌ 不写业务逻辑、❌ 不调 API |
| `XxxList.view.vue` | **业务核**（100% 功能） | 组合 composables、使用 components、处理交互/loading | |

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
import { errorRoutes } from '@/pages/error/error.routes';
import { userManagementRoutes } from '@/pages/user-management/user-management.routes';

const routes = [
  ...loginRoutes,
  ...errorRoutes,
  {
    path: '/',
    component: DefaultLayout,          // 带侧边栏的布局
    children: [
      { path: '', redirect: '/user-management' },
      ...userManagementRoutes,         // 业务页都挂在 DefaultLayout 下
    ],
  },
];
```

**什么是 `vite-plugin-route-names`？** 它扫描所有 `*.routes.ts`，自动生成 `src/shared/constants/routeNames.ts` 常量，避免你手写路由 `name` 拼错：

```ts
// 自动生成，请勿手改
export const ROUTE_NAMES = {
  UserManagement: {
    USER_MANAGEMENT: "UserManagement",
    ROLE_MANAGEMENT: "RoleManagement",
  },
} as const;
```

> 用法：在 `.page.vue` 里 `defineOptions({ name: ROUTE_NAMES.Xxx.YYY })`，路由 `name` 与之对应，多页签 / keep-alive 才能正常工作。

### 6.3 权限系统：路由守卫 + 菜单过滤

权限**完全由后端下发**。登录后调用 `GET /api/user/info`，返回：

```ts
{ code: 0, data: { user: UserInfo, menus: [{ code: 'UserManagement', name: '用户管理' }, ...] } }
```

`authStore` 把 `menus[].code` 收集进 `permissionCodes`（一个 `Set<string>`）。权限校验就是查这个 Set：

```ts
// src/modules/auth/stores/auth.ts
function hasPermission(code: string): boolean {
  return permissionCodes.value.has(code);
}
```

**三道防线：**

1. **路由守卫**（`router.ts` 的 `beforeEach`）：
   - 白名单 `/login`、`/403` 直接放行；
   - 未登录 → 跳 `/login`（带 `redirect`）；
   - `fetchUser` 失败 / `authStore.error` → 跳 `/403`；
   - 路由 `meta.code` 存在但 `hasPermission` 返回 false → 跳 `/403`。

2. **菜单过滤**（`Default.layout.vue`）：`filterMenu()` 按 `permissionCodes` 过滤侧边栏，无权限的菜单不显示。

3. **业务内判断**：在 `.view.vue` / composable 里调用 `authStore.hasPermission('XxxManagement')` 控制按钮显隐。

```ts
import { useAuthStore } from '@/modules/auth';
const authStore = useAuthStore();
if (authStore.hasPermission('UserManagement')) { /* ... */ }
```

> ⚠️ 模板当前**没有** `v-permission` 指令、没有细粒度按钮权限码体系、没有数据权限 / 字典权限。需要时按上面的 `hasPermission` 自行扩展。

### 6.4 认证流程（登录 / RSA / 验证码）

调用链：`Login.view.vue` → `useLoginForm` → `useRsaEncrypt`(RSA 加密密码) → `authStore.login()` → `POST /api/auth/login` → 成功后 `fetchUser()`。

```ts
// 真实登录参数（密码是 RSA 密文）
interface LoginParams {
  username: string;
  password: string;     // RSA 加密后的密文
  captchaCode: string;  // 图形验证码
}
```

**Mock 行为**（`src/mock/handlers/auth.ts`）：任意账号密码 + 验证码正确即放行，登录态用 `sessionStorage['mock-auth']='1'` 标记，刷新页面后仍保持登录（直到登出或关标签页）。

### 6.5 数据请求约定（重要）

> 当前模板**没有**「统一请求层 `@/core/request`」这种集中封装。每个业务 api 文件**各自** `axios.create()`。这是当前真实状态，本节如实说明。

**统一响应格式**（前后端约定）：

```ts
interface ApiResult<T> {
  code: number;            // 0 = 成功，非 0 = 业务错误
  data: T;
  message?: string;
}
```

**典型 api 文件写法**（参考 `features/user/api/user.api.ts`）：

```ts
import axios from 'axios';
import type { User, UserListParams, UserListResult } from '../models/User';

// 每个 feature 自建实例（baseURL 固定 /api）
const request = axios.create({ baseURL: '/api', timeout: 10000 });

export const getUserList = (params: UserListParams) =>
  request.get<{ code: number; data: UserListResult }>('/users', { params });

export const getUserDetail = (id: string) =>
  request.get<{ code: number; data: User }>(`/users/${id}`);

export const createUser = (data: Omit<User, 'id' | 'createdAt'>) =>
  request.post<{ code: number; data: User }>('/users', data);

export const updateUser = (id: string, data: Partial<User>) =>
  request.put<{ code: number; data: User }>(`/users/${id}`, data);

export const deleteUser = (id: string) =>
  request.delete<{ code: number }>(`/users/${id}`);
```

**调用约定：**

- **API 层**只发请求、返回数据，**禁止**做 UI 反馈（不要在 api 里 `message.error`）。
- **Composable 层**处理 `loading` / `error` 状态、UI 反馈（成功 / 失败提示）。
- **View 层**只组合 composables 和组件，**不直接** `axios.get`。
- 统一从 `res.data.code === 0` 判断成功。

> 💡 想要集中式请求层？可以新建 `src/core/request/` 封装单例 axios + 拦截器（处理 token、401 跳登录、错误提示），再让各 api 复用。这是后续可演进方向，但**当前模板未提供**，请勿照着旧 README 找 `@/core/request`。

### 6.6 Mock：MSW 仅开发环境

入口在 `src/main.ts`：

```ts
if (import.meta.env.DEV) {
  import('@/mock/browser').then(({ worker }) => {
    worker.start({ onUnhandledRequest: 'bypass' }).then(setupApp);  // 未匹配的请求放行
  });
} else {
  setupApp();  // 生产构建不含 Mock
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
  { type: 'input',  label: '用户名', name: 'name',
    fieldProps: { placeholder: '请输入用户名', allowClear: true } },
  { type: 'select', label: '状态', name: 'status',
    fieldProps: { options: UserStatusOptions, allowClear: true, style: { width: '120px' } } },
  { type: 'select', label: '角色', name: 'role',
    fieldProps: { options: UserRoleOptions, allowClear: true, style: { width: '120px' } } },
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

start();           // 请求开始
const data = await fetchData();
stop();            // 请求结束
// spinning 绑定到 <a-spin :spinning="spinning" />
```

### 7.4 `CrossPageSelect` — 跨页选择

用于「跨分页批量选择行」场景，导出 `useCrossPageSelect` / `useCrossPageGrid` / `CrossPageSelectBanner` 等（见 `src/shared/components/cross-page-select/README.md`）。

### 7.5 `COPY` — 全站文案常量

所有界面文案集中管理，方便后续做 i18n。定义在 `src/shared/constants/copy.ts`：

```ts
export const COPY = {
  COMMON: { CONFIRM: '确认', CANCEL: '取消', CREATE: '新建', EDIT: '编辑',
            DELETE: '删除', SEARCH: '搜索', RESET: '重置',
            SUCCESS: '操作成功', FAILED: '操作失败' },
  LOGIN:  { /* ... */ },
} as const;

// 使用
import { COPY } from '@/shared/constants/copy';
message.success(COPY.COMMON.SUCCESS);
```

### 7.6 `ROUTE_NAMES` — 路由名常量

见 [6.2](#62-路由系统手动聚合--名称常量)，自动生成，配合 `defineOptions({ name })` 使用。

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

2. **不会自动配权限 / Mock**：`scaffold:domain` **不会**自动往 `menu.config.ts` 和 `mock/handlers/auth.ts` 里加 `code`。结果：登录用户的权限码里没有 `OrderManagement` → 访问 `/order-management` 会**直接跳 403**。手动补两处：
   ```ts
   // src/modules/app/config/menu.config.ts 末尾追加
   { label: '订单管理', code: 'OrderManagement', routeName: 'OrderManagement' },

   // src/mock/handlers/auth.ts 的 MOCK_MENUS 追加
   { code: 'OrderManagement', name: '订单管理' },
   ```
   > 而 `scaffold:feature` **会**自动处理菜单和 mock 权限（见第九节）。所以更省心的姿势是：用 domain 建骨架 + 手动接路由，再用 feature 建具体页面。

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
export interface OrderListResult { list: Order[]; total: number; }
```

**② API**（`features/order/api/order.api.ts`）

```ts
import axios from 'axios';
import type { Order, OrderListParams, OrderListResult } from '../models/Order';

const request = axios.create({ baseURL: '/api', timeout: 10000 });

export const getOrderList = (params: OrderListParams) =>
  request.get<{ code: number; data: OrderListResult }>('/orders', { params });

export const deleteOrder = (id: string) =>
  request.delete<{ code: number }>(`/orders/${id}`);
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
  const filters = ref({ orderNo: undefined as string | undefined,
                        status: undefined as OrderStatus | undefined });
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
          const { data: res } = await getOrderList({
            page: page.currentPage, pageSize: page.pageSize, ...filters.value,
          });
          return res.data;   // 返回 { list, total }
        },
      },
    },
  });

  function handleSearch() { gridRef.value?.commitProxy('query'); }
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
  { type: 'input', label: '订单号', name: 'orderNo',
    fieldProps: { placeholder: '请输入', allowClear: true } },
  { type: 'select', label: '状态', name: 'status',
    fieldProps: { options: OrderStatusOptions, allowClear: true, style: { width: '120px' } } },
];
</script>

<template>
  <PageWrapper>
    <template #search>
      <QueryFilter v-model:value="filters" :config="filterConfig"
                   @search="handleSearch" @reset="handleSearch" />
    </template>

    <vxe-grid ref="gridRef" v-bind="gridOptions" border height="auto">
      <template #status_default="{ row }">
        <a-tag>{{ OrderStatusOptions.find(o => o.value === row.status)?.label ?? row.status }}</a-tag>
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

**⑦ 接路由 + 配权限**：回到 [方式 A 的避坑 1、2](#方式-a用脚手架推荐30-秒)，把路由加入 `router.ts`、菜单加入 `menu.config.ts`、Mock 权限加入 `auth.ts`。

**⑧（可选）补 Mock**：在 `src/mock/handlers/` 新建 `order.ts` 仿照 `user.ts`，并在 `index.ts` 聚合：

```ts
// src/mock/handlers/index.ts
import { authHandlers } from './auth';
import { userHandlers } from './user';
import { orderHandlers } from './order';   // ← 新增
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
- 在 `menu.config.ts` + `mock/handlers/auth.ts` 加 `code`，否则访问会 403。

### 9.2 `pnpm scaffold:feature` — 在现有域下创建新特性

**交互输入：**

1. 选择目标域（列出 `src/pages/` 下所有目录）；
2. 特性名（kebab-case）；
3. 特性中文名；
4. 是否创建页面（默认 yes）；
5. 是否添加侧边栏菜单（默认 yes）→ 选父级菜单 → 输入菜单标签。

**自动化处理（比 domain 智能）：**

| 动作 | 是否自动 | 说明 |
| :--- | :--- | :--- |
| 生成 feature 目录（views/composables/api/models/constants） | ✅ | |
| 生成 `pages/<Feature>List.page.vue` 路由壳 | ✅（选 yes） | |
| **更新域路由** `<domain>.routes.ts` 追加新路由项 | ✅ | `route-manager.ts` 在数组末尾插入 |
| **更新菜单** `menu.config.ts` 追加菜单项（支持子级） | ✅（选 yes） | `menu-manager.ts` |
| **更新 Mock 权限** `mock/handlers/auth.ts` 的 `MOCK_MENUS` | ✅（选 yes） | 保证新页面有权限可见 |
| 更新域 `README.md` | ✅ | |

> 即：feature 脚手架帮你把「路由 + 菜单 + 权限」一条龙接好。所以**推荐工作流**是：`scaffold:domain` 建域骨架 → 手动接一次根路由 → 之后每个页面都用 `scaffold:feature`。

### 9.3 命名转换约定

| 输入 | 转换结果 | 用在 |
| :--- | :--- | :--- |
| `order-management`（kebab） | 目录名、URL path、文件名前缀 | |
| → `orderManagement`（camel） | 路由变量名 `orderManagementRoutes`、api 文件名 | |
| → `OrderManagement`（Pascal） | 组件 `name`、类名 `Order`、路由 `name` | |

---

## 十、命令速查表

**生成项目内可用命令**（`my-project/package.json`）：

| 命令 | 作用 |
| :--- | :--- |
| `pnpm dev` | 启动开发服务器（端口 3000，自动开浏览器） |
| `pnpm build` | `vue-tsc --noEmit` 类型检查 + `vite build` 生产构建 |
| `pnpm preview` | 预览生产构建产物 |
| `pnpm lint` | ESLint 检查并修复 + Prettier 格式化 `src/**/*.{vue,ts,css}` |
| `pnpm test` | `vitest run` 跑一次单测 |
| `pnpm test:watch` | Vitest 监听模式 |
| `pnpm scaffold` | 显示脚手架帮助 |
| `pnpm scaffold:domain` | 交互式创建业务域 |
| `pnpm scaffold:feature` | 交互式创建特性 |

> 模板**没有** `pnpm analyze`、`pnpm generate:api`、`npx tindae-ui upgrade` 等命令，请勿照旧文档找。

**create-tindae-ui 仓库自身命令**（改脚手架时用）：

| 命令 | 作用 |
| :--- | :--- |
| `pnpm build` | `tsc` 编译 `src/*.ts` → `dist/`（发布前必跑） |
| `pnpm dev [name]` | `tsx` 直接跑 `bin/create-tindae-ui.ts`（开发脚手架本身） |
| `pnpm test` | 跑 `tests/cli.test.ts`（CLI 参数解析单测） |

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

- 调整 `authStore.fetchUser` 里 `res.code !== 0` 的判断；
- 在各 composable 里调整 `res.data` 的取值路径；
- 或（推荐）封一层 `core/request` 统一转换。

---

## 十二、常见问题 FAQ

**Q1：启动后访问任何页面都跳到 `/login`，登录后又跳 `/403`？**
A：典型的「权限码缺失」。Mock 登录后，用户权限 = `mock/handlers/auth.ts` 里 `MOCK_MENUS` 的 `code` 集合。路由 `meta.code` 不在这个集合里就会 403。检查：菜单的 `code` / `routeName` 是否与路由 `name`、Mock `code` 三者一致。

**Q2：用 `scaffold:domain` 建了新域，访问 404 / 菜单不出现？**
A：三个原因其一：① 没在 `src/core/bootstrap/router.ts` 接入域路由（404）；② 没在 `menu.config.ts` 加菜单（菜单不显示）；③ 没在 `mock/handlers/auth.ts` 的 `MOCK_MENUS` 加 `code`（403）。见 [8.方式 A 的避坑](#方式-a用脚手架推荐30-秒)。

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
