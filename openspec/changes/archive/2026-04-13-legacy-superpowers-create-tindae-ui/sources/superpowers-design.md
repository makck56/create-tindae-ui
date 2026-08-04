# create-tindae-ui 脚手架设计规范

**版本**: 1.0
**日期**: 2026-04-13
**状态**: 待评审

---

## 1. 概述

`create-tindae-ui` 是一个类似 `pnpm create vite` 的项目脚手架 CLI 工具，用于一键生成基于 tindae-ui 架构体系的 Vue 3 企业级前端项目。

**核心定位**：固定技术栈，零选项，开箱即用。

---

## 2. 技术栈（全部固定，不可选）

| 类别 | 依赖 | 版本 |
|:---|:---|:---|
| 框架 | Vue 3 (Composition API) | ^3.x |
| 构建 | Vite | ^5.x |
| 语言 | TypeScript (strict mode) | ^5.x |
| UI 库 | ant-design-vue | ^3.x |
| 表格 | vxe-table | ^4.x |
| 图表 | echarts | ^5.x |
| CSS | Tailwind CSS | ^3.x |
| 路由 | Vue Router | ^4.x |
| 状态管理 | Pinia | ^2.x |
| 代码规范 | ESLint 8 + Prettier | ^8.x |
| 测试 | Vitest + @vue/test-utils | ^1.x |

---

## 3. CLI 行为

### 3.1 使用方式

```bash
pnpm create tindae-ui <project-name>
# 或
npx create-tindae-ui <project-name>
```

### 3.2 交互流程

```bash
$ pnpm create tindae-ui my-project

✨ Scaffolding tindae-ui project in ./my-project...

   ├── Copying template...
   ├── Installing dependencies via pnpm...
   └── Initializing git repository...

✅ Done! Next steps:

  cd my-project
  pnpm dev
```

### 3.3 行为规则

1. 如果目标目录已存在且非空，提示用户确认是否覆盖
2. 如果未传项目名，提示输入（交互式）
3. 拷贝完成后自动执行 `pnpm install`
4. 拷贝完成后自动执行 `git init`

---

## 4. 包结构

```
create-tindae-ui/
├── bin/
│   └── create-tindae-ui.ts       # CLI 入口
├── src/
│   ├── cli.ts                    # 参数解析 + 目录校验
│   ├── generator.ts              # 模板拷贝 + git init + pnpm install
│   └── utils/
│       ├── fs.ts                 # 文件操作（拷贝、删除、写入）
│       └── pkg.ts                # package.json 读写
├── template/                     # 完整基线模板（可独立运行的项目）
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── env.d.ts
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .eslintrc.cjs
│   ├── .prettierrc.json
│   ├── vitest.config.ts
│   ├── .gitignore
│   ├── docs/
│   │   ├── ARCHITECTURE.md
│   │   ├── CODING_STANDARDS.md
│   │   └── MIGRATION.md
│   └── src/
│       ├── main.ts
│       ├── App.vue
│       ├── assets/
│       │   └── styles/
│       │       ├── tailwind.css
│       │       ├── variables.css
│       │       └── global.css
│       ├── core/
│       │   ├── plugins/
│       │   │   ├── antd.ts
│       │   │   ├── echarts.ts
│       │   │   └── vxeTable.ts
│       │   └── types/
│       │       └── global.d.ts
│       ├── shared/
│       │   ├── ui-kit/
│       │   │   ├── styles/
│       │   │   └── composables/
│       │   ├── constants/
│       │   │   └── copy.ts
│       │   └── utils/
│       ├── modules/
│       │   └── .gitkeep
│       ├── layouts/
│       │   └── Default.layout.vue
│       ├── pages/
│       │   └── demo/             # 示例 domain（见第 5 节）
│       ├── router/
│       │   └── index.ts
│       ├── stores/
│       │   └── app.ts
│       └── types/
│           └── index.ts
├── package.json
└── tsconfig.json
```

---

## 5. Demo Domain 示例

示例 domain 为"用户管理"，展示列表页 + 详情页的标准写法。

### 5.1 文件结构

