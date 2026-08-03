import { describe, it, expect, beforeEach } from 'vitest';
import { ref, computed } from 'vue';
import { useCrossPageSelect } from '../useCrossPageSelect';
import { isCurrentPageMode, isAllPagesMode } from '../types';

interface Row {
  id: string;
  disabled: boolean;
}

function createComposable(overrides: { data?: Row[]; isDisabled?: (row: Row) => boolean } = {}) {
  const rows: Row[] = overrides.data ?? [
    { id: '1', disabled: false },
    { id: '2', disabled: false },
    { id: '3', disabled: false },
    { id: '4', disabled: true },
    { id: '5', disabled: false },
  ];

  const data = ref(rows) as any;
  const total = ref(rows.length);
  const checkableTotal = computed(() => rows.filter((r) => !r.disabled).length);
  const isDisabled = overrides.isDisabled ?? ((row: Row) => row.disabled);

  const composable = useCrossPageSelect<Row>({
    rowKey: 'id',
    total,
    checkableTotal,
    data,
    isDisabled,
  });

  return { composable, data, rows };
}

function getSelectedIds(c: ReturnType<typeof createComposable>['composable']) {
  const s = c.selectionState.value;
  return isCurrentPageMode(s) ? s.selectedIds : new Set<string>();
}

function getExcludedIds(c: ReturnType<typeof createComposable>['composable']) {
  const s = c.selectionState.value;
  return isAllPagesMode(s) ? s.excludedIds : new Set<string>();
}

