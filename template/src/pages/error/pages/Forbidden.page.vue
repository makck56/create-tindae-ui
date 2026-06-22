<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ROUTE_NAMES } from '@/shared/constants/routeNames';

defineOptions({ name: ROUTE_NAMES.Error.FORBIDDEN });

const router = useRouter();

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/');
  }
}
</script>

<template>
  <!-- 错误页渲染在 DefaultLayout 主内容区内（非整屏）：h-full 撑满内容区，min-h-[60vh] 兜底防塌缩 -->
  <div class="flex items-center justify-center h-full min-h-[60vh]">
    <a-result status="403" title="403" sub-title="抱歉，您没有权限访问此页面">
      <template #extra>
        <a-button type="primary" @click="goBack">返回</a-button>
      </template>
    </a-result>
  </div>
</template>
