# Auth + Permission Menu System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement permission-based menu filtering and route guarding for the Vue 3 template project, with auth module, menu config, route guard, and 403 page.

**Architecture:** Backend returns user info + menu permission list with `code` field. Auth store fetches and caches permissions as a `Set<string>`. Route guard checks `meta.code` against this set. Layout filters the full menu config to only show permitted items. App store migrates from `src/stores/` into `modules/app/stores/`.

**Tech Stack:** Vue 3, Pinia, Vue Router 4, ant-design-vue 3, TypeScript, axios

---

## File Map

### New Files (create)

| File | Purpose |
|:---|:---|
| `template/src/modules/app/config/menuTypes.ts` | MenuItem / MenuConfig 类型定义 |
| `template/src/modules/app/config/menu.config.ts` | 全量菜单配置 |
| `template/src/modules/app/stores/app.ts` | app store（从 src/stores/app.ts 迁移） |
| `template/src/modules/auth/models/Auth.ts` | UserInfo / MenuPermission / AuthData 类型 |
| `template/src/modules/auth/api/auth.api.ts` | 查询用户信息接口 |
| `template/src/modules/auth/stores/auth.ts` | auth store（用户信息、权限码、fetchUser） |
| `template/src/modules/auth/index.ts` | 模块导出 |
| `template/src/pages/error/pages/Forbidden.page.vue` | 403 页面 |

### Modified Files

| File | Change |
|:---|:---|
| `template/src/core/types/global.d.ts` | 追加 RouteMeta.code 类型扩展 |
| `template/src/layouts/Default.layout.vue` | 重写菜单渲染，使用 filterMenu + 递归组件 |
| `template/src/router/index.ts` | 添加 meta.code、403 路由、beforeEach 守卫 |

### Deleted Files

| File | Reason |
|:---|:---|
| `template/src/stores/app.ts` | 迁移至 modules/app/stores/app.ts |
| `template/src/modules/.gitkeep` | modules 目录已有内容 |

---

### Task 1: Migrate app store to modules/app

**Files:**
- Create: `template/src/modules/app/stores/app.ts`
- Delete: `template/src/stores/app.ts`
- Delete: `template/src/modules/.gitkeep`

- [ ] **Step 1: Create `template/src/modules/app/stores/app.ts`**

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const appName = ref('Tindae UI');
  const sidebarCollapsed = ref(false);

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  return { appName, sidebarCollapsed, toggleSidebar };
});
```

- [ ] **Step 2: Delete old files**

```bash
rm template/src/stores/app.ts
rm template/src/stores/ 2>/dev/null; true
rm template/src/modules/.gitkeep
```

Note: If `src/stores/` has other files, only delete `app.ts`. Remove the directory only if empty.

- [ ] **Step 3: Update imports in `template/src/layouts/Default.layout.vue`**

Change the import path from `@/stores/app` to `@/modules/app/stores/app`:

```
old: import { useAppStore } from '@/stores/app';
new: import { useAppStore } from '@/modules/app/stores/app';
```

This is a placeholder step — the full layout rewrite happens in Task 6, but the import must be fixed now so the project doesn't break between commits.

- [ ] **Step 4: Commit**

```bash
cd /home/code/create-tindae-ui && git add -A && git commit -m "refactor: migrate app store from src/stores/ to modules/app/stores/"
```

---

### Task 2: Create menu types and config

**Files:**
- Create: `template/src/modules/app/config/menuTypes.ts`
- Create: `template/src/modules/app/config/menu.config.ts`

- [ ] **Step 1: Create `template/src/modules/app/config/menuTypes.ts`**

```typescript
export interface MenuItem {
  label: string;
  code?: string;
  routeName?: string;
  children?: MenuItem[];
}

export type MenuConfig = MenuItem[];
```

- [ ] **Step 2: Create `template/src/modules/app/config/menu.config.ts`**

当前模板没有 `routeNames.ts`（由 autoRoutesPlugin 从 `.routes.ts` 生成），所以菜单配置暂时使用字符串字面量作为 routeName。等 `.routes.ts` 文件创建后可切换为 `ROUTE_NAMES` 常量。

```typescript
import type { MenuConfig } from './menuTypes';

