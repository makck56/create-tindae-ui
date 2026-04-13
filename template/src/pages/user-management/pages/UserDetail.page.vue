<script setup lang="ts">
/**
 * 用户详情 - 路由页 (Page Shell)
 */
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserDetail } from '../features/user/composables/useUser';
import UserDetailView from '../features/user/views/UserDetail.view.vue';

defineOptions({ name: 'UserManagementDetail' });

const route = useRoute();
const router = useRouter();
const { loading, user, fetchDetail } = useUserDetail();

function goBack() {
  router.push('/user-management');
}

onMounted(() => {
  const id = route.params.id as string;
  fetchDetail(id);
});
</script>

<template>
  <UserDetailView :user="user" :loading="loading" @back="goBack" />
</template>
