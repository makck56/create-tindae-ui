# Keep-Alive + 标签页功能 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 DefaultLayout 内的页面添加 Keep-Alive 缓存和多标签页切换，通过 `meta.keepAlive` 控制，可通过不调用 `setupTab` 整体禁用。

**Architecture:** Tab Store (Pinia) 管理打开的标签列表和缓存组件名称列表。`<KeepAlive :include>` 驱动缓存。`setupTab(router)` 在 store 内注册 `afterEach` hook，router.ts 不感知 tab 功能。

**Tech Stack:** Vue 3, Pinia, vue-router, Ant Design Vue (a-tabs)

---

## File Structure

| 文件 | 职责 | 变更 |
|---|---|---|
| `src/layouts/stores/tab.ts` | Tab store + `useTabStore` + `setupTab` | 新建 |
| `src/layouts/Default.layout.vue` | 加 KeepAlive 包裹 + 内联标签栏 | 修改 |
| `src/core/types/global.d.ts` | RouteMeta 加 `keepAlive` / `title` | 修改 |
| `src/core/bootstrap/index.ts` | 调用 `setupTab(router)` | 修改 |
| `src/pages/user-management/user-management.routes.ts` | 加 `meta.keepAlive` / `meta.title` 示例 | 修改 |

---

### Task 1: Route Meta 类型扩展

**Files:**
- Modify: `src/core/types/global.d.ts`

- [ ] **Step 1: 在 RouteMeta 中添加 keepAlive 和 title 字段**

```ts
export {};

declare module 'vue' {
  function defineRender(fn: () => JSX.Element): void;
}

declare global {
  // Global type augmentations go here
}

declare module 'vue-router' {
  interface RouteMeta {
    code?: string;
    keepAlive?: boolean;
    title?: string;
  }
}
```

- [ ] **Step 2: 验证类型无报错**

Run: `cd template && npx vue-tsc --noEmit 2>&1 | head -20`
Expected: 无新增报错

- [ ] **Step 3: Commit**

```bash
git add src/core/types/global.d.ts
git commit -m "feat: add keepAlive and title to RouteMeta"
```

---

### Task 2: Tab Store + setupTab

**Files:**
- Create: `src/layouts/stores/tab.ts`

- [ ] **Step 1: 创建 Tab Store**

```ts
import { defineStore } from 'pinia';
import { nextTick } from 'vue';
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router';

export interface TabItem {
  name: string;
  path: string;
  title: string;
  keepAlive: boolean;
}

export const useTabStore = defineStore('tab', {
  state: (): {
    tabs: TabItem[];
    activeTab: string;
    _excludeCache: Set<string>;
  } => ({
    tabs: [],
    activeTab: '',
    _excludeCache: new Set(),
  }),

  getters: {
    cachedNames(state): string[] {
      return state.tabs
        .filter((tab) => tab.keepAlive && !state._excludeCache.has(tab.name))
        .map((tab) => tab.name);
    },
  },

  actions: {
    addTab(route: RouteLocationNormalizedLoaded) {
      if (typeof route.name !== 'string') return;

      const existing = this.tabs.find((t) => t.name === route.name);
      if (!existing) {
        this.tabs.push({
          name: route.name,
          path: route.fullPath,
          title: (route.meta.title as string) || route.name,
          keepAlive: route.meta.keepAlive === true,
        });
      } else {
        existing.path = route.fullPath;
      }

      this.activeTab = route.name;
    },

    closeTab(name: string, router: Router) {
      const index = this.tabs.findIndex((t) => t.name === name);
      if (index === -1) return;

      this.tabs.splice(index, 1);

      if (this.activeTab === name) {
        const target = this.tabs[Math.min(index, this.tabs.length - 1)];
        if (target) {
          this.activeTab = target.name;
          router.push(target.path);
        }
      }
    },

    closeOtherTabs(name: string) {
      this.tabs = this.tabs.filter((t) => t.name === name);
      this.activeTab = name;
    },

    closeAllTabs(router: Router) {
      this.tabs = [];
      router.push('/');
    },

    async refreshTab(name: string) {
      this._excludeCache.add(name);
      await nextTick();
      this._excludeCache.delete(name);
    },
  },
});

export function setupTab(router: Router): void {
  const store = useTabStore();

  router.afterEach((to) => {
    if (typeof to.name === 'string' && to.meta.title) {
      store.addTab(to);
    }
  });
}
```

**关键设计说明：**
- `cachedNames` 返回所有未被 `_excludeCache` 排除的 tab name，KeepAlive 依据此列表缓存
- `refreshTab` 通过临时加入 `_excludeCache` 让 KeepAlive 销毁缓存，nextTick 后移除
- `closeTab` 接收 router 参数做跳转，store 不持有 router 引用
- `afterEach` 只处理有 `meta.title` 的路由（即 DefaultLayout 子路由），login/error 不受影响

- [ ] **Step 2: 验证类型无报错**

Run: `cd template && npx vue-tsc --noEmit 2>&1 | head -20`
Expected: 无新增报错

- [ ] **Step 3: Commit**

```bash
git add src/layouts/stores/tab.ts
git commit -m "feat: add Tab store with setupTab"
```

---

### Task 3: Bootstrap 集成 setupTab

**Files:**
- Modify: `src/core/bootstrap/index.ts`

- [ ] **Step 1: 在 bootstrap 中调用 setupTab**

在 `setupRouter(app)` 之后添加 `setupTab(router)` 调用：

```ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from '@/App.vue';
import { setupRouter, router } from './router';
import '@/core/plugins/antd';
import { setupEcharts } from '@/core/plugins/echarts';
import { setupVxeTable } from '@/core/plugins/vxeTable';
import { setupTab } from '@/layouts/stores/tab';
import '@/assets/styles/tailwind.css';
import '@/assets/styles/global.css';

export { router } from './router';

export function setupApp() {
  const app = createApp(App);

  // 1. Core plugins (Pinia must precede Router)
  app.use(createPinia());
  setupRouter(app);

  // 2. Tab (must be after Pinia + Router)
  setupTab(router);

  // 3. UI libraries
  setupEcharts(app);
  setupVxeTable(app);

  app.mount('#app');
}
```

**注意：** `setupTab` 必须在 `createPinia()` 和 `setupRouter` 之后调用，因为 store 依赖 Pinia，`afterEach` 依赖 router。`import { router } from './router'` 确保 router 实例可用。

- [ ] **Step 2: 验证编译通过**

Run: `cd template && npx vue-tsc --noEmit 2>&1 | head -20`
Expected: 无新增报错

- [ ] **Step 3: Commit**

```bash
git add src/core/bootstrap/index.ts
git commit -m "feat: integrate setupTab in bootstrap"
```

---

### Task 4: DefaultLayout 集成 KeepAlive + TabBar 占位

**Files:**
- Modify: `src/layouts/Default.layout.vue`

- [ ] **Step 1: 改造 DefaultLayout，加 KeepAlive 包裹和 TabBar**

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { ReloadOutlined } from '@ant-design/icons-vue';
import { MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined } from '@ant-design/icons-vue';
import { useAppStore } from '@/modules/app/stores/app';
import { useAuthStore } from '@/modules/auth/stores/auth';
import { useTabStore } from '@/layouts/stores/tab';
import { menuConfig } from '@/modules/app/config/menu.config';
import type { MenuItem } from '@/modules/app/config/menuTypes';

defineOptions({ name: 'DefaultLayout' });

const appStore = useAppStore();
const authStore = useAuthStore();
const tabStore = useTabStore();
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

async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}

function handleTabClick(key: string) {
  const tab = tabStore.tabs.find((t) => t.name === key);
  if (tab) router.push(tab.path);
}

function handleTabClose(key: string) {
  tabStore.closeTab(key, router);
}

async function handleRefresh() {
  await tabStore.refreshTab(tabStore.activeTab);
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
        <div class="flex items-center gap-4">
          <span v-if="authStore.user" class="text-gray-600">{{ authStore.user.username }}</span>
          <a-button type="text" @click="handleLogout">
            <template #icon><LogoutOutlined /></template>
            登出
          </a-button>
        </div>
      </a-layout-header>
      <div v-if="tabStore.tabs.length" class="bg-white border-b px-2 flex items-center">
        <a-tabs
          type="editable-card"
          hide-add
          :active-key="tabStore.activeTab"
          @change="handleTabClick"
          @edit="(key, action) => action === 'remove' && handleTabClose(key as string)"
          class="flex-1"
        >
          <a-tab-pane v-for="tab in tabStore.tabs" :key="tab.name" :tab="tab.title" :closable="tabStore.tabs.length > 1" />
        </a-tabs>
        <a-tooltip title="刷新当前页">
          <a-button type="text" size="small" @click="handleRefresh">
            <template #icon><ReloadOutlined /></template>
          </a-button>
        </a-tooltip>
      </div>
      <a-layout-content class="m-4 p-4 bg-white rounded">
        <router-view v-slot="{ Component }">
          <keep-alive :include="tabStore.cachedNames">
            <component :is="Component" :key="$route.fullPath" />
          </keep-alive>
        </router-view>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
```

**改动要点：**
- `<router-view>` 改为 scoped slot + `<keep-alive :include="tabStore.cachedNames">` 包裹
- header 和 content 之间插入 `a-tabs` 标签栏 + 刷新按钮
- `a-tabs` 使用 `editable-card` 类型，自带关闭按钮
- 只剩一个 tab 时 `:closable="false"` 隐藏关闭按钮
- `ReloadOutlined` 图标用于刷新按钮

- [ ] **Step 2: 验证编译通过**

Run: `cd template && npx vue-tsc --noEmit 2>&1 | head -20`
Expected: 无新增报错

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Default.layout.vue
git commit -m "feat: integrate KeepAlive and TabBar in DefaultLayout"
```

---

### Task 5: 路由配置添加 meta.title 和 meta.keepAlive 示例

**Files:**
- Modify: `src/pages/user-management/user-management.routes.ts`

- [ ] **Step 1: 为 user-management 路由添加 meta.title 和 meta.keepAlive**

```ts
import type { RouteRecordRaw } from 'vue-router';

export const userManagementRoutes: RouteRecordRaw[] = [
  {
    path: '/user-management',
    name: 'UserManagement',
    meta: { code: 'UserManagement', title: '用户管理', keepAlive: true },
    component: () => import('./pages/UserList.page.vue'),
  },
];
```

**说明：** `meta.title` 是 tab 进入 DefaultLayout 子路由的门槛——`setupTab` 的 `afterEach` 只处理有 `title` 的路由。`keepAlive: true` 让该页面被 KeepAlive 缓存。

- [ ] **Step 2: 验证功能**

Run: `cd template && pnpm dev`

测试步骤：
1. 登录后进入用户管理页面
2. 观察标签栏出现「用户管理」tab
3. 滚动表格到中间位置
4. 点击菜单进入其他页面（如有），再切回用户管理
5. 确认滚动位置保持不变（缓存生效）
6. 点击刷新按钮，确认页面重新加载
7. 关闭 tab，确认页面跳转且缓存销毁

- [ ] **Step 3: Commit**

```bash
git add src/pages/user-management/user-management.routes.ts
git commit -m "feat: add keepAlive and title meta to user-management route"
```
