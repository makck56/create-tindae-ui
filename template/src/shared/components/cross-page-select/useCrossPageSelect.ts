// src/shared/components/cross-page-select/useCrossPageSelect.ts
import { ref, computed } from 'vue';
import { SELECTION_NONE, SELECTION_CURRENT_PAGE, SELECTION_ALL_PAGES } from './types';
import type { SelectionState, SelectionPayload, UseCrossPageSelectOptions } from './types';

export function useCrossPageSelect<T = any>(options: UseCrossPageSelectOptions<T>) {
  const { rowKey, data, isDisabled, total } = options;

  const getRowId = (row: any) => String(row[rowKey]);

  /** 可勾选的总行数（默认等于 total，有禁用行时由消费方传入或后端分页时传递） */
  const checkableTotal = options.checkableTotal ?? total;

  const state = ref<SelectionState>({ mode: SELECTION_NONE });

  // 当前页非禁用行
  const enabledRows = computed(() => {
    const rows = data.value;
    if (!isDisabled) return rows;
    return rows.filter((row) => !isDisabled(row));
  });

  // 当前页所有非禁用行的 id 集合
  const currentPageEnabledIds = computed(() => {
    return new Set(enabledRows.value.map(getRowId));
  });

  const selectionState = computed(() => state.value);

  /** 判断某行是否选中，禁用行始终返回 false */
  function isRowSelected(row: any): boolean {
    if (isDisabled?.(row)) return false;
    const id = getRowId(row);
    const s = state.value;
    if (s.mode === SELECTION_NONE) return false;
    if (s.mode === SELECTION_CURRENT_PAGE) return s.selectedIds.has(id);
    // allPages
    return !s.excludedIds.has(id);
  }

  /** 当前页已选行数（仅非禁用行） */
  const currentPageSelectedCount = computed(() => {
    const s = state.value;
    if (s.mode === SELECTION_NONE) return 0;
    let count = 0;
    for (const row of enabledRows.value) {
      if (isRowSelected(row)) count++;
    }
    return count;
  });

  /** 当前页非禁用行是否全部选中 */
  const currentPageAllSelected = computed(() => {
    const rows = enabledRows.value;
    if (rows.length === 0) return false;
    return currentPageSelectedCount.value === rows.length;
  });

  /** 单行 checkbox 变化，绑定 vxe-grid @checkbox-change */
  function onCheckboxChange(params: { row: any; checked: boolean }) {
    const row = params.row;
    if (isDisabled?.(row)) return;
    const id = getRowId(row);
    const s = state.value;

    if (s.mode === SELECTION_NONE || s.mode === SELECTION_CURRENT_PAGE) {
      let selectedIds: Set<string>;
      if (s.mode === SELECTION_NONE) {
        selectedIds = new Set();
      } else {
        selectedIds = new Set(s.selectedIds);
      }

      if (params.checked) {
        selectedIds.add(id);
      } else {
        selectedIds.delete(id);
      }

      state.value =
        selectedIds.size === 0
          ? { mode: SELECTION_NONE }
          : { mode: SELECTION_CURRENT_PAGE, selectedIds };
    } else {
      // allPages mode
      const excludedIds = new Set(s.excludedIds);
      if (params.checked) {
        excludedIds.delete(id);
      } else {
        excludedIds.add(id);
      }
      state.value =
        excludedIds.size >= checkableTotal.value
          ? { mode: SELECTION_NONE }
          : { mode: SELECTION_ALL_PAGES, excludedIds };
    }
  }

  /** 当前页全选/取消全选，绑定 vxe-grid @checkbox-all */
  function onCheckboxAll(params: { checked: boolean; records: any[] }) {
    const s = state.value;

    if (s.mode === SELECTION_NONE || s.mode === SELECTION_CURRENT_PAGE) {
      let selectedIds: Set<string>;
      if (s.mode === SELECTION_NONE) {
        selectedIds = new Set();
      } else {
        selectedIds = new Set(s.selectedIds);
      }

      if (params.checked) {
        for (const row of enabledRows.value) {
          selectedIds.add(getRowId(row));
        }
      } else {
        for (const id of currentPageEnabledIds.value) {
          selectedIds.delete(id);
        }
      }

      state.value =
        selectedIds.size === 0
          ? { mode: SELECTION_NONE }
          : { mode: SELECTION_CURRENT_PAGE, selectedIds };
    } else {
      // allPages mode
      const excludedIds = new Set(s.excludedIds);
      if (params.checked) {
        for (const id of currentPageEnabledIds.value) {
          excludedIds.delete(id);
        }
      } else {
        for (const id of currentPageEnabledIds.value) {
          excludedIds.add(id);
        }
      }
      state.value =
        excludedIds.size >= checkableTotal.value
          ? { mode: SELECTION_NONE }
          : { mode: SELECTION_ALL_PAGES, excludedIds };
    }
  }

  /** 切换到跨页全选模式 */
  function selectAllPages() {
    state.value = { mode: SELECTION_ALL_PAGES, excludedIds: new Set() };
  }

  /** 重置为无选择状态 */
  function clearSelection() {
    state.value = { mode: SELECTION_NONE };
  }

  /** 切换当前页全选/取消全选 */
  function toggleCurrentPage() {
    onCheckboxAll({ checked: !currentPageAllSelected.value, records: [] });
  }

  /** 翻页时调用，currentPage 模式保持 selectedIds 不变 */
  function onPageChange() {
    // 翻页不清空 selectedIds，保留跨页累积选择
  }

  /** 已选行数（currentPage 模式为 selectedIds.size，allPages 模式为 checkableTotal - excludedIds.size） */
  const selectedCount = computed(() => {
    const s = state.value;
    if (s.mode === SELECTION_NONE) return 0;
    if (s.mode === SELECTION_CURRENT_PAGE) return s.selectedIds.size;
    return checkableTotal.value - s.excludedIds.size;
  });

  /** 是否有选中行（用于控制 Banner 显示） */
  const showBanner = computed(() => state.value.mode !== SELECTION_NONE);

  /** 输出 API payload：allPages 模式返回 selectAll+excludedIds，currentPage 模式返回 selectedIds */
  function getSelectionPayload(): SelectionPayload {
    const s = state.value;
    if (s.mode === SELECTION_ALL_PAGES) {
      return { selectAll: true, excludedIds: [...s.excludedIds] };
    }
    if (s.mode === SELECTION_CURRENT_PAGE) {
      return { selectAll: false, selectedIds: [...s.selectedIds] };
    }
    return { selectAll: false, selectedIds: [] };
  }

  return {
    selectionState,
    isRowSelected,
    checkableTotal,
    selectedCount,
    showBanner,
    currentPageAllSelected,
    currentPageSelectedCount,
    onCheckboxChange,
    onCheckboxAll,
    toggleCurrentPage,
    selectAllPages,
    clearSelection,
    onPageChange,
    getSelectionPayload,
  };
}
