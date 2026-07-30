<script setup lang="ts">
import { useRoleList } from '../composables/useRoleList';
import { RoleStatuses, RoleStatusOptions } from '../models/Role';
import { COPY } from '@/shared/constants/copy';

defineOptions({ name: 'RoleList' });

const { gridRef, gridOptions, handleDelete } = useRoleList();

const STATUS_COLOR_MAP: Record<string, string> = {
  [RoleStatuses.ACTIVE]: 'green',
  [RoleStatuses.INACTIVE]: 'red',
};

function getStatusLabel(status: string) {
  return RoleStatusOptions.find((o) => o.value === status)?.label ?? status;
}
</script>

<template>
  <vxe-grid ref="gridRef" v-bind="gridOptions" border>
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
