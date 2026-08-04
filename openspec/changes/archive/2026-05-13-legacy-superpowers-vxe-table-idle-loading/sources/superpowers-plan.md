# vxe-table 空闲加载 + vxe-grid 默认模板 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 vxe-table 组件改为 requestIdleCallback 空闲全局注册，view 零导入直接使用；scaffold 模板和现有 user feature 改用 vxe-grid。

**Architecture:** vxeTable.ts 在 requestIdleCallback 中动态 import 各组件并 app.component() 全局注册。composable 返回 gridOptions（含 columns、pagerConfig、proxyConfig），view 只绑定 `<vxe-grid>`。proxyConfig.ajax.query 直接调 API，vxe-grid 自管理分页。

**Tech Stack:** vxe-table 4.3.7 ES modules, Vue 3, requestIdleCallback, Handlebars templates

---

## File Structure

| 文件 | 职责 | 状态 |
|---|---|---|
| `template/src/core/plugins/vxeTable.ts` | requestIdleCallback 空闲注册 vxe-table 组件 | 重写 |
| `template/scripts/templates/feature/view-list.vue.hbs` | scaffold 生成的 view 模板，使用 vxe-grid | 重写 |
| `template/scripts/templates/feature/composable-list.ts.hbs` | scaffold 生成的 composable 模板，返回 gridOptions | 重写 |
| `template/src/pages/user-management/features/user/views/UserList.view.vue` | user feature view，改用 vxe-grid | 重写 |
| `template/src/pages/user-management/features/user/composables/useUser.ts` | user feature composable，返回 gridOptions | 重写 |

---

### Task 1: 重写 vxeTable.ts 为 defineAsyncComponent 同步注册 + requestIdleCallback 空闲预加载

**Files:**
- Modify: `template/src/core/plugins/vxeTable.ts`

- [ ] **Step 1: 重写 vxeTable.ts**

将整个文件替换为：

```ts
import type { App } from 'vue';
import { defineAsyncComponent } from 'vue';

const vxeLoaders = {
  grid: () => import('vxe-table/es/grid'),
  table: () => import('vxe-table/es/table'),
  column: () => import('vxe-table/es/column'),
  toolbar: () => import('vxe-table/es/toolbar'),
  pager: () => import('vxe-table/es/vxe-pager'),
  modal: () => import('vxe-table/es/vxe-modal'),
  tooltip: () => import('vxe-table/es/tooltip'),
};

export function setupVxeTable(app: App): void {
  // 同步注册：Vue mount 时组件已存在，首次渲染不会缺组件
  app.component('VxeGrid', defineAsyncComponent(vxeLoaders.grid));
  app.component('VxeTable', defineAsyncComponent(vxeLoaders.table));
  app.component('VxeColumn', defineAsyncComponent(vxeLoaders.column));
  app.component('VxeToolbar', defineAsyncComponent(vxeLoaders.toolbar));
  app.component('VxePager', defineAsyncComponent(vxeLoaders.pager));
  app.component('VxeModal', defineAsyncComponent(vxeLoaders.modal));
  app.component('VxeTooltip', defineAsyncComponent(vxeLoaders.tooltip));

  // 空闲预加载：提前拉取 chunk + CSS，ES module 缓存保证只下载一次
  const schedule = typeof requestIdleCallback !== 'undefined'
    ? requestIdleCallback
    : (cb: () => void) => setTimeout(cb, 1);

  schedule(async () => {
    await Promise.all([
      import('vxe-table/es/v-x-e-table'),
      ...Object.values(vxeLoaders).map((loader) => loader()),
      import('vxe-table/es/grid/style.css'),
      import('vxe-table/es/table/style.css'),
      import('vxe-table/es/column/style.css'),
    ]);
  });
}
```

- [ ] **Step 2: 验证构建通过**

Run: `cd template && pnpm build`
Expected: 构建成功，无 TS 错误

- [ ] **Step 3: Commit**

```bash
git add template/src/core/plugins/vxeTable.ts
git commit -m "refactor: rewrite vxeTable plugin with requestIdleCallback lazy registration"
```

---

### Task 2: 重写 user composable 为 gridOptions 模式

**Files:**
- Modify: `template/src/pages/user-management/features/user/composables/useUser.ts`

- [ ] **Step 1: 重写 useUser.ts 的 useUserList 函数**

