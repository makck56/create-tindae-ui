<script setup lang="ts">
import UserListView from '../features/user/views/UserList.view.vue';
import { ROUTE_NAMES } from '@/shared/constants/routeNames';

defineOptions({ name: ROUTE_NAMES.UserManagement.USER_MANAGEMENT });
</script>

<template>
  <UserListView />
</template>
