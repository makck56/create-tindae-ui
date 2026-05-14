# cross-page-select

基于 vxe-grid 的跨页选择组件。提供三层选择模式：无选择 → 当前页选择 → 跨页全选。

## 快速开始

```ts
import { useCrossPageGrid, CrossPageSelectBanner } from '@/shared/components/cross-page-select'
```

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { VxeGridConstructor } from 'vxe-table/types/grid'
import { useCrossPageGrid, CrossPageSelectBanner } from '@/shared/components/cross-page-select'

interface RowData {
  id: number
  name: string
  disabled: boolean
}

const gridRef = ref<VxeGridConstructor>()
const pagination = ref({ page: 1, pageSize: 10, total: 100 })
const currentPageData = ref<RowData[]>([])

const grid = useCrossPageGrid({
  gridRef,
  rowKey: 'id',
  total: computed(() => pagination.value.total),
  data: currentPageData,
  isDisabled: (row: RowData) => row.disabled,
})

const columns = computed(() => [
  grid.checkboxColumn.value,
  { field: 'name', title: '名称' },
])
</script>

<template>
  <vxe-grid
    ref="gridRef"
    :columns="columns"
    :data="currentPageData"
    :row-config="{ keyField: 'id' }"
    :checkbox-config="{ highlight: true, checkMethod: ({ row }) => !row.disabled }"
    @checkbox-change="grid.handleCheckboxChange"
    @checkbox-all="grid.handleCheckboxAll"
  >
    <template #top>
      <CrossPageSelectBanner
        v-if="grid.showBanner.value"
        :selected-count="grid.selectedCount.value"
        :total="grid.checkableTotal.value"
        @clear="grid.clearSelection"
      />
    </template>
  </vxe-grid>

  <vxe-pager
    :current-page="pagination.page"
    :page-size="pagination.pageSize"
    :total="pagination.total"
    @page-change="({ currentPage, pageSize }) => {
      pagination.page = currentPage
      pagination.pageSize = pageSize
      grid.onPageChange()
    }"
  />
</template>
```

## API

### `useCrossPageGrid(options)`

vxe-table 集成层，自动处理 checkbox 视觉同步。

#### Options

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `gridRef` | `Ref<VxeGridConstructor>` | 是 | vxe-grid 组件引用 |
| `rowKey` | `string` | 是 | 行数据中作为唯一标识的字段名 |
| `total` | `Ref<number>` | 是 | 数据总条数 |
| `checkableTotal` | `Ref<number>` | 否 | 可勾选的总条数（有禁用行时传入，默认等于 total） |
| `data` | `Ref<T[]>` | 是 | 当前页数据 |
| `isDisabled` | `(row: T) => boolean` | 否 | 判断行是否禁用勾选 |

#### 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| `checkboxColumn` | `ComputedRef` | 预配置的 checkbox 列（含下拉全选表头），放入 columns 数组即可 |
| `handleCheckboxChange` | `(params) => void` | 绑定 `@checkbox-change` |
| `handleCheckboxAll` | `(params) => void` | 绑定 `@checkbox-all` |
| `selectionState` | `ComputedRef<SelectionState>` | 当前选择状态 |
| `selectedCount` | `ComputedRef<number>` | 已选行数 |
| `showBanner` | `ComputedRef<boolean>` | 是否显示全选提示条 |
| `checkableTotal` | `ComputedRef<number>` | 可勾选总行数 |
| `clearSelection` | `() => void` | 清空选择 |
| `getSelectionPayload` | `() => SelectionPayload` | 获取提交 API 的 payload |
| `onPageChange` | `() => void` | 翻页时调用 |
| `isRowSelected` | `(row) => boolean` | 判断某行是否选中 |
| `selectAllPages` | `() => void` | 切换到跨页全选模式 |
| `toggleCurrentPage` | `() => void` | 切换当前页全选/取消 |

### `useCrossPageSelect(options)`

纯状态管理层，不依赖 vxe-table。需要手动同步 checkbox 视觉状态。选项同上但不包含 `gridRef`。

### `CrossPageSelectBanner`

全选提示条组件。

| Prop | 类型 | 说明 |
|------|------|------|
| `selectedCount` | `number` | 已选行数 |
| `total` | `number` | 可勾选总行数 |

| Event | 说明 |
|-------|------|
| `clear` | 点击清除选择 |

### `SelectionPayload`

`getSelectionPayload()` 的返回值：

```ts
// 跨页全选模式
{ selectAll: true, excludedIds: string[] }

// 当前页选择 / 无选择
{ selectAll: false, selectedIds: string[] }
```

## 服务端分页示例

```ts
const grid = useCrossPageGrid({
  gridRef,
  rowKey: 'id',
  total: computed(() => apiTotal.value),       // 后端返回的总数
  checkableTotal: computed(() => apiTotal.value), // 如果后端已排除禁用行
  data: computed(() => tableData.value),        // 当前页数据
  isDisabled: (row) => row.status === 'locked',
})

// 查询参数变化时清空选择
async function onSearch() {
  grid.clearSelection()
  await fetchData()
}
```

## 禁用行

传入 `isDisabled` 后，所有选择操作自动跳过禁用行：

- 表头全选不会选中禁用行
- 跨页全选时禁用行不计入总数
- `selectedCount` 和 `checkableTotal` 均不包含禁用行
- vxe-grid 的 `checkMethod` 需同步设置：`:checkbox-config="{ checkMethod: ({ row }) => !isDisabled(row) }"`
