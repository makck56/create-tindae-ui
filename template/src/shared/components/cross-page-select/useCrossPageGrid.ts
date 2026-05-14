import { h, computed, watch, nextTick, type Ref } from 'vue'
import type { VxeGridConstructor } from 'vxe-table/types/grid'
import type { VxeTableDefines } from 'vxe-table/types/table'
import CrossPageCheckboxHeader from './CrossPageCheckboxHeader.vue'
import { useCrossPageSelect } from './useCrossPageSelect'
import type { UseCrossPageSelectOptions } from './types'

export interface UseCrossPageGridOptions<T = any> extends UseCrossPageSelectOptions<T> {
  gridRef: Ref<VxeGridConstructor | undefined>
}

export function useCrossPageGrid<T = any>(options: UseCrossPageGridOptions<T>) {
  const { gridRef, ...selectOptions } = options
  const composable = useCrossPageSelect<T>(selectOptions)

  let isSyncing = false

  function syncGridCheckbox() {
    const grid = gridRef.value
    if (!grid) return
    isSyncing = true
    try {
      grid.clearCheckboxRow()
      const rows = selectOptions.data.value.filter(
        (row: any) => !(selectOptions.isDisabled?.(row)) && composable.isRowSelected(row),
      )
      if (rows.length > 0) {
        grid.setCheckboxRow(rows, true)
      }
    } finally {
      isSyncing = false
    }
  }

  watch(
    [composable.selectionState, selectOptions.data],
    () => { nextTick(syncGridCheckbox) },
  )

  function handleCheckboxChange(params: VxeTableDefines.CheckboxChangeEventParams) {
    if (isSyncing) return
    composable.onCheckboxChange(params)
  }

  function handleCheckboxAll(params: VxeTableDefines.CheckboxAllEventParams) {
    if (isSyncing) return
    composable.onCheckboxAll(params)
  }

  const checkboxColumn = computed(() => ({
    type: 'checkbox' as const,
    width: 60,
    slots: {
      header: () => h(CrossPageCheckboxHeader, {
        selectionState: composable.selectionState.value,
        total: composable.checkableTotal.value,
        currentPageAllSelected: composable.currentPageAllSelected.value,
        currentPageSelectedCount: composable.currentPageSelectedCount.value,
        onSelectAllPages: composable.selectAllPages,
        onClearSelection: composable.clearSelection,
        onToggleCurrentPage: composable.toggleCurrentPage,
      }),
    },
  }))

  return {
    ...composable,
    checkboxColumn,
    handleCheckboxChange,
    handleCheckboxAll,
  }
}
