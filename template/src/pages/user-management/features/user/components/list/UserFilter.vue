<script setup lang="ts">
import type { UserStatus, UserRole } from '../models/User';
import { UserStatusOptions, UserRoleOptions } from '../models/User';

defineProps<{
  name?: string;
  status?: UserStatus;
  role?: UserRole;
}>();

const emit = defineEmits<{
  (e: 'search'): void;
  (e: 'update:name', value: string | undefined): void;
  (e: 'update:status', value: UserStatus | undefined): void;
  (e: 'update:role', value: UserRole | undefined): void;
  (e: 'reset'): void;
}>();
</script>

<template>
  <a-form layout="inline" class="mb-4">
    <a-form-item label="用户名">
      <a-input
        :value="name"
        placeholder="请输入用户名"
        allow-clear
        @update:value="emit('update:name', $event)"
      />
    </a-form-item>
    <a-form-item label="状态">
      <a-select
        :value="status"
        placeholder="请选择状态"
        allow-clear
        style="width: 120px"
        :options="UserStatusOptions"
        @update:value="emit('update:status', $event)"
      />
    </a-form-item>
    <a-form-item label="角色">
      <a-select
        :value="role"
        placeholder="请选择角色"
        allow-clear
        style="width: 120px"
        :options="UserRoleOptions"
        @update:value="emit('update:role', $event)"
      />
    </a-form-item>
    <a-form-item>
      <a-button type="primary" @click="emit('search')">查询</a-button>
      <a-button class="ml-2" @click="emit('reset')">重置</a-button>
    </a-form-item>
  </a-form>
</template>
