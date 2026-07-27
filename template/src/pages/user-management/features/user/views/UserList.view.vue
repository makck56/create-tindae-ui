<script setup lang="ts">
import { useUserList } from '../composables/useUser';
import { UserStatuses, UserStatusOptions, UserRoleOptions } from '../models/User';
import { PageWrapper } from '@/shared/components/page-wrapper';
import { QueryFilter, type FilterItemConfig } from '@/shared/components/query-filter';
import { COPY } from '@/shared/constants/copy';

defineOptions({ name: 'UserList' });

const { gridRef, gridOptions, filters, handleSearch, resetFilters, handleDelete } = useUserList();

const filterConfig: FilterItemConfig[] = [
  { type: 'input', label: '用户名', name: 'name', fieldProps: { placeholder: '请输入用户名', allowClear: true } },
  { type: 'select', label: '状态', name: 'status', fieldProps: { placeholder: '请选择状态', allowClear: true, options: UserStatusOptions, style: { width: '120px' } } },
  { type: 'select', label: '角色', name: 'role', fieldProps: { placeholder: '请选择角色', allowClear: true, options: UserRoleOptions, style: { width: '120px' } } },
];

const STATUS_COLOR_MAP: Record<string, string> = {
  [UserStatuses.ACTIVE]: 'green',
  [UserStatuses.INACTIVE]: 'red',
};

function getStatusLabel(status: string) {
  return UserStatusOptions.find((o) => o.value === status)?.label ?? status;
}
</script>

<template>
  <PageWrapper>
    <template #search>
      <QueryFilter
        v-model="filters"
        :config="filterConfig"
        @search="handleSearch"
        @reset="resetFilters"
      />
    </template>

    <vxe-grid ref="gridRef" v-bind="gridOptions" border height="auto">
      <template #status_default="{ row }">
        <a-tag :color="STATUS_COLOR_MAP[row.status]">
          {{ getStatusLabel(row.status) }}
        </a-tag>
      </template>
      <template #actions_default="{ row }">
        <a-button type="link" size="small" @click="$router.push(`/user-management/${row.id}`)">
          {{ COPY.COMMON.EDIT }}
        </a-button>
        <a-popconfirm v-permission="'UserManagement:delete'" title="确定删除？" @confirm="handleDelete(row.id)">
          <a-button type="link" danger size="small">{{ COPY.COMMON.DELETE }}</a-button>
        </a-popconfirm>
      </template>
    </vxe-grid>
  </PageWrapper>
</template>
