# 权限菜单系统设计规范

**版本**: 2.0（基于菜单系统 v1.0 扩展）
**日期**: 2026-04-14
**状态**: 待评审

---

## 1. 概述

在配置文件驱动的菜单系统基础上，增加基于后端权限的菜单过滤和路由守卫。后端接口返回用户信息及可访问菜单列表（含 `code` 字段），前端通过 `code` 与路由 `meta.code` 匹配，实现菜单过滤和路由拦截。包含 403 无权限页面，不包含登录流程。

---

## 2. 文件结构

```
src/
├── modules/
│   ├── app/
│   │   ├── config/
│   │   │   ├── menu.config.ts      # 全量菜单配置（含 code 字段）
│   │   │   └── menuTypes.ts        # 菜单类型定义
│   │   └── stores/
│   │       └── app.ts              # app store（appName, sidebar）
│   └── auth/
│       ├── api/
│       │   └── auth.api.ts         # 查询用户信息接口
│       ├── models/
│       │   └── Auth.ts             # UserInfo / MenuPermission 类型
│       ├── stores/
│       │   └── auth.ts             # auth store
│       └── index.ts                # 模块导出
├── pages/error/pages/
│   └── Forbidden.page.vue          # 403 页面
├── layouts/
│   └── Default.layout.vue          # 菜单渲染（权限过滤）
├── router/
│   └── index.ts                    # 路由守卫 + 403 路由
└── shared/constants/
    └── routeNames.ts               # 自动生成的路由名称常量（已存在）
```

模块专属 store 放在各自模块的 `stores/` 目录内。

### 迁移说明

现有 `src/stores/app.ts`（含 `appName`, `sidebarCollapsed`, `toggleSidebar`）迁移至 `src/modules/app/stores/app.ts`，内容不变，仅移动位置。迁移后删除 `src/stores/` 目录。`Default.layout.vue` 的导入路径从 `@/stores/app` 改为 `@/modules/app/stores/app`。

---

## 3. 类型定义

### 3.1 菜单类型 — `modules/app/config/menuTypes.ts`

```typescript
export interface MenuItem {
  label: string;
  code?: string;           // 权限码，匹配路由 meta.code
  routeName?: string;      // 路由名，用于 router.push + antd menu key + KeepAlive
  children?: MenuItem[];   // 子菜单，支持无限嵌套
}

export type MenuConfig = MenuItem[];
```

### 3.2 Auth 类型 — `modules/auth/models/Auth.ts`

```typescript
export interface UserInfo {
  id: string;
  username: string;
  avatar?: string;
}

export interface MenuPermission {
  code: string;   // 权限码，与路由 meta.code 对应
  name: string;
}

export interface AuthData {
  user: UserInfo;
  menus: MenuPermission[];
}
```

### 3.3 路由 Meta 扩展 — `src/core/types/global.d.ts`

追加到现有的 `global.d.ts` 文件中：

```typescript
declare module 'vue-router' {
  interface RouteMeta {
    code?: string;  // 权限码，匹配后端返回的 menus[].code
  }
}
```

---

## 4. 菜单配置 — `modules/app/config/menu.config.ts`

```typescript
import type { MenuConfig } from './menuTypes';
import { ROUTE_NAMES } from '@/shared/constants/routeNames';

export const menuConfig: MenuConfig = [
  {
    label: '用户管理',
    code: 'user-management',
    routeName: ROUTE_NAMES.UserManagement,
  },
];
```

> **前置条件**：`ROUTE_NAMES` 由 `autoRoutesPlugin` 从 `*.routes.ts` 文件自动生成。当前模板的路由定义在 `router/index.ts` 中，需要为每个页面创建对应的 `.routes.ts` 文件，例如 `src/pages/user-management/user-management.routes.ts`，插件才能生成 `routeNames.ts`。

---

## 5. Auth 模块

### 5.1 API — `modules/auth/api/auth.api.ts`

```typescript
import axios from 'axios';
import type { AuthData } from '../models/Auth';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export const getUserInfo = () => {
  return request.get<{ code: number; data: AuthData }>('/user/info');
};
```