export const menuConfig: MenuConfig = [
  {
    label: '用户管理',
    code: 'user-management',
    routeName: 'UserManagement',
  },
];
```

- [ ] **Step 3: Commit**

```bash
cd /home/code/create-tindae-ui && git add -A && git commit -m "feat: add menu types and config in modules/app/config/"
```

---

### Task 3: Create auth module (types + API + store)

**Files:**
- Create: `template/src/modules/auth/models/Auth.ts`
- Create: `template/src/modules/auth/api/auth.api.ts`
- Create: `template/src/modules/auth/stores/auth.ts`
- Create: `template/src/modules/auth/index.ts`

- [ ] **Step 1: Create `template/src/modules/auth/models/Auth.ts`**

```typescript
export interface UserInfo {
  id: string;
  username: string;
  avatar?: string;
}

export interface MenuPermission {
  code: string;
  name: string;
}

export interface AuthData {
  user: UserInfo;
  menus: MenuPermission[];
}
```

- [ ] **Step 2: Create `template/src/modules/auth/api/auth.api.ts`**

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

- [ ] **Step 3: Create `template/src/modules/auth/stores/auth.ts`**

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getUserInfo } from '../api/auth.api';
import type { UserInfo } from '../models/Auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserInfo | null>(null);
  const permissionCodes = ref<Set<string>>(new Set());
  const loading = ref(false);
  const error = ref<string | null>(null);
  const initialized = ref(false);

  async function fetchUser() {
    if (initialized.value) return;
    loading.value = true;
    error.value = null;
    try {
      const { data: response } = await getUserInfo();
      if (response.data.code !== 0) {
        throw new Error(`接口返回错误: ${response.data.code}`);
      }
      const { user: userInfo, menus } = response.data.data;
      user.value = userInfo;
      permissionCodes.value = new Set(menus.map((m) => m.code));
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

- [ ] **Step 4: Create `template/src/modules/auth/index.ts`**

```typescript
export { useAuthStore } from './stores/auth';
export type { UserInfo, MenuPermission, AuthData } from './models/Auth';
```

- [ ] **Step 5: Commit**

```bash
cd /home/code/create-tindae-ui && git add -A && git commit -m "feat: add auth module (models, api, store)"
```

---

### Task 4: Add RouteMeta type extension

**Files:**
- Modify: `template/src/core/types/global.d.ts`

- [ ] **Step 1: Update `template/src/core/types/global.d.ts`**

Replace the entire file:

```typescript
export {};

declare global {
  // Global type augmentations go here
}