```
src/pages/user-management/
├── pages/
│   ├── UserList.page.vue               # 路由壳
│   └── UserDetail.page.vue             # 路由壳
├── features/
│   └── user/
│       ├── views/
│       │   ├── UserList.view.vue        # vxe-table 用户列表 + antd Form 筛选
│       │   └── UserDetail.view.vue      # antd Descriptions 用户详情展示
│       ├── components/
│       │   └── list/
│       │       └── UserFilter.vue       # 筛选条件组件（用户名/状态/角色）
│       ├── composables/
│       │   ├── useUser.ts              # 用户列表查询/详情获取逻辑
│       │   └── useUser.spec.ts         # Vitest 示例测试
│       ├── api/
│       │   └── user.api.ts             # API 定义 + mock 数据
│       └── models/
│           ├── User.ts                 # User 实体 + DTO 类型（PascalCase，导出 interface）
│           └── index.ts                # re-export
├── shared/
│   └── .gitkeep
└── userManagement.routes.ts            # 路由定义
```

### 5.2 设计要点

- API 层直接调用后端接口，假设后端提供标准 RESTful API。示例：

```typescript
// api/user.api.ts
import type { User, UserListParams, UserListResult } from '../models/User';
import axios from 'axios';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export const getUserList = (params: UserListParams) => {
  return request.get<UserListResult>('/users', { params });
};

export const getUserDetail = (id: string) => {
  return request.get<User>(`/users/${id}`);
};

export const createUser = (data: Omit<User, 'id'>) => {
  return request.post<User>('/users', data);
};

export const updateUser = (id: string, data: Partial<User>) => {
  return request.put<User>(`/users/${id}`, data);
};

export const deleteUser = (id: string) => {
  return request.delete(`/users/${id}`);
};
```

假设后端接口规范：
- `GET /api/users` — 用户列表（支持 name/status 分页筛选）
- `GET /api/users/:id` — 用户详情
- `POST /api/users` — 创建用户
- `PUT /api/users/:id` — 更新用户
- `DELETE /api/users/:id` — 删除用户
- `UserList.view.vue` 使用 vxe-table 展示用户列表、antd Form 做筛选、Tailwind 做布局
- `UserDetail.view.vue` 使用 antd Descriptions 组件展示用户详情
- 状态管理仅使用 composable（`useUser.ts`），不在 demo 中使用 Pinia，保持示例简洁
- 包含 Vitest 示例测试文件 `useUser.spec.ts`

---

## 6. 关键文件内容设计

### 6.0 stores/app.ts

```typescript
// 全局应用状态示例（Pinia Setup Store）
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false);

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  return { sidebarCollapsed, toggleSidebar };
});
```

### 6.1 main.ts

```typescript
import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import { setupRouter } from './router';
import { setupAntd } from './core/plugins/antd';
import { setupEcharts } from './core/plugins/echarts';
import { setupVxeTable } from './core/plugins/vxeTable';
import './assets/styles/tailwind.css';
import './assets/styles/global.css';

const app = createApp(App);

app.use(createPinia());
setupAntd(app);
setupEcharts(app);
setupVxeTable(app);
setupRouter(app);

app.mount('#app');
```

### 6.2 Tailwind 配置

```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  corePlugins: {
    preflight: false, // 禁用 base reset，避免与 antd 冲突
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### 6.3 Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
```

### 6.4 App.vue

```vue
<template>
  <a-config-provider>
    <router-view />
  </a-config-provider>
</template>
```

---

## 7. 实现方案

采用**方案 A：基础模板拷贝**。

由于无可选特性，实现极简：

1. `template/` 目录就是完整可运行项目
2. CLI 只做：参数解析 → 目录校验 → 递归拷贝模板 → 替换 `package.json` 中的 `name` 字段 → `pnpm install` → `git init`
3. 无需条件裁剪逻辑、无需 EJS 渲染

### 7.1 技术选型

| 工具 | 用途 |
|:---|:---|
| TypeScript | CLI 自身语言 |
| process.argv + prompts | 参数解析 + 交互式输入项目名 |
| fs.cp (Node 18+) | 递归拷贝模板目录 |

### 7.2 发布方式

- 内部团队使用，发布到企业私有 npm registry
- 包名：`create-tindae-ui`
- 通过 `pnpm create tindae-ui` 或 `npx create-tindae-ui` 调用

---

## 8. 成功标准

1. 执行 `pnpm create tindae-ui my-app` 后，`my-app/` 目录可直接 `pnpm dev` 运行
2. demo domain 的列表页和详情页可正常访问和交互
3. ESLint + Prettier 可通过 `pnpm lint` 执行
4. Vitest 可通过 `pnpm test` 执行
5. Tailwind utility class 正常生效
6. antd 组件样式无异常（preflight 已禁用）
7. 完整架构文档（ARCHITECTURE.md / CODING_STANDARDS.md）随项目生成