保留 `useUserDetail` 不变，重写 `useUserList` 为返回 gridOptions。将 `useUserList` 函数（第 7-56 行）替换为：

```ts
export function useUserList() {
  const filters = reactive({
    name: undefined as string | undefined,
    status: undefined as UserStatus | undefined,
    role: undefined as UserRole | undefined,
  });

  const gridRef = ref<any>(null);

  const gridOptions = reactive({
    columns: [
      { field: 'name', title: '用户名' },
      { field: 'email', title: '邮箱' },
      { field: 'role', title: '角色' },
      {
        field: 'status',
        title: '状态',
        slots: { default: 'status_default' },
      },
      { field: 'createdAt', title: '创建时间' },
      {
        title: '操作',
        width: 200,
        slots: { default: 'actions_default' },
      },
    ],
    pagerConfig: { pageSize: 10 },
    proxyConfig: {
      ajax: {
        query: async ({ page }: { page: { currentPage: number; pageSize: number } }) => {
          const { data: res } = await getUserList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...filters,
          });
          return res.data;
        },
      },
    },
  });

  function handleSearch() {
    gridRef.value?.commitProxy('query');
  }

  function resetFilters() {
    filters.name = undefined;
    filters.status = undefined;
    filters.role = undefined;
    handleSearch();
  }

  async function handleDelete(id: string) {
    try {
      await deleteUser(id);
      message.success(COPY.COMMON.SUCCESS);
      handleSearch();
    } catch {
      message.error(COPY.COMMON.FAILED);
    }
  }

  return { gridRef, gridOptions, filters, handleSearch, resetFilters, handleDelete };
}
```

同时更新文件顶部 import：

```ts
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { getUserList, getUserDetail, deleteUser } from '../api/user.api';
import type { User, UserStatus, UserRole } from '../models/User';
import { COPY } from '@/shared/constants/copy';
```

- [ ] **Step 2: 验证构建通过**

Run: `cd template && pnpm build`
Expected: 构建成功

- [ ] **Step 3: Commit**

```bash
git add template/src/pages/user-management/features/user/composables/useUser.ts
git commit -m "refactor: rewrite useUserList to return gridOptions for vxe-grid"
```

---

### Task 3: 重写 UserList.view.vue 使用 vxe-grid

**Files:**
- Modify: `template/src/pages/user-management/features/user/views/UserList.view.vue`

- [ ] **Step 1: 重写 UserList.view.vue**

将整个文件替换为：

```vue
<script setup lang="ts">
import { useUserList } from '../composables/useUser';
import UserFilter from '../components/list/UserFilter.vue';
import { COPY } from '@/shared/constants/copy';

defineOptions({ name: 'UserList' });

const { gridRef, gridOptions, filters, handleSearch, resetFilters, handleDelete } = useUserList();
</script>

<template>
  <div>
    <UserFilter
      v-model:name="filters.name"
      v-model:status="filters.status"
      v-model:role="filters.role"
      @search="handleSearch"
      @reset="resetFilters"
    />

    <vxe-grid ref="gridRef" v-bind="gridOptions" border>
      <template #status_default="{ row }">
        <a-tag :color="row.status === 'active' ? 'green' : 'red'">
          {{ row.status === 'active' ? '启用' : '禁用' }}
        </a-tag>
      </template>
      <template #actions_default="{ row }">
        <a-button type="link" size="small" @click="$router.push(`/user-management/${row.id}`)">
          {{ COPY.COMMON.EDIT }}
        </a-button>
        <a-popconfirm title="确定删除？" @confirm="handleDelete(row.id)">
          <a-button type="link" danger size="small">{{ COPY.COMMON.DELETE }}</a-button>
        </a-popconfirm>
      </template>
    </vxe-grid>
  </div>
</template>
```

- [ ] **Step 2: 验证构建通过**

Run: `cd template && pnpm build`
Expected: 构建成功

- [ ] **Step 3: Commit**

```bash
git add template/src/pages/user-management/features/user/views/UserList.view.vue
git commit -m "refactor: rewrite UserList view to use vxe-grid"
```

---

### Task 4: 重写 scaffold view-list.vue.hbs 模板

**Files:**
- Modify: `template/scripts/templates/feature/view-list.vue.hbs`

- [ ] **Step 1: 重写 view-list.vue.hbs**

将整个文件替换为：