describe('useCrossPageSelect', () => {
  let c: ReturnType<typeof createComposable>['composable'];
  let data: ReturnType<typeof createComposable>['data'];

  beforeEach(() => {
    const result = createComposable();
    c = result.composable;
    data = result.data;
  });

  // ==================== 初始状态 ====================

  it('初始状态为 none', () => {
    expect(c.selectionState.value.mode).toBe('none');
  });

  it('none 模式下所有行未选中', () => {
    expect(c.isRowSelected(data.value[0])).toBe(false);
    expect(c.isRowSelected(data.value[3])).toBe(false);
  });

  it('none 模式下 payload 为空 selectedIds', () => {
    expect(c.getSelectionPayload()).toEqual({ selectAll: false, selectedIds: [] });
  });

  it('none 模式下 selectedCount 为 0', () => {
    expect(c.selectedCount.value).toBe(0);
  });

  it('none 模式下 showBanner 为 false', () => {
    expect(c.showBanner.value).toBe(false);
  });

  // ==================== none → currentPage ====================

  it('勾选单行: none → currentPage', () => {
    c.onCheckboxChange({ row: data.value[0], checked: true });
    expect(c.selectionState.value.mode).toBe('currentPage');
    expect(c.isRowSelected(data.value[0])).toBe(true);
    expect(c.isRowSelected(data.value[1])).toBe(false);
  });

  it('禁用行勾选无效: 保持 none', () => {
    c.onCheckboxChange({ row: data.value[3], checked: true });
    expect(c.selectionState.value.mode).toBe('none');
  });

  // ==================== currentPage 内部操作 ====================

  it('currentPage: 勾选多行', () => {
    c.onCheckboxChange({ row: data.value[0], checked: true });
    c.onCheckboxChange({ row: data.value[1], checked: true });
    expect(getSelectedIds(c)).toEqual(new Set(['1', '2']));
    expect(c.isRowSelected(data.value[0])).toBe(true);
    expect(c.isRowSelected(data.value[1])).toBe(true);
    expect(c.isRowSelected(data.value[2])).toBe(false);
  });

  it('currentPage: 取消某行', () => {
    c.onCheckboxChange({ row: data.value[0], checked: true });
    c.onCheckboxChange({ row: data.value[1], checked: true });
    c.onCheckboxChange({ row: data.value[0], checked: false });
    expect(getSelectedIds(c)).toEqual(new Set(['2']));
    expect(c.isRowSelected(data.value[0])).toBe(false);
  });

  it('currentPage: 取消所有行 → none', () => {
    c.onCheckboxChange({ row: data.value[0], checked: true });
    c.onCheckboxChange({ row: data.value[0], checked: false });
    expect(c.selectionState.value.mode).toBe('none');
  });

  it('currentPage: 当前页全选', () => {
    c.onCheckboxChange({ row: data.value[0], checked: true });
    c.onCheckboxAll({ checked: true, records: [] });
    expect(c.selectionState.value.mode).toBe('currentPage');
    expect(getSelectedIds(c)).toEqual(new Set(['1', '2', '3', '5']));
  });

  it('currentPage: 全选后取消全选 → none', () => {
    c.onCheckboxAll({ checked: true, records: [] });
    c.onCheckboxAll({ checked: false, records: [] });
    expect(c.selectionState.value.mode).toBe('none');
  });

  it('currentPage: payload 返回 selectedIds', () => {
    c.onCheckboxChange({ row: data.value[0], checked: true });
    c.onCheckboxChange({ row: data.value[2], checked: true });
    expect(c.getSelectionPayload()).toEqual({ selectAll: false, selectedIds: ['1', '3'] });
  });

  it('currentPage: selectedCount 等于 selectedIds.size', () => {
    c.onCheckboxChange({ row: data.value[0], checked: true });
    c.onCheckboxChange({ row: data.value[2], checked: true });
    expect(c.selectedCount.value).toBe(2);
  });

  // ==================== currentPage → allPages ====================

  it('currentPage → 全选所有页: allPages', () => {
    c.onCheckboxChange({ row: data.value[0], checked: true });
    c.selectAllPages();
    expect(c.selectionState.value.mode).toBe('allPages');
    expect(getExcludedIds(c)).toEqual(new Set());
  });

  it('none → 全选所有页: allPages', () => {
    c.selectAllPages();
    expect(c.selectionState.value.mode).toBe('allPages');
    expect(getExcludedIds(c)).toEqual(new Set());
  });

  // ==================== allPages 内部操作 ====================

  it('allPages: 所有行被视为选中', () => {
    c.selectAllPages();
    expect(c.isRowSelected(data.value[0])).toBe(true);
    expect(c.isRowSelected(data.value[1])).toBe(true);
    expect(c.isRowSelected(data.value[2])).toBe(true);
    expect(c.isRowSelected(data.value[3])).toBe(false); // 禁用行
    expect(c.isRowSelected(data.value[4])).toBe(true);
  });

  it('allPages: 取消某行 → 加入 excludedIds', () => {
    c.selectAllPages();
    c.onCheckboxChange({ row: data.value[0], checked: false });
    expect(getExcludedIds(c)).toEqual(new Set(['1']));
    expect(c.isRowSelected(data.value[0])).toBe(false);
    expect(c.isRowSelected(data.value[1])).toBe(true);
  });

  it('allPages: 重新勾选已排除行 → 从 excludedIds 移除', () => {
    c.selectAllPages();
    c.onCheckboxChange({ row: data.value[0], checked: false });
    c.onCheckboxChange({ row: data.value[0], checked: true });
    expect(getExcludedIds(c)).toEqual(new Set());
    expect(c.isRowSelected(data.value[0])).toBe(true);
  });

  it('allPages: 取消多行后再恢复部分', () => {
    c.selectAllPages();
    c.onCheckboxChange({ row: data.value[0], checked: false });
    c.onCheckboxChange({ row: data.value[1], checked: false });
    expect(getExcludedIds(c)).toEqual(new Set(['1', '2']));
    c.onCheckboxChange({ row: data.value[0], checked: true });
    expect(getExcludedIds(c)).toEqual(new Set(['2']));
  });

  it('allPages: 当前页全选 → 从 excludedIds 移除当前页', () => {
    c.selectAllPages();
    c.onCheckboxChange({ row: data.value[0], checked: false });
    c.onCheckboxChange({ row: data.value[2], checked: false });
    expect(getExcludedIds(c)).toEqual(new Set(['1', '3']));
    c.onCheckboxAll({ checked: true, records: [] });
    expect(getExcludedIds(c)).toEqual(new Set());
  });

  it('allPages: 取消当前页全选（等于全部可勾选行）→ 回退到 none', () => {
    c.selectAllPages();
    c.onCheckboxAll({ checked: false, records: [] });
    expect(c.selectionState.value.mode).toBe('none');
    expect(c.isRowSelected(data.value[0])).toBe(false);
    expect(c.isRowSelected(data.value[1])).toBe(false);
  });

  it('allPages: 禁用行勾选无效', () => {
    c.selectAllPages();
    c.onCheckboxChange({ row: data.value[3], checked: false });
    expect(getExcludedIds(c)).toEqual(new Set());
  });

  it('allPages: payload 返回 selectAll + excludedIds', () => {
    c.selectAllPages();
    c.onCheckboxChange({ row: data.value[0], checked: false });
    expect(c.getSelectionPayload()).toEqual({ selectAll: true, excludedIds: ['1'] });
  });

  it('allPages: selectedCount 等于 checkableTotal - excludedIds.size', () => {
    c.selectAllPages();
    expect(c.selectedCount.value).toBe(4); // 4 checkable rows
    c.onCheckboxChange({ row: data.value[0], checked: false });
    expect(c.selectedCount.value).toBe(3);
  });

  it('currentPage: showBanner 为 true', () => {
    c.onCheckboxChange({ row: data.value[0], checked: true });
    expect(c.showBanner.value).toBe(true);
  });

  it('allPages: showBanner 为 true', () => {
    c.selectAllPages();
    expect(c.showBanner.value).toBe(true);
  });

  // ==================== allPages → none ====================

  it('allPages → 取消选择所有 → none', () => {
    c.selectAllPages();
    c.clearSelection();
    expect(c.selectionState.value.mode).toBe('none');
  });

  it('allPages → 取消选择所有 → payload 为空', () => {
    c.selectAllPages();
    c.clearSelection();
    expect(c.getSelectionPayload()).toEqual({ selectAll: false, selectedIds: [] });
  });

  // ==================== 翻页 ====================

  it('currentPage 翻页 → 保留 selectedIds', () => {
    c.onCheckboxChange({ row: data.value[0], checked: true });
    expect(c.selectionState.value.mode).toBe('currentPage');
    c.onPageChange();
    expect(c.selectionState.value.mode).toBe('currentPage');
    expect(getSelectedIds(c)).toEqual(new Set(['1']));
  });

  it('allPages 翻页 → 保持状态不变', () => {
    c.selectAllPages();
    c.onCheckboxChange({ row: data.value[0], checked: false });
    const excludedBefore = getExcludedIds(c);
    c.onPageChange();
    expect(c.selectionState.value.mode).toBe('allPages');
    expect(getExcludedIds(c)).toEqual(excludedBefore);
  });

  it('none 翻页 → 无影响', () => {
    c.onPageChange();
    expect(c.selectionState.value.mode).toBe('none');
  });

  // ==================== toggleCurrentPage ====================

  it('toggleCurrentPage: none → 选中当前页', () => {
    c.toggleCurrentPage();
    expect(c.selectionState.value.mode).toBe('currentPage');
    expect(getSelectedIds(c)).toEqual(new Set(['1', '2', '3', '5']));
  });

  it('toggleCurrentPage: 全选后取消', () => {
    c.toggleCurrentPage();
    expect(c.currentPageAllSelected.value).toBe(true);
    c.toggleCurrentPage();
    expect(c.selectionState.value.mode).toBe('none');
  });

  // ==================== currentPageAllSelected / currentPageSelectedCount ====================

  it('currentPageAllSelected: 部分选中时为 false', () => {
    c.onCheckboxChange({ row: data.value[0], checked: true });
    expect(c.currentPageAllSelected.value).toBe(false);
    expect(c.currentPageSelectedCount.value).toBe(1);
  });

  it('currentPageAllSelected: 全部选中时为 true', () => {
    c.onCheckboxAll({ checked: true, records: [] });
    expect(c.currentPageAllSelected.value).toBe(true);
    expect(c.currentPageSelectedCount.value).toBe(4);
  });

  // ==================== 幂等性 / 边界 ====================

  it('allPages → selectAllPages 重置 excludedIds', () => {
    c.selectAllPages();
    c.onCheckboxChange({ row: data.value[0], checked: false });
    c.onCheckboxChange({ row: data.value[1], checked: false });
    expect(getExcludedIds(c).size).toBe(2);
    c.selectAllPages();
    expect(getExcludedIds(c)).toEqual(new Set());
    expect(c.isRowSelected(data.value[0])).toBe(true);
    expect(c.isRowSelected(data.value[1])).toBe(true);
  });

  it('clearSelection 在 none 模式下无副作用', () => {
    c.clearSelection();
    expect(c.selectionState.value.mode).toBe('none');
    expect(c.getSelectionPayload()).toEqual({ selectAll: false, selectedIds: [] });
  });

  it('none → onCheckboxAll checked=true → currentPage', () => {
    c.onCheckboxAll({ checked: true, records: [] });
    expect(c.selectionState.value.mode).toBe('currentPage');
    expect(getSelectedIds(c)).toEqual(new Set(['1', '2', '3', '5']));
  });

  it('none → onCheckboxAll checked=false → none', () => {
    c.onCheckboxAll({ checked: false, records: [] });
    expect(c.selectionState.value.mode).toBe('none');
  });

  it('currentPage: 全选后取消部分行', () => {
    c.onCheckboxAll({ checked: true, records: [] });
    c.onCheckboxChange({ row: data.value[0], checked: false });
    expect(getSelectedIds(c)).toEqual(new Set(['2', '3', '5']));
    expect(c.selectionState.value.mode).toBe('currentPage');
  });

  it('数据刷新: clearSelection 重置任何状态', () => {
    c.selectAllPages();
    c.onCheckboxChange({ row: data.value[0], checked: false });
    c.clearSelection();
    expect(c.selectionState.value.mode).toBe('none');
  });

  // ==================== checkableTotal 默认回退 ====================

  it('不传 checkableTotal 时默认等于 total', () => {
    const rows = [
      { id: '1', disabled: false },
      { id: '2', disabled: false },
    ];
    const dataRef = ref(rows) as any;
    const composable = useCrossPageSelect({
      rowKey: 'id',
      total: ref(2),
      data: dataRef,
    });
    composable.selectAllPages();
    expect(composable.checkableTotal.value).toBe(2);
    expect(composable.selectedCount.value).toBe(2);
  });

  // ==================== 完整流程 ====================

  it('完整流程: 勾选 → 全选所有页 → 排除 → 清除', () => {
    c.onCheckboxChange({ row: data.value[0], checked: true });
    c.onCheckboxChange({ row: data.value[1], checked: true });
    expect(c.selectionState.value.mode).toBe('currentPage');
    expect(c.getSelectionPayload()).toEqual({ selectAll: false, selectedIds: ['1', '2'] });

    c.selectAllPages();
    expect(c.selectionState.value.mode).toBe('allPages');
    expect(c.isRowSelected(data.value[2])).toBe(true);

    c.onCheckboxChange({ row: data.value[2], checked: false });
    c.onCheckboxChange({ row: data.value[4], checked: false });
    expect(c.getSelectionPayload()).toEqual({ selectAll: true, excludedIds: ['3', '5'] });

    c.onPageChange();
    expect(c.selectionState.value.mode).toBe('allPages');
    expect(getExcludedIds(c)).toEqual(new Set(['3', '5']));

    c.clearSelection();
    expect(c.selectionState.value.mode).toBe('none');
    expect(c.getSelectionPayload()).toEqual({ selectAll: false, selectedIds: [] });
  });

  it('完整流程: 全选 → 翻页取消当前页 → 翻页恢复当前页', () => {
    c.selectAllPages();

    // 模拟翻到第二页（替换 data）
    const page2 = [
      { id: '6', disabled: false },
      { id: '7', disabled: false },
    ];
    data.value = page2;
    c.onCheckboxAll({ checked: false, records: [] });
    expect(getExcludedIds(c)).toEqual(new Set(['6', '7']));

    // 翻回第一页
    data.value = [
      { id: '1', disabled: false },
      { id: '2', disabled: false },
      { id: '3', disabled: false },
      { id: '4', disabled: true },
      { id: '5', disabled: false },
    ];
    c.onCheckboxAll({ checked: true, records: [] });
    expect(getExcludedIds(c)).toEqual(new Set(['6', '7']));
    expect(c.isRowSelected(data.value[0])).toBe(true);
  });

  // ==================== allPages 排除全部行 → none ====================

  it('allPages: 逐行取消所有行 → 回退到 none', () => {
    c.selectAllPages();
    c.onCheckboxChange({ row: data.value[0], checked: false });
    c.onCheckboxChange({ row: data.value[1], checked: false });
    c.onCheckboxChange({ row: data.value[2], checked: false });
    c.onCheckboxChange({ row: data.value[4], checked: false });
    expect(c.selectionState.value.mode).toBe('none');
    expect(c.showBanner.value).toBe(false);
    expect(c.selectedCount.value).toBe(0);
  });

  it('allPages: 取消当前页全部行（等于全部可勾选行）→ 回退到 none', () => {
    c.selectAllPages();
    c.onCheckboxAll({ checked: false, records: [] });
    expect(c.selectionState.value.mode).toBe('none');
    expect(c.showBanner.value).toBe(false);
  });
});
