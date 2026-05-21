# 标签页右键菜单 & 自定义标签列表 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 替换 antd `a-tabs` 为自定义胶囊标签列表，新增右键菜单（刷新/关闭/关闭左侧/关闭右侧/关闭其他），支持同路由多标签页和基于访问顺序的关闭导航。

**Architecture:** Store 层改造 `TabItem` 以 `route.path` 为唯一键，新增 `visitedOrder` 追踪访问历史。组件层去掉 `a-tabs`，用自定义横向标签列表 + `a-dropdown` 右键菜单替代。`cachedNames` getter 不变，KeepAlive 兼容。

**Tech Stack:** Vue 3 + Pinia + Ant Design Vue (`a-dropdown`) + Vitest + TypeScript

---

### Task 1: Store 类型与状态改造

**Files:**
- Modify: `src/layouts/tab/tab.ts`
- Create: `src/layouts/tab/tab.spec.ts`

- [ ] **Step 1: 编写 addTab 使用 route.path 作为 key 的测试**

```typescript
// src/layouts/tab/tab.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTabStore } from './tab';
import type { RouteLocationNormalizedLoaded } from 'vue-router';

function mockRoute(overrides: Partial<RouteLocationNormalizedLoaded> & { name: string; path: string }): RouteLocationNormalizedLoaded {
  return {
    fullPath: overrides.path,
    hash: '',
    matched: [],
    meta: overrides.meta ?? { title: overrides.name },
    name: overrides.name,
    params: overrides.params ?? {},
    path: overrides.path,
    query: overrides.query ?? {},
    redirectedFrom: null,
    fullPath: overrides.fullPath ?? overrides.path,
  } as RouteLocationNormalizedLoaded;
}

const router = { push: vi.fn() };

beforeEach(() => {
  setActivePinia(createPinia());
  router.push.mockClear();
});

describe('useTabStore — key as route.path', () => {
  it('addTab uses route.path as key', () => {
    const store = useTabStore();
    const route = mockRoute({ name: 'UserDetail', path: '/user/123' });
    store.addTab(route);
    expect(store.tabs[0].key).toBe('/user/123');
    expect(store.tabs[0].name).toBe('UserDetail');
  });

  it('same route name different path creates separate tabs', () => {
    const store = useTabStore();
    store.addTab(mockRoute({ name: 'UserDetail', path: '/user/1' }));
    store.addTab(mockRoute({ name: 'UserDetail', path: '/user/2' }));
    expect(store.tabs).toHaveLength(2);
    expect(store.tabs[0].key).toBe('/user/1');
    expect(store.tabs[1].key).toBe('/user/2');
  });

  it('same path does not duplicate tab', () => {
    const store = useTabStore();
    store.addTab(mockRoute({ name: 'Home', path: '/home' }));
    store.addTab(mockRoute({ name: 'Home', path: '/home' }));
    expect(store.tabs).toHaveLength(1);
  });

  it('title uses _tabTitle query param when present', () => {
    const store = useTabStore();
    const route = mockRoute({
      name: 'OrderDetail',
      path: '/order/123',
      query: { _tabTitle: '订单 #123 详情' },
      meta: { title: '订单详情' },
    });
    store.addTab(route);
    expect(store.tabs[0].title).toBe('订单 #123 详情');
  });

  it('title falls back to meta.title', () => {
    const store = useTabStore();
    store.addTab(mockRoute({ name: 'Home', path: '/home', meta: { title: '首页' } }));
    expect(store.tabs[0].title).toBe('首页');
  });

  it('title falls back to route.name', () => {
    const store = useTabStore();
    store.addTab(mockRoute({ name: 'Home', path: '/home', meta: {} }));
    expect(store.tabs[0].title).toBe('Home');
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `cd template && npx vitest run src/layouts/tab/tab.spec.ts`
Expected: FAIL — TabItem 没有 key 字段，addTab 逻辑未改

- [ ] **Step 3: 实现 TabItem 接口和 addTab 改造**

将 `src/layouts/tab/tab.ts` 替换为：

```typescript
import { defineStore } from 'pinia';
import { nextTick } from 'vue';
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router';

