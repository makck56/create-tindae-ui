<script setup lang="ts">
import { useRoleList } from '../composables/useRoleList';
import { RoleStatuses, RoleStatusOptions } from '../models/Role';
import { COPY } from '@/shared/constants/copy';

defineOptions({ name: 'RoleList' });

const { gridRef, gridOptions, handleSearch, handleDelete } = useRoleList();

const STATUS_COLOR_MAP: Record<string, string> = {
  [RoleStatuses.ACTIVE]: 'green',
  [RoleStatuses.INACTIVE]: 'red',
};

function getStatusLabel(status: string) {
  return RoleStatusOptions.find((o) => o.value === status)?.label ?? status;
}
</script>

<template>
  <!-- sort-change 显式刷新 proxy 查询：兜住 vxe 4.20.x 图标状态变化但 ajax 未重新触发的运行时场景。 -->
  <vxe-grid ref="gridRef" v-bind="gridOptions" border @sort-change="handleSearch">
    <template #status_default="{ row }">
      <a-tag :color="STATUS_COLOR_MAP[row.status]">
        {{ getStatusLabel(row.status) }}
      </a-tag>
    </template>
    <template #actions_default="{ row }">
      <a-popconfirm title="确定删除？" @confirm="handleDelete(row.id)">
        <a-button type="link" danger size="small">{{ COPY.COMMON.DELETE }}</a-button>
      </a-popconfirm>
    </template>
  </vxe-grid>
</template>