```vue
<script setup lang="ts">
import { use{{featurePascal}}List } from '../composables/use{{featurePascal}}List';
import { COPY } from '@/shared/constants/copy';

defineOptions({ name: '{{featurePascal}}List' });

const { gridOptions, handleDelete } = use{{featurePascal}}List();
</script>

<template>
  <vxe-grid v-bind="gridOptions" border>
    <template #status_default="{ row }">
      <a-tag :color="row.status === 'active' ? 'green' : 'red'">
        \{{ row.status === 'active' ? '启用' : '禁用' }}
      </a-tag>
    </template>
    <template #actions_default="{ row }">
      <a-popconfirm title="确定删除？" @confirm="handleDelete(row.id)">
        <a-button type="link" danger size="small">\{{ COPY.COMMON.DELETE }}</a-button>
      </a-popconfirm>
    </template>
  </vxe-grid>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add template/scripts/templates/feature/view-list.vue.hbs
git commit -m "refactor: scaffold view template uses vxe-grid"
```

---

### Task 5: 重写 scaffold composable-list.ts.hbs 模板

**Files:**
- Modify: `template/scripts/templates/feature/composable-list.ts.hbs`

- [ ] **Step 1: 重写 composable-list.ts.hbs**

将整个文件替换为：

```ts
import { reactive } from 'vue';
import { message } from 'ant-design-vue';
import { get{{featurePascal}}List, delete{{featurePascal}} } from '../api/{{featureCamel}}.api';
import { COPY } from '@/shared/constants/copy';

export function use{{featurePascal}}List() {
  const gridOptions = reactive({
    columns: [
      { field: 'name', title: '名称' },
      {
        field: 'status',
        title: '状态',
        slots: { default: 'status_default' },
      },
      { field: 'createdAt', title: '创建时间' },
      {
        title: '操作',
        width: 200,
        slots: { default: 'actions_default' },
      },
    ],
    pagerConfig: { pageSize: 10 },
    proxyConfig: {
      ajax: {
        query: async ({ page }: { page: { currentPage: number; pageSize: number } }) => {
          const { data: res } = await get{{featurePascal}}List({
            page: page.currentPage,
            pageSize: page.pageSize,
          });
          return res.data;
        },
      },
    },
  });

  async function handleDelete(id: string) {
    try {
      await delete{{featurePascal}}(id);
      message.success(COPY.COMMON.SUCCESS);
    } catch {
      message.error(COPY.COMMON.FAILED);
    }
  }

  return { gridOptions, handleDelete };
}
```

- [ ] **Step 2: Commit**

```bash
git add template/scripts/templates/feature/composable-list.ts.hbs
git commit -m "refactor: scaffold composable template returns gridOptions for vxe-grid"
```

---

### Task 6: 更新 vite.config.ts manualChunks 加入 vxe-table grid

**Files:**
- Modify: `template/vite.config.ts`

- [ ] **Step 1: 添加 grid CSS 到 manualChunks 配置（无需改动）**

vite.config.ts 的 `vendor-vxe` 已包含 `vxe-table` 和 `xe-utils`，grid 是 vxe-table 子模块，会自动归入该 chunk。无需额外配置。

- [ ] **Step 2: 验证最终构建**

Run: `cd template && pnpm build`
Expected: 构建成功，vendor-vxe chunk 包含 grid

---

### Task 7: 清理不再需要的导出和导入

**Files:**
- Modify: `template/src/pages/user-management/features/user/models/User.ts` (如果有多余 export)
- Verify: `template/src/pages/user-management/features/user/composables/useUser.spec.ts`

- [ ] **Step 1: 检查 useUser.spec.ts 是否需要更新**

Run: `cat template/src/pages/user-management/features/user/composables/useUser.spec.ts`

如果测试引用了旧的 `useUserList` 返回值（`loading`, `users`, `total`, `pagination`, `filters`, `fetchList`, `resetFilters`），需要更新为新的返回值（`gridOptions`, `handleDelete`）。

- [ ] **Step 2: 更新测试文件（如存在）**

将测试改为验证 `gridOptions` 结构和 `handleDelete` 函数。

- [ ] **Step 3: 验证构建和测试通过**

Run: `cd template && pnpm build && pnpm test`
Expected: 全部通过

- [ ] **Step 4: Commit**

```bash
git add -u
git commit -m "refactor: update useUser tests for gridOptions pattern"
```
