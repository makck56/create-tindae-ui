# cross-page-select

基于 `vxe-grid` 的跨页选择组件，提供「无选择 -> 当前页选择 -> 跨页全选」三层模式。

## 快速开始

```ts
import { useCrossPageGrid, CrossPageSelectBanner } from '@/shared/components/cross-page-select'
```

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCrossPageGrid, CrossPageSelectBanner } from '@/shared/components/cross-page-select'

interface RowData {
  id: number
  name: string
  disabled: boolean
}

interface GridCheckboxController {
  clearCheckboxRow(): void
  setCheckboxRow(rows: RowData[], checked: boolean): void
}

const gridRef = ref<GridCheckboxController>()
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

`vxe-table` 集成层，自动处理 checkbox 视觉同步。

#### Options

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `gridRef` | `Ref<{ clearCheckboxRow(): void; setCheckboxRow(rows: T[], checked: boolean): void }>` | 是 | `vxe-grid` 引用，只要求 checkbox 同步所需的最小能力 |
| `rowKey` | `string` | 是 | 行数据中的唯一标识字段 |
| `total` | `Ref<number>` | 是 | 数据总条数 |
| `checkableTotal` | `Ref<number>` | 否 | 可勾选总条数，存在禁用行时建议显式传入 |
| `data` | `Ref<T[]>` | 是 | 当前页数据 |
| `isDisabled` | `(row: T) => boolean` | 否 | 判断某行是否禁用勾选 |

#### 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| `checkboxColumn` | `ComputedRef` | 预配置的 checkbox 列，直接放入 columns 即可 |
| `handleCheckboxChange` | `(params) => void` | 绑定 `@checkbox-change` |
| `handleCheckboxAll` | `(params) => void` | 绑定 `@checkbox-all` |
| `selectionState` | `ComputedRef<SelectionState>` | 当前选择状态 |
| `selectedCount` | `ComputedRef<number>` | 已选行数 |
| `showBanner` | `ComputedRef<boolean>` | 是否显示全选提示条 |
| `checkableTotal` | `ComputedRef<number>` | 可勾选总数 |
| `clearSelection` | `() => void` | 清空选择 |
| `getSelectionPayload` | `() => SelectionPayload` | 获取提交 API 的 payload |
| `onPageChange` | `() => void` | 翻页时调用 |
| `isRowSelected` | `(row) => boolean` | 判断某行是否已选 |
| `selectAllPages` | `() => void` | 切换到跨页全选模式 |
| `toggleCurrentPage` | `() => void` | 切换当前页全选/取消 |

### `useCrossPageSelect(options)`

纯状态管理层，不依赖 `vxe-table`。需要调用方自行同步 checkbox 视觉状态。

### `CrossPageSelectBanner`

全选提示条组件。

| Prop | 类型 | 说明 |
|------|------|------|
| `selectedCount` | `number` | 已选行数 |
| `total` | `number` | 可勾选总条数 |

| Event | 说明 |
|-------|------|
| `clear` | 点击清除选择 |

### `SelectionPayload`

`getSelectionPayload()` 返回值：

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
  total: computed(() => apiTotal.value),
  checkableTotal: computed(() => apiTotal.value),
  data: computed(() => tableData.value),
  isDisabled: (row) => row.status === 'locked',
})

async function onSearch() {
  grid.clearSelection()
  await fetchData()
}
```

## 禁用行

传入 `isDisabled` 后：

- 表头全选不会选中禁用行
- 跨页全选时禁用行不计入总数
- `selectedCount` 和 `checkableTotal` 都不包含禁用行
- `vxe-grid` 的 `checkMethod` 需要同步设置：`:checkbox-config="{ checkMethod: ({ row }) => !isDisabled(row) }"`
