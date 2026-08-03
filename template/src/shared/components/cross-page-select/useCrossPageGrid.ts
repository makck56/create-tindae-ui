import { h, computed, watch, nextTick, type Ref } from 'vue';
import CrossPageCheckboxHeader from './CrossPageCheckboxHeader.vue';
import { useCrossPageSelect } from './useCrossPageSelect';
import type { UseCrossPageSelectOptions } from './types';

export interface VxeGridCheckboxController<T> {
  clearCheckboxRow(): void;
  setCheckboxRow(rows: T[], checked: boolean): void;
}

export interface VxeCheckboxEventParams<T> {
  row?: T;
  records?: T[];
  checked?: boolean;
  $event?: Event;
}

export interface UseCrossPageGridOptions<T = unknown> extends UseCrossPageSelectOptions<T> {
  // 这里只依赖 checkbox 同步需要的最小 grid 能力，避免绑定 vxe-table 内部类型路径。
  gridRef: Ref<VxeGridCheckboxController<T> | undefined>;
}

export function useCrossPageGrid<T = unknown>(options: UseCrossPageGridOptions<T>) {
  const { gridRef, ...selectOptions } = options;
  const composable = useCrossPageSelect<T>(selectOptions);

  let isSyncing = false;
  let syncTimer: ReturnType<typeof setTimeout> | undefined;

  function syncGridCheckbox() {
    const grid = gridRef.value;
    if (!grid) return;
    isSyncing = true;
    try {
      grid.clearCheckboxRow();
      const rows = selectOptions.data.value.filter(
        (row) => !selectOptions.isDisabled?.(row) && composable.isRowSelected(row),
      );
      if (rows.length > 0) {
        grid.setCheckboxRow(rows, true);
      }
    } finally {
      isSyncing = false;
    }
  }

  function scheduleGridCheckboxSync() {
    if (syncTimer) {
      clearTimeout(syncTimer);
    }

    void nextTick(() => {
      syncGridCheckbox();

      // VXE proxyConfig 会在 ajax.query 返回后再把数据写回表格内部状态；翻页场景下，
      // 这一步可能发生在 currentData 变更 watcher 之后，并覆盖前一次 setCheckboxRow。
      // 因此额外延后一轮宏任务再同步一次，确保表格完成分页数据替换后恢复勾选视觉状态。
      syncTimer = setTimeout(() => {
        syncTimer = undefined;
        syncGridCheckbox();
      }, 0);
    });
  }

  watch([composable.selectionState, selectOptions.data], scheduleGridCheckboxSync, {
    flush: 'post',
  });

  function handleCheckboxChange(params: VxeCheckboxEventParams<T>) {
    if (isSyncing) return;
    composable.onCheckboxChange(params);
  }

  function handleCheckboxAll(params: VxeCheckboxEventParams<T>) {
    if (isSyncing) return;
    composable.onCheckboxAll(params);
  }

  const checkboxColumn = computed(() => ({
    type: 'checkbox' as const,
    width: 60,
    slots: {
      header: () =>
        h(CrossPageCheckboxHeader, {
          selectionState: composable.selectionState.value,
          total: composable.checkableTotal.value,
          currentPageAllSelected: composable.currentPageAllSelected.value,
          currentPageSelectedCount: composable.currentPageSelectedCount.value,
          onSelectAllPages: composable.selectAllPages,
          onClearSelection: composable.clearSelection,
          onToggleCurrentPage: composable.toggleCurrentPage,
        }),
    },
  }));

  return {
    ...composable,
    checkboxColumn,
    handleCheckboxChange,
    handleCheckboxAll,
  };
}