export interface TabItem {
  key: string;
  name: string;
  path: string;
  title: string;
  keepAlive: boolean;
}

export const useTabStore = defineStore('tab', {
  state: (): {
    tabs: TabItem[];
    activeTab: string;
    _excludeCache: string[];
    visitedOrder: string[];
  } => ({
    tabs: [],
    activeTab: '',
    _excludeCache: [],
    visitedOrder: [],
  }),

  getters: {
    cachedNames(state): string[] {
      return state.tabs
        .filter((tab) => tab.keepAlive && !state._excludeCache.includes(tab.name))
        .map((tab) => tab.name);
    },
    activeKeepAlive(): boolean {
      return this.tabs.find((t) => t.key === this.activeTab)?.keepAlive ?? false;
    },
  },

  actions: {
    addTab(route: RouteLocationNormalizedLoaded) {
      if (typeof route.name !== 'string') return;

      const key = route.path;
      const existing = this.tabs.find((t) => t.key === key);
      if (!existing) {
        this.tabs.push({
          key,
          name: route.name,
          path: route.fullPath,
          title: (route.query._tabTitle as string) || (route.meta.title as string) || route.name,
          keepAlive: route.meta.keepAlive === true,
        });
      } else {
        existing.path = route.fullPath;
      }

      this.activeTab = key;
      this.visitedOrder = this.visitedOrder.filter((k) => k !== key);
      this.visitedOrder.push(key);
    },

    closeTab(key: string, router: Router) {
      const index = this.tabs.findIndex((t) => t.key === key);
      if (index === -1) return;

      this.tabs.splice(index, 1);
      this.visitedOrder = this.visitedOrder.filter((k) => k !== key);

      if (this.activeTab === key) {
        let targetKey: string | undefined;
        for (let i = this.visitedOrder.length - 1; i >= 0; i--) {
          if (this.tabs.some((t) => t.key === this.visitedOrder[i])) {
            targetKey = this.visitedOrder[i];
            break;
          }
        }
        if (targetKey) {
          const target = this.tabs.find((t) => t.key === targetKey)!;
          this.activeTab = targetKey;
          router.push(target.path);
        } else {
          router.push('/');
        }
      }
    },

    closeLeftTabs(key: string, router: Router) {
      const index = this.tabs.findIndex((t) => t.key === key);
      if (index === -1) return;
      const removed = this.tabs.splice(0, index);
      const removedKeys = new Set(removed.map((t) => t.key));
      this.visitedOrder = this.visitedOrder.filter((k) => !removedKeys.has(k));
      this.activeTab = key;
      const tab = this.tabs.find((t) => t.key === key)!;
      router.push(tab.path);
    },

    closeRightTabs(key: string, router: Router) {
      const index = this.tabs.findIndex((t) => t.key === key);
      if (index === -1) return;
      const removed = this.tabs.splice(index + 1);
      const removedKeys = new Set(removed.map((t) => t.key));
      this.visitedOrder = this.visitedOrder.filter((k) => !removedKeys.has(k));
      this.activeTab = key;
      const tab = this.tabs.find((t) => t.key === key)!;
      router.push(tab.path);
    },

    closeOtherTabs(key: string) {
      this.tabs = this.tabs.filter((t) => t.key === key);
      this.visitedOrder = this.visitedOrder.filter((k) => k === key);
      this.activeTab = key;
    },

    closeAllTabs(router: Router) {
      this.tabs = [];
      this.visitedOrder = [];
      router.push('/');
    },

    async refreshTab(key: string) {
      const tab = this.tabs.find((t) => t.key === key);
      if (!tab) return;
      this._excludeCache.push(tab.name);
      await nextTick();
      this._excludeCache = this._excludeCache.filter((n) => n !== tab.name);
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

- [ ] **Step 4: 运行测试，确认通过**

Run: `cd template && npx vitest run src/layouts/tab/tab.spec.ts`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add src/layouts/tab/tab.ts src/layouts/tab/tab.spec.ts
git commit -m "refactor: change tab key from route.name to route.path"
```

---

### Task 2: Store 关闭与导航测试

**Files:**
- Modify: `src/layouts/tab/tab.spec.ts`

- [ ] **Step 1: 编写 closeTab/closeLeftTabs/closeRightTabs/closeOtherTabs 测试**

在 `src/layouts/tab/tab.spec.ts` 末尾追加：

```typescript
describe('useTabStore — closeTab visitedOrder navigation', () => {
  it('closeTab navigates to previously visited tab', () => {
    const store = useTabStore();
    store.addTab(mockRoute({ name: 'Home', path: '/home' }));
    store.addTab(mockRoute({ name: 'User', path: '/user' }));
    store.addTab(mockRoute({ name: 'Order', path: '/order' }));
    // visitedOrder: ['/home', '/user', '/order']
    // active: '/order'

    store.closeTab('/order', router);
    expect(store.activeTab).toBe('/user');
    expect(router.push).toHaveBeenCalledWith('/user');
  });

  it('closeTab skips removed tabs in visitedOrder', () => {
    const store = useTabStore();
    store.addTab(mockRoute({ name: 'Home', path: '/home' }));
    store.addTab(mockRoute({ name: 'User', path: '/user' }));
    store.addTab(mockRoute({ name: 'Order', path: '/order' }));
    // Close '/user' first
    store.closeTab('/user', router);
    // visitedOrder: ['/home', '/order']
    // active: '/home'

    // Re-add '/user' and navigate to '/order'
    store.addTab(mockRoute({ name: 'User', path: '/user' }));
    store.addTab(mockRoute({ name: 'Order', path: '/order' }));
    // visitedOrder: ['/home', '/user', '/order']

    store.closeTab('/order', router);
    expect(store.activeTab).toBe('/user');
  });

  it('closeTab falls back to / when no tabs remain', () => {
    const store = useTabStore();
    store.addTab(mockRoute({ name: 'Home', path: '/home' }));
    store.closeTab('/home', router);
    expect(router.push).toHaveBeenCalledWith('/');
  });

  it('closeLeftTabs removes tabs to the left', () => {
    const store = useTabStore();
    store.addTab(mockRoute({ name: 'Home', path: '/home' }));
    store.addTab(mockRoute({ name: 'User', path: '/user' }));
    store.addTab(mockRoute({ name: 'Order', path: '/order' }));

    store.closeLeftTabs('/order', router);
    expect(store.tabs).toHaveLength(1);
    expect(store.tabs[0].key).toBe('/order');
    expect(store.activeTab).toBe('/order');
    expect(store.visitedOrder).toEqual(['/order']);
  });

  it('closeRightTabs removes tabs to the right', () => {
    const store = useTabStore();
    store.addTab(mockRoute({ name: 'Home', path: '/home' }));
    store.addTab(mockRoute({ name: 'User', path: '/user' }));
    store.addTab(mockRoute({ name: 'Order', path: '/order' }));

    store.closeRightTabs('/home', router);
    expect(store.tabs).toHaveLength(1);
    expect(store.tabs[0].key).toBe('/home');
    expect(store.activeTab).toBe('/home');
    expect(store.visitedOrder).toEqual(['/home']);
  });

  it('closeOtherTabs keeps only the target', () => {
    const store = useTabStore();
    store.addTab(mockRoute({ name: 'Home', path: '/home' }));
    store.addTab(mockRoute({ name: 'User', path: '/user' }));
    store.addTab(mockRoute({ name: 'Order', path: '/order' }));

    store.closeOtherTabs('/user');
    expect(store.tabs).toHaveLength(1);
    expect(store.tabs[0].key).toBe('/user');
    expect(store.activeTab).toBe('/user');
    expect(store.visitedOrder).toEqual(['/user']);
  });

  it('closeAllTabs clears everything', () => {
    const store = useTabStore();
    store.addTab(mockRoute({ name: 'Home', path: '/home' }));
    store.addTab(mockRoute({ name: 'User', path: '/user' }));

    store.closeAllTabs(router);
    expect(store.tabs).toHaveLength(0);
    expect(store.visitedOrder).toHaveLength(0);
    expect(router.push).toHaveBeenCalledWith('/');
  });
});

describe('useTabStore — refreshTab', () => {
  it('refreshTab excludes and restores cache by name', async () => {
    const store = useTabStore();
    store.addTab(mockRoute({ name: 'Home', path: '/home', meta: { title: '首页', keepAlive: true } }));

    expect(store.cachedNames).toContain('Home');
    await store.refreshTab('/home');
    expect(store.cachedNames).toContain('Home');
  });
});
```

- [ ] **Step 2: 运行测试**

Run: `cd template && npx vitest run src/layouts/tab/tab.spec.ts`
Expected: PASS

- [ ] **Step 3: 提交**

```bash
git add src/layouts/tab/tab.spec.ts
git commit -m "test: add close/navigation tests for tab store"
```

---

### Task 3: TabBar 组件 — 自定义标签列表 + 右键菜单

**Files:**
- Modify: `src/layouts/tab/TabBar.vue`

- [ ] **Step 1: 替换 TabBar.vue 为自定义标签列表**

将 `src/layouts/tab/TabBar.vue` 替换为：

```vue
<script setup lang="ts">
import { computed } from 'vue';
import {
  ReloadOutlined,
  CloseOutlined,
} from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import { useTabStore } from './tab';

defineOptions({ name: 'TabBar' });

const tabStore = useTabStore();
const router = useRouter();

function handleTabClick(key: string) {
  if (key !== tabStore.activeTab) {
    const tab = tabStore.tabs.find((t) => t.key === key);
    if (tab) router.push(tab.path);
  }
}

function handleClose(key: string, e?: MouseEvent) {
  e?.stopPropagation();
  tabStore.closeTab(key, router);
}

function handleRefresh(key: string) {
  tabStore.refreshTab(key);
}

function handleCloseLeft(key: string) {
  tabStore.closeLeftTabs(key, router);
}

function handleCloseRight(key: string) {
  tabStore.closeRightTabs(key, router);
}

function handleCloseOthers(key: string) {
  tabStore.closeOtherTabs(key);
}

function getMenuDisabled(key: string) {
  const index = tabStore.tabs.findIndex((t) => t.key === key);
  const tab = tabStore.tabs.find((t) => t.key === key);
  return {
    refresh: !tab?.keepAlive,
    close: tabStore.tabs.length <= 1,
    closeLeft: index <= 0,
    closeRight: index === -1 || index >= tabStore.tabs.length - 1,
    closeOthers: tabStore.tabs.length <= 1,
  };
}
</script>

<template>
  <div v-if="tabStore.tabs.length > 0" class="tab-bar">
    <div class="tab-bar__list">
      <a-dropdown
        v-for="tab in tabStore.tabs"
        :key="tab.key"
        :trigger="['contextmenu']"
      >
        <div
          class="tab-bar__tag"
          :class="{ 'tab-bar__tag--active': tab.key === tabStore.activeTab }"
          @click="handleTabClick(tab.key)"
        >
          <span class="tab-bar__title">{{ tab.title }}</span>
          <CloseOutlined
            v-if="tabStore.tabs.length > 1"
            class="tab-bar__close"
            @click="handleClose(tab.key, $event)"
          />
        </div>
        <template #overlay>
          <a-menu>
            <a-menu-item
              key="refresh"
              :disabled="getMenuDisabled(tab.key).refresh"
              @click="handleRefresh(tab.key)"
            >
              <ReloadOutlined />
              <span style="margin-left: 8px">刷新</span>
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item
              key="close"
              :disabled="getMenuDisabled(tab.key).close"
              @click="handleClose(tab.key)"
            >
              <CloseOutlined />
              <span style="margin-left: 8px">关闭</span>
            </a-menu-item>
            <a-menu-item
              key="closeLeft"
              :disabled="getMenuDisabled(tab.key).closeLeft"
              @click="handleCloseLeft(tab.key)"
            >
              <span style="margin-left: 24px">关闭左侧</span>
            </a-menu-item>
            <a-menu-item
              key="closeRight"
              :disabled="getMenuDisabled(tab.key).closeRight"
              @click="handleCloseRight(tab.key)"
            >
              <span style="margin-left: 24px">关闭右侧</span>
            </a-menu-item>
            <a-menu-item
              key="closeOthers"
              :disabled="getMenuDisabled(tab.key).closeOthers"
              @click="handleCloseOthers(tab.key)"
            >
              <span style="margin-left: 24px">关闭其他</span>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </div>
</template>

<style scoped>
.tab-bar {
  padding: 8px 16px 0;
  background: #fff;
}

.tab-bar__list {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
}

.tab-bar__list::-webkit-scrollbar {
  display: none;
}

.tab-bar__tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  background: #f5f5f5;
  color: #666;
  transition: background 0.2s, color 0.2s;
  user-select: none;
}

.tab-bar__tag:hover {
  background: #e8e8e8;
}

.tab-bar__tag--active {
  background: #1677ff;
  color: #fff;
}

.tab-bar__tag--active:hover {
  background: #4096ff;
}

.tab-bar__close {
  font-size: 10px;
  border-radius: 50%;
  padding: 2px;
  line-height: 1;
  transition: background 0.2s;
}

.tab-bar__close:hover {
  background: rgba(0, 0, 0, 0.12);
}

.tab-bar__tag--active .tab-bar__close:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
```

- [ ] **Step 2: 启动 dev server，浏览器验证**

Run: `cd template && npx vite --host`

验证：
1. 左侧菜单点击页面，标签页正常出现
2. 标签点击切换正常
3. 标签 × 关闭后跳转到上一个访问的标签
4. 右键标签弹出菜单，菜单项禁用状态正确
5. 刷新/关闭/关闭左侧/关闭右侧/关闭其他功能正常

- [ ] **Step 3: 运行全量测试，确保无回归**

Run: `cd template && npx vitest run`
Expected: PASS

- [ ] **Step 4: 提交**

```bash
git add src/layouts/tab/TabBar.vue
git commit -m "feat: custom tag list with right-click context menu"
```

---

### Task 4: DefaultLayout 兼容验证

**Files:**
- Modify: `src/layouts/Default.layout.vue`（仅当需要改动时）

- [ ] **Step 1: 检查 DefaultLayout 是否需要改动**

`Default.layout.vue` 当前用 `tabStore.cachedNames`（返回 route.name）给 KeepAlive，以及 `:key="$route.fullPath"` 给 router-view。这两处逻辑不受本次改造影响，不需要改动。

验证：启动 dev server，确认 KeepAlive 缓存正常工作（切换标签页后返回，页面状态保留）。

Run: `cd template && npx vite --host`

手动测试：
1. 打开一个 keepAlive 页面（如用户管理），输入一些筛选条件
2. 切换到其他标签
3. 切回用户管理标签
4. 确认筛选条件仍在

- [ ] **Step 2: 提交（如有改动）**

仅当 DefaultLayout 有实际改动时提交。如果验证通过无需改动，跳过此步。

---

### Task 5: 清理 STATUS.md

**Files:**
- Modify: `STATUS.md`

- [ ] **Step 1: 更新 STATUS.md**

在"已完成"部分追加：

```markdown
### 标签页右键菜单 & 自定义标签列表
- TabItem 唯一键从 route.name 改为 route.path，支持同路由多标签页
- 新增 `_tabTitle` query 参数支持动态标签标题
- 新增 `visitedOrder` 访问顺序追踪，关闭标签后跳转到上一个访问的标签
- 替换 antd `a-tabs` 为自定义胶囊标签列表
- 新增右键菜单：刷新、关闭、关闭左侧、关闭右侧、关闭其他
- Store 完整测试覆盖
```

在"待办"中移除已完成的"标签页右键菜单"项。

- [ ] **Step 2: 提交**

```bash
git add STATUS.md
git commit -m "docs: update STATUS.md with tab context menu completion"
```
