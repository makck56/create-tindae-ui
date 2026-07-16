<script lang="tsx">
import { defineComponent, ref, computed, type PropType } from 'vue'
import { DownOutlined } from '@ant-design/icons-vue'
import APopover from 'ant-design-vue/es/popover'
import { VxeCheckbox } from 'vxe-table'
import { SELECTION_ALL_PAGES, SELECTION_NONE } from './types'
import type { SelectionState } from './types'

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
    const popoverVisible = ref(false)

    const checked = computed(() =>
      props.selectionState.mode === SELECTION_ALL_PAGES || props.currentPageAllSelected,
    )
    const indeterminate = computed(() =>
      props.selectionState.mode !== SELECTION_ALL_PAGES
      && !props.currentPageAllSelected
      && props.currentPageSelectedCount > 0,
    )

    return () => {
      const s = props.selectionState
      const isAllPages = s.mode === SELECTION_ALL_PAGES
      const isNone = s.mode === SELECTION_NONE

      return (
        <div class="flex items-center gap-0.5">
          <VxeCheckbox
            modelValue={checked.value}
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
                      isAllPages ? 'text-disabled cursor-not-allowed' : 'text-primary cursor-pointer',
                    ]}
                    onClick={() => {
                      if (!isAllPages) {
                        popoverVisible.value = false
                        emit('selectAllPages')
                      }
                    }}
                  >
                    全选所有页（共 {props.total} 条）
                  </div>
                  <div
                    class={[
                      'px-3 py-1.5 rounded whitespace-nowrap',
                      isNone ? 'text-disabled cursor-not-allowed' : 'text-danger cursor-pointer',
                    ]}
                    onClick={() => {
                      if (!isNone) {
                        popoverVisible.value = false
                        emit('clearSelection')
                      }
                    }}
                  >
                    取消选择所有
                  </div>
                </div>
              ),
            }}
          >
            <DownOutlined
              class="text-secondary cursor-pointer !text-[10px] px-0.5"
            />
          </APopover>
        </div>
      )
    }
  },
})
</script>
