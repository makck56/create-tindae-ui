<script setup lang="ts">
import { useUserList } from '../composables/useUser';
import UserFilter from '../components/UserFilter.vue';
import { COPY } from '@/shared/constants/copy';

defineOptions({ name: 'UserList' });

const { gridRef, gridOptions, filters, handleSearch, resetFilters, handleDelete } = useUserList();
</script>

<template>
  <div>
    <UserFilter
      v-model:name="filters.name"
      v-model:status="filters.status"
      v-model:role="filters.role"
      @search="handleSearch"
      @reset="resetFilters"
    />

    <vxe-grid ref="gridRef" v-bind="gridOptions" border>
      <template #status_default="{ row }">
        <a-tag :color="row.status === 'active' ? 'green' : 'red'">
          {{ row.status === 'active' ? '启用' : '禁用' }}
        </a-tag>
      </template>
      <template #actions_default="{ row }">
        <a-button type="link" size="small" @click="$router.push(`/user-management/${row.id}`)">
          {{ COPY.COMMON.EDIT }}
        </a-button>
        <a-popconfirm title="确定删除？" @confirm="handleDelete(row.id)">
          <a-button type="link" danger size="small">{{ COPY.COMMON.DELETE }}</a-button>
        </a-popconfirm>
      </template>
    </vxe-grid>
  </div>
</template>