declare module 'vue-router' {
  interface RouteMeta {
    code?: string;
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd /home/code/create-tindae-ui && git add -A && git commit -m "feat: add RouteMeta.code type extension for permission checking"
```

---

### Task 5: Create 403 page

**Files:**
- Create: `template/src/pages/error/pages/Forbidden.page.vue`

- [ ] **Step 1: Create `template/src/pages/error/pages/Forbidden.page.vue`**

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router';

defineOptions({ name: 'Forbidden' });

const router = useRouter();

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/');
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <a-result status="403" title="403" sub-title="抱歉，您没有权限访问此页面">
      <template #extra>
        <a-button type="primary" @click="goBack">返回</a-button>
      </template>
    </a-result>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
cd /home/code/create-tindae-ui && git add -A && git commit -m "feat: add 403 Forbidden page"
```

---

### Task 6: Update router with meta.code, 403 route, and route guard

**Files:**
- Modify: `template/src/router/index.ts`

- [ ] **Step 1: Rewrite `template/src/router/index.ts`**

```typescript
import type { App } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import DefaultLayout from '@/layouts/Default.layout.vue';
import { useAuthStore } from '@/modules/auth/stores/auth';

const WHITE_LIST = ['/403'];

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        redirect: '/user-management',
      },
      {
        path: '/user-management',
        name: 'UserManagement',
        meta: { code: 'user-management' },
        component: () => import('@/pages/user-management/pages/UserList.page.vue'),
      },
      {
        path: '/user-management/:id',
        name: 'UserManagementDetail',
        meta: { code: 'user-management' },
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

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (WHITE_LIST.includes(to.path)) return true;

  if (!authStore.initialized) {
    await authStore.fetchUser();
  }

  if (authStore.error) {
    return '/403';
  }

  if (!to.meta.code) return true;

  if (!authStore.hasPermission(to.meta.code)) {
    return '/403';
  }
});

export function setupRouter(app: App): void {
  app.use(router);
}
```

- [ ] **Step 2: Commit**

```bash
cd /home/code/create-tindae-ui && git add -A && git commit -m "feat: add route guard with permission checking and 403 route"
```

---

### Task 7: Rewrite Default.layout.vue with menu rendering and permission filtering

**Files:**
- Modify: `template/src/layouts/Default.layout.vue`

- [ ] **Step 1: Rewrite `template/src/layouts/Default.layout.vue`**

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue';
import { useAppStore } from '@/modules/app/stores/app';
import { useAuthStore } from '@/modules/auth/stores/auth';
import { menuConfig } from '@/modules/app/config/menu.config';
import type { MenuItem } from '@/modules/app/config/menuTypes';

defineOptions({ name: 'DefaultLayout' });

const appStore = useAppStore();
const authStore = useAuthStore();
const router = useRouter();

function filterMenu(items: MenuItem[]): MenuItem[] {
  return items
    .filter((item) => !item.code || authStore.permissionCodes.has(item.code))
    .map((item) =>
      item.children ? { ...item, children: filterMenu(item.children) } : item,
    )
    .filter((item) => !item.children || item.children.length > 0);
}

const filteredMenu = computed(() => filterMenu(menuConfig));

function handleMenuClick({ key }: { key: string }) {
  router.push({ name: key });
}
</script>

<template>
  <a-layout class="min-h-screen">
    <a-layout-sider v-model:collapsed="appStore.sidebarCollapsed" collapsible :width="220">
      <div class="p-4 text-white text-center font-bold text-lg">{{ appStore.appName }}</div>
      <a-menu theme="dark" mode="inline" @click="handleMenuClick">
        <template v-for="item in filteredMenu" :key="item.routeName ?? item.label">
          <a-menu-item v-if="!item.children" :key="item.routeName">
            {{ item.label }}
          </a-menu-item>
          <a-sub-menu v-else :key="item.label" :title="item.label">
            <a-menu-item v-for="child in item.children" :key="child.routeName">
              {{ child.label }}
            </a-menu-item>
          </a-sub-menu>
        </template>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="bg-white px-4 flex items-center justify-between shadow-sm">
        <a-button type="text" @click="appStore.toggleSidebar">
          <template #icon>
            <MenuFoldOutlined v-if="!appStore.sidebarCollapsed" />
            <MenuUnfoldOutlined v-else />
          </template>
        </a-button>
      </a-layout-header>
      <a-layout-content class="m-4 p-4 bg-white rounded">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
```

- [ ] **Step 2: Commit**

```bash
cd /home/code/create-tindae-ui && git add -A && git commit -m "feat: rewrite Default layout with permission-based menu filtering"
```

---

### Task 8: Update vite.config.ts with menu-visualizer

**Files:**
- Modify: `template/vite.config.ts`

- [ ] **Step 1: Update `template/vite.config.ts`**

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { autoRoutesPlugin, menuVisualizerPlugin } from '@internal/build-tools';

export default defineConfig({
  plugins: [
    vue(),
    autoRoutesPlugin(),
    menuVisualizerPlugin({
      viewsPath: 'src/pages',
      menuConfigPath: 'src/modules/app/config/menu.config.ts',
      routeNamesPath: 'src/shared/constants/routeNames.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

- [ ] **Step 2: Commit**

```bash
cd /home/code/create-tindae-ui && git add -A && git commit -m "feat: register menu-visualizer plugin in vite config"
```

---

### Task 9: Verify template compiles

- [ ] **Step 1: Verify TypeScript compiles**

```bash
cd /home/code/create-tindae-ui/template && npx vue-tsc --noEmit
```

Expected: No type errors. Note: this may fail if `@internal/build-tools` isn't built. If so, run `pnpm --filter @internal/build-tools build` first, or just verify the new files have no obvious type issues by reading them.

- [ ] **Step 2: Verify no broken imports**

Search for any remaining references to the old `@/stores/app` path:

```bash
grep -r "@/stores/app" template/src/
```

Expected: No results. All references should use `@/modules/app/stores/app`.

- [ ] **Step 3: Final commit if any fixes needed**

```bash
cd /home/code/create-tindae-ui && git add -A && git commit -m "fix: resolve any issues found during verification"
```
