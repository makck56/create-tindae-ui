<script setup lang="ts">
import { useRouter } from 'vue-router';

defineOptions({ name: 'NotFound' });

const router = useRouter();

function goHome() {
  router.push('/');
}
</script>

<template>
  <!-- 错误页渲染在 DefaultLayout 主内容区内（非整屏）：h-full 撑满内容区，min-h-[60vh] 兜底防塌缩 -->
  <div class="flex items-center justify-center h-full min-h-[60vh]">
    <a-result status="404" title="404" sub-title="抱歉，您访问的页面不存在">
      <template #extra>
        <a-button type="primary" @click="goHome">返回首页</a-button>
      </template>
    </a-result>
  </div>
</template>
