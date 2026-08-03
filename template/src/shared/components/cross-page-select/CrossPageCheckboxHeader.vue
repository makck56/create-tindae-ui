<script setup lang="ts">
import { DownOutlined } from '@ant-design/icons-vue';
import { computed, ref } from 'vue';
import { SELECTION_ALL_PAGES, SELECTION_NONE } from './types';
import type { SelectionState } from './types';

defineOptions({ name: 'CrossPageCheckboxHeader' });

const props = defineProps<{
  selectionState: SelectionState;
  total: number;
  currentPageAllSelected: boolean;
  currentPageSelectedCount: number;
}>();

const emit = defineEmits<{
  selectAllPages: [];
  clearSelection: [];
  toggleCurrentPage: [];
}>();

const popoverVisible = ref(false);

// 表头复选框代表两层含义：跨页全选时强制选中；否则跟随当前页是否全选。
const checked = computed(
  () => props.selectionState.mode === SELECTION_ALL_PAGES || props.currentPageAllSelected,
);

// 半选只表达「当前页有部分选中」，跨页全选时不再显示半选态，避免状态含义冲突。
const indeterminate = computed(
  () =>
    props.selectionState.mode !== SELECTION_ALL_PAGES &&
    !props.currentPageAllSelected &&
    props.currentPageSelectedCount > 0,
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
</script>

<template>
  <div class="flex items-center gap-0.5">
    <a-checkbox
      :checked="checked"
      :indeterminate="indeterminate"
      @change="emit('toggleCurrentPage')"
    />
    <a-popover v-model:open="popoverVisible" trigger="click" placement="bottomLeft">
      <template #content>
        <div class="min-w-[120px]">
          <div
            class="px-3 py-1.5 rounded whitespace-nowrap"
            :class="
              selectionState.mode === SELECTION_ALL_PAGES
                ? 'text-disabled cursor-not-allowed'
                : 'text-primary cursor-pointer'
            "
            @click="handleSelectAllPages"
          >
            全选所有页（共 {{ total }} 条）
          </div>
          <div
            class="px-3 py-1.5 rounded whitespace-nowrap"
            :class="
              selectionState.mode === SELECTION_NONE
                ? 'text-disabled cursor-not-allowed'
                : 'text-danger cursor-pointer'
            "
            @click="handleClearSelection"
          >
            取消选择所有项
          </div>
        </div>
      </template>
      <DownOutlined class="text-secondary cursor-pointer !text-[10px] px-0.5" />
    </a-popover>
  </div>
</template>
