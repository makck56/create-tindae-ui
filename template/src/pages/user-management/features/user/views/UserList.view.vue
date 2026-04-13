<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserList } from '../composables/useUser';
import UserFilter from '../components/list/UserFilter.vue';
import { COPY } from '@/shared/constants/copy';

defineOptions({ name: 'UserList' });

const { loading, users, total, pagination, filters, fetchList, handleDelete, resetFilters } =
  useUserList();

onMounted(() => {
  fetchList();
});
</script>

<template>
  <div>
    <UserFilter
      v-model:name="filters.name"
      v-model:status="filters.status"
      v-model:role="filters.role"
      @search="fetchList"
      @reset="resetFilters"
    />

    <vxe-table :data="users" :loading="loading" border>
      <vxe-column field="name" title="用户名" />
      <vxe-column field="email" title="邮箱" />
      <vxe-column field="role" title="角色" />
      <vxe-column field="status" title="状态">
        <template #default="{ row }">
          <a-tag :color="row.status === 'active' ? 'green' : 'red'">
            {{ row.status === 'active' ? '启用' : '禁用' }}
          </a-tag>
        </template>
      </vxe-column>
      <vxe-column field="createdAt" title="创建时间" />
      <vxe-column title="操作" width="200">
        <template #default="{ row }">
          <a-button type="link" size="small" @click="$router.push(`/user-management/${row.id}`)">
            {{ COPY.COMMON.EDIT }}
          </a-button>
          <a-popconfirm title="确定删除？" @confirm="handleDelete(row.id)">
            <a-button type="link" danger size="small">{{ COPY.COMMON.DELETE }}</a-button>
          </a-popconfirm>
        </template>
      </vxe-column>
    </vxe-table>

    <div class="mt-4 flex justify-end">
      <a-pagination
        v-model:current="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="total"
        show-size-changer
        @change="fetchList"
      />
    </div>
  </div>
</template>
