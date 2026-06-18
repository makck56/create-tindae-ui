<script setup lang="ts">
import { useRouter } from 'vue-router';

defineOptions({ name: 'NotFound' });

const router = useRouter();

function goHome() {
  router.push('/');
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <a-result status="404" title="404" sub-title="抱歉，您访问的页面不存在">
      <template #extra>
        <a-button type="primary" @click="goHome">返回首页</a-button>
      </template>
    </a-result>
  </div>
</template>
