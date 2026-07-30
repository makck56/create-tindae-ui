<script setup lang="ts">
import { computed } from 'vue';
import { useUserList } from '../composables/useUser';
import { UserStatuses, UserStatusOptions, UserRoleOptions, type User } from '../models/User';
import { useCrossPageGrid } from '@/shared/components/cross-page-select';
import { PageWrapper } from '@/shared/components/page-wrapper';
import { QueryFilter, type FilterItemConfig } from '@/shared/components/query-filter';
import { COPY } from '@/shared/constants/copy';

defineOptions({ name: 'UserList' });

const { gridRef, gridOptions, filters, currentData, currentTotal, handleSearch, resetFilters, handleDelete } = useUserList();

// 跨页勾选：gridRef 同一实例既负责查询(commitProxy)又负责勾选同步(clear/setCheckboxRow)；
// currentData/currentTotal 由 useUserList 在每次查询后同步，供选中态判定与表头全选计数。
const { checkboxColumn, handleCheckboxChange, handleCheckboxAll } = useCrossPageGrid<User>({
  gridRef,
  rowKey: 'id',
  data: currentData,
  total: currentTotal,
});

// 合并最终 grid props：业务配置(剔除 columns) + 勾选列置首的完整列定义。
// 改为单一 columns 通道——此前「v-bind gridOptions + :columns」双通道疑似互相覆盖，
// 导致勾选列未被 vxe-grid 渲染；这里保证勾选列一定进入 vxe。
const tableProps = computed(() => {
  const { columns, ...rest } = gridOptions;
  return {
    ...rest,
    columns: [checkboxColumn.value, ...columns],
  };
});

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

    <vxe-grid
      ref="gridRef"
      v-bind="tableProps"
      border
      height="auto"
      @checkbox-change="handleCheckboxChange"
      @checkbox-all="handleCheckboxAll"
    >
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
