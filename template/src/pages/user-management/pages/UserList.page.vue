<script setup lang="ts">
/**
 * 用户列表 - 路由页 (Page Shell)
 */
defineOptions({ name: 'UserManagement' });
</script>

<template>
  <UserList.view />
</template>

<script lang="ts">
import UserListView from '../features/user/views/UserList.view.vue';

export default {
  components: { 'UserList.view': UserListView },
};
</script>