### 5.2 Store — `modules/auth/stores/auth.ts`

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getUserInfo } from '../api/auth.api';
import type { UserInfo, MenuPermission } from '../models/Auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserInfo | null>(null);
  const permissionCodes = ref<Set<string>>(new Set());
  const loading = ref(false);
  const error = ref<string | null>(null);
  const initialized = ref(false); // 标记是否已尝试获取，防止失败后无限重试

  async function fetchUser() {
    if (initialized.value) return; // 已尝试过，不重复请求
    loading.value = true;
    error.value = null;
    try {
      const { data: response } = await getUserInfo();
      if (response.data.code !== 0) {
        throw new Error(`接口返回错误: ${response.data.code}`);
      }
      const { user: userInfo, menus } = response.data.data;
      user.value = userInfo;
      permissionCodes.value = new Set(menus.map(m => m.code));
    } catch (e: any) {
      error.value = e.message || '获取用户信息失败';
    } finally {
      loading.value = false;
      initialized.value = true;
    }
  }

  function hasPermission(code: string): boolean {
    return permissionCodes.value.has(code);
  }

  return { user, permissionCodes, loading, error, initialized, fetchUser, hasPermission };
});
```

### 5.3 模块导出 — `modules/auth/index.ts`

```typescript
export { useAuthStore } from './stores/auth';
export type { UserInfo, MenuPermission, AuthData } from './models/Auth';
```

---

## 6. 路由守卫 — `router/index.ts`

```typescript
// 白名单路由：不需要权限校验
const WHITE_LIST = ['/403'];

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  // 白名单路由直接放行
  if (WHITE_LIST.includes(to.path)) return true;

  // 未初始化时调用 fetchUser
  if (!authStore.initialized) {
    await authStore.fetchUser();
  }

  // 获取用户信息失败（网络错误、接口异常）
  if (authStore.error) {
    // 未获取到用户信息，无法判断权限，跳 403
    return '/403';
  }

  // 没有 meta.code 的路由放行（如首页重定向）
  if (!to.meta.code) return true;

  // 校验权限
  if (!authStore.hasPermission(to.meta.code)) {
    return '/403';
  }
});
```

路由配置示例：

```typescript
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      { path: '', redirect: '/user-management' },
      {
        path: '/user-management',
        name: 'UserManagement',
        meta: { code: 'user-management' },
        component: () => import('@/pages/user-management/pages/UserList.page.vue'),
      },
      {
        path: '/user-management/:id',
        name: 'UserManagementDetail',
        meta: { code: 'user-management' }, // 复用同一权限码
        component: () => import('@/pages/user-management/pages/UserDetail.page.vue'),
      },
      {
        path: '/403',
        name: 'Forbidden',
        component: () => import('@/pages/error/pages/Forbidden.page.vue'),
      },
    ],
  },
];
```

---

## 7. 菜单渲染 — `Default.layout.vue`

改造现有的 `Default.layout.vue`：

1. 从 `menu.config.ts` 导入 `menuConfig`
2. 从 auth store 获取 `permissionCodes`
3. 用 `filterMenu` 过滤无权限的菜单项
4. 递归渲染 `<a-menu-item>` 和 `<a-sub-menu>`

### 过滤规则

```typescript
function filterMenu(items: MenuItem[]): MenuItem[] {
  return items
    .filter(item => !item.code || authStore.permissionCodes.has(item.code))
    .map(item => item.children
      ? { ...item, children: filterMenu(item.children) }
      : item
    )
    .filter(item => !item.children || item.children.length > 0);
}
```

| 条件 | 处理 |
|:---|:---|
| 有 `children` | `<a-sub-menu>` 递归渲染，子项全部无权限则隐藏父菜单 |
| 有 `routeName`，无 `children` | `<a-menu-item>`，点击 `router.push({ name: item.routeName })` |
| 无 `code` | 不做权限过滤，直接显示 |
| 有 `code` 但无权限 | 跳过，不渲染 |

---

## 8. 403 页面 — `pages/error/pages/Forbidden.page.vue`

使用 antd `Result` 组件展示 403 提示，提供返回按钮。不使用固定 `/` 路径跳转，改为跳转到第一个有权限的菜单路由，避免无权限时形成重定向循环。

```vue
<template>
  <a-result status="403" title="403" sub-title="抱歉，您没有权限访问此页面">
    <template #extra>
      <a-button type="primary" @click="goBack">返回</a-button>
    </template>
  </a-result>
</template>
```

```typescript
// 返回逻辑：有历史记录则 router.back()，否则跳转第一个有权限的菜单路由
function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    // 从过滤后的菜单中取第一个可用的 routeName
    const firstRoute = filteredMenu.value.find(item => item.routeName);
    if (firstRoute?.routeName) {
      router.push({ name: firstRoute.routeName });
    }
  }
}
```

---

## 9. 数据流总结

```
应用启动
  │
  ▼
路由守卫 beforeEach
  │
  ├─ 白名单路由（/403）？ ──▶ 放行
  │
  ├─ 未初始化？ ──▶ fetchUser()（仅执行一次，失败不重试）
  │                   │
  │                   ├─ 成功 ──▶ 存储 user + permissionCodes
  │                   └─ 失败 ──▶ 设置 error，跳转 /403
  │
  ├─ authStore.error 存在？ ──▶ 跳转 /403
  │
  ├─ to.meta.code 不存在？ ──▶ 放行
  │
  └─ hasPermission(code)？ ── 否 ──▶ 跳转 /403
                              │
                             是 ──▶ 放行
  │
  ▼
Layout 渲染菜单
  │
  └─ filterMenu(menuConfig, permissionCodes) ──▶ 只渲染有权限的菜单项
```

---

## 10. menu-visualizer 集成

在 `vite.config.ts` 中注册（与之前设计一致，路径已更新）：

```typescript
menuVisualizerPlugin({
  viewsPath: 'src/pages',
  menuConfigPath: 'src/modules/app/config/menu.config.ts',
  routeNamesPath: 'src/shared/constants/routeNames.ts',
}),
```
