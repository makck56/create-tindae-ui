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

模块专属 store 放在各自模块的 `stores/` 目录内，`src/stores/` 目录不再需要。

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

### 3.3 路由 Meta 扩展

```typescript
// 全局类型扩展
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

  async function fetchUser() {
    loading.value = true;
    try {
      const { data } = await getUserInfo();
      user.value = data.data.user;
      permissionCodes.value = new Set(data.data.menus.map(m => m.code));
    } finally {
      loading.value = false;
    }
  }

  return { user, permissionCodes, loading, fetchUser };
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
router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  // 403 页面直接放行
  if (to.path === '/403') return true;

  // 未获取用户信息时调用 fetchUser
  if (!authStore.user) {
    await authStore.fetchUser();
  }

  // 没有 meta.code 的路由放行（如首页重定向）
  if (!to.meta.code) return true;

  // 校验权限
  if (!authStore.permissionCodes.has(to.meta.code)) {
    return '/403';
  }
});
```

路由配置示例：

```typescript
{
  path: '/user-management',
  name: 'UserManagement',
  meta: { code: 'user-management' },
  component: () => import('@/pages/user-management/pages/UserList.page.vue'),
}
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

使用 antd `Result` 组件展示 403 提示，提供返回首页按钮。

```vue
<template>
  <a-result status="403" title="403" sub-title="抱歉，您没有权限访问此页面">
    <template #extra>
      <a-button type="primary" @click="router.push('/')">返回首页</a-button>
    </template>
  </a-result>
</template>
```

---

## 9. 数据流总结

```
应用启动
  │
  ▼
路由守卫 beforeEach
  │
  ├─ 已有用户信息？── 否 ──▶ fetchUser() ──▶ 存储 user + permissionCodes
  │
  ├─ to.meta.code 不存在？ ──▶ 放行
  │
  └─ permissionCodes.has(code)？ ── 否 ──▶ 跳转 /403
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
