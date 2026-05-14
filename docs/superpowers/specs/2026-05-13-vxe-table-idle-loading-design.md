# vxe-table 空闲加载 + vxe-grid 默认模板设计

## 背景

当前 vxe-table 组件在每个 view 中手动 `defineAsyncComponent` 导入，重复且冗余。scaffold 模板生成的是 `vxe-table` + `vxe-column` 手动列定义 + 独立 `a-pagination`，没有利用 vxe-grid 的内置分页和数据代理能力。

## 设计目标

1. view 文件中零导入 vxe-table 组件，通过全局注册直接使用
2. scaffold 模板默认使用 vxe-grid，自带分页和数据请求
3. composable 简化为返回 gridOptions，不再管理分页状态

## 方案

### 1. vxeTable.ts 同步注册 + 空闲预加载

`src/core/plugins/vxeTable.ts` 改造：

- `defineAsyncComponent` 同步注册全局组件，Vue mount 时组件已存在，首次渲染不缺组件
- `requestIdleCallback` 在浏览器空闲时预加载 chunk + CSS，ES module 缓存保证只下载一次
- defineAsyncComponent 的 loader 与 idle 预加载共享同一引用，首次渲染时如已预加载则直接使用缓存

注册组件清单：

| 组件名 | ES 模块路径 | 用途 |
|---|---|---|
| VxeGrid | vxe-table/es/grid | 数据表格（含分页），主力组件 |
| VxeTable | vxe-table/es/table | 基础表格 |
| VxeColumn | vxe-table/es/column | 列定义 |
| VxeToolbar | vxe-table/es/toolbar | 工具栏 |
| VxePager | vxe-table/es/vxe-pager | 独立分页器 |
| VxeModal | vxe-table/es/vxe-modal | 弹窗 |
| VxeTooltip | vxe-table/es/tooltip | 提示 |

不再 export 组件引用，view 文件零导入。

### 2. scaffold 模板改用 vxe-grid

#### view-list.vue.hbs

```vue
<script setup lang="ts">
import { use{{featurePascal}}List } from '../composables/use{{featurePascal}}List';

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

#### composable-list.ts.hbs

```ts
import { reactive } from 'vue';
import { message } from 'ant-design-vue';
import { get{{featurePascal}}List, delete{{featurePascal}} } from '../api/{{featureCamel}}.api';
import { COPY } from '@/shared/constants/copy';

export function use{{featurePascal}}List() {
  const gridOptions = reactive({
    columns: [
      { field: 'name', title: '名称' },
      { field: 'status', title: '状态',
        slots: { default: 'status_default' },
      },
      { field: 'createdAt', title: '创建时间' },
      { title: '操作', width: 200,
        slots: { default: 'actions_default' },
      },
    ],
    pagerConfig: { pageSize: 10 },
    proxyConfig: {
      props: {
        result: 'list',
        total: 'total',
      },
      ajax: {
        query: async ({ page }) => {
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

### 3. 受影响文件

| 文件 | 改动 |
|---|---|
| `src/core/plugins/vxeTable.ts` | 重写为 requestIdleCallback 空闲注册 |
| `scripts/templates/feature/view-list.vue.hbs` | vxe-grid 模板 |
| `scripts/templates/feature/composable-list.ts.hbs` | 返回 gridOptions |
| `src/pages/user-management/features/user/views/UserList.view.vue` | 改用 vxe-grid |
| `src/pages/user-management/features/user/composables/useUser.ts` | 返回 gridOptions |
