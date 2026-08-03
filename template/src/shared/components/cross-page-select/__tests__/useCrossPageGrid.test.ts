import { describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';
import { useCrossPageGrid } from '../useCrossPageGrid';

vi.mock('../CrossPageCheckboxHeader.vue', () => ({
  default: { name: 'CrossPageCheckboxHeader' },
}));

interface Row {
  id: string;
  disabled?: boolean;
}

function createGridComposable() {
  const data = ref<Row[]>([{ id: '1' }, { id: '2', disabled: true }, { id: '3' }]);

  const clearCheckboxRow = vi.fn();
  const setCheckboxRow = vi.fn();
  const gridRef = ref({
    clearCheckboxRow,
    setCheckboxRow,
  });

  const composable = useCrossPageGrid<Row>({
    gridRef,
    rowKey: 'id',
    total: ref(3),
    data,
    isDisabled: (row) => row.disabled === true,
  });

  return {
    composable,
    data,
    clearCheckboxRow,
    setCheckboxRow,
  };
}

describe('useCrossPageGrid', () => {
  it('勾选变化后会同步 grid checkbox 视觉状态，但跳过禁用行', async () => {
    const { composable, clearCheckboxRow, setCheckboxRow, data } = createGridComposable();

    composable.handleCheckboxChange({ row: data.value[0], checked: true });
    composable.handleCheckboxChange({ row: data.value[2], checked: true });
    await nextTick();
    await nextTick();

    expect(clearCheckboxRow).toHaveBeenCalled();
    expect(setCheckboxRow).toHaveBeenCalledWith([{ id: '1' }, { id: '3' }], true);
  });

  it('同步期间忽略回流事件，避免递归改写选择状态', async () => {
    const { composable, data } = createGridComposable();

    composable.handleCheckboxChange({ row: data.value[0], checked: true });
    await nextTick();

    composable.handleCheckboxChange({ row: data.value[2], checked: false });

    expect(composable.isRowSelected(data.value[0])).toBe(true);
  });

  it('表头列会输出 header 插槽，供跨页选择头部组件渲染', () => {
    const { composable } = createGridComposable();
    const headerSlot = composable.checkboxColumn.value.slots.header;

    expect(composable.checkboxColumn.value.type).toBe('checkbox');
    expect(composable.checkboxColumn.value.width).toBe(60);
    expect(typeof headerSlot).toBe('function');
    expect(headerSlot()).toBeTruthy();
  });
  it('跨页全选后翻页回来，会在 VXE 数据替换完成后再次恢复当前页勾选态', async () => {
    vi.useFakeTimers();
    try {
      const { composable, data, clearCheckboxRow, setCheckboxRow } = createGridComposable();

      composable.selectAllPages();
      await nextTick();
      await nextTick();
      vi.runOnlyPendingTimers();

      clearCheckboxRow.mockClear();
      setCheckboxRow.mockClear();

      data.value = [{ id: '4' }, { id: '5' }];
      await nextTick();
      await nextTick();

      // 模拟 VXE proxyConfig 在首轮同步之后刷新内部数据，并清掉了 checkbox 视觉状态。
      clearCheckboxRow.mockClear();
      setCheckboxRow.mockClear();

      vi.runOnlyPendingTimers();

      expect(clearCheckboxRow).toHaveBeenCalled();
      expect(setCheckboxRow).toHaveBeenCalledWith([{ id: '4' }, { id: '5' }], true);
    } finally {
      vi.useRealTimers();
    }
  });
});
