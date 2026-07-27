<script lang="tsx">
import { DownOutlined } from '@ant-design/icons-vue';
import ACheckbox from 'ant-design-vue/es/checkbox';
import APopover from 'ant-design-vue/es/popover';
import { computed, defineComponent, ref, type PropType } from 'vue';
import { SELECTION_ALL_PAGES, SELECTION_NONE } from './types';
import type { SelectionState } from './types';

export default defineComponent({
  name: 'CrossPageCheckboxHeader',
  props: {
    selectionState: { type: Object as PropType<SelectionState>, required: true },
    total: { type: Number, required: true },
    currentPageAllSelected: { type: Boolean, required: true },
    currentPageSelectedCount: { type: Number, required: true },
  },
  emits: ['selectAllPages', 'clearSelection', 'toggleCurrentPage'],
  setup(props, { emit }) {
    const popoverVisible = ref(false);

    const checked = computed(
      () => props.selectionState.mode === SELECTION_ALL_PAGES || props.currentPageAllSelected,
    );

    const indeterminate = computed(
      () =>
        props.selectionState.mode !== SELECTION_ALL_PAGES
        && !props.currentPageAllSelected
        && props.currentPageSelectedCount > 0,
    );

    function handleSelectAllPages() {
      if (props.selectionState.mode === SELECTION_ALL_PAGES) return;
      popoverVisible.value = false;
      emit('selectAllPages');
    }

    function handleClearSelection() {
      if (props.selectionState.mode === SELECTION_NONE) return;
      popoverVisible.value = false;
      emit('clearSelection');
    }

    return () => (
      <div class="flex items-center gap-0.5">
        <ACheckbox
          checked={checked.value}
          indeterminate={indeterminate.value}
          onChange={() => emit('toggleCurrentPage')}
        />
        <APopover
          v-model:visible={popoverVisible.value}
          trigger="click"
          placement="bottomLeft"
          v-slots={{
            content: () => (
              <div class="min-w-[120px]">
                <div
                  class={[
                    'px-3 py-1.5 rounded whitespace-nowrap',
                    props.selectionState.mode === SELECTION_ALL_PAGES
                      ? 'text-disabled cursor-not-allowed'
                      : 'text-primary cursor-pointer',
                  ]}
                  onClick={handleSelectAllPages}
                >
                  全选所有页（共 {props.total} 条）
                </div>
                <div
                  class={[
                    'px-3 py-1.5 rounded whitespace-nowrap',
                    props.selectionState.mode === SELECTION_NONE
                      ? 'text-disabled cursor-not-allowed'
                      : 'text-danger cursor-pointer',
                  ]}
                  onClick={handleClearSelection}
                >
                  取消选择所有项
                </div>
              </div>
            ),
          }}
        >
          <DownOutlined class="text-secondary cursor-pointer !text-[10px] px-0.5" />
        </APopover>
      </div>
    );
  },
});
</script>
