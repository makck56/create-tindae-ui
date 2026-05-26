<template>
  <RoleListView />
</template>

<script setup lang="ts">
/**
 * role列表 - 路由页 (Page Shell)
 * @route /user-management/role/list
 *
 * 职责:
 * 1. 作为 keep-alive 的缓存锚点
 * 2. 从 $route 获取参数传递给 View
 * 3. 不包含任何业务逻辑
 */
import RoleListView from '../features/role/views/RoleList.view.vue';

defineOptions({ name: 'RoleListPage' });
</script>
