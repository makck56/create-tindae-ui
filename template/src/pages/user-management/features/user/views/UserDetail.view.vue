<script setup lang="ts">
import { COPY } from '@/shared/constants/copy';
import type { User } from '../models/User';

defineOptions({ name: 'UserDetail' });

defineProps<{
  user: User | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'back'): void;
}>();
</script>

<template>
  <div>
    <a-page-header :title="user?.name ?? '用户详情'" @back="emit('back')" />

    <a-spin :spinning="loading">
      <a-descriptions bordered :column="2" class="mt-4" v-if="user">
        <a-descriptions-item label="用户名">{{ user.name }}</a-descriptions-item>
        <a-descriptions-item label="邮箱">{{ user.email }}</a-descriptions-item>
        <a-descriptions-item label="角色">{{ user.role }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="user.status === 'active' ? 'green' : 'red'">
            {{ user.status === 'active' ? '启用' : '禁用' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ user.createdAt }}</a-descriptions-item>
      </a-descriptions>
    </a-spin>
  </div>
</template>
