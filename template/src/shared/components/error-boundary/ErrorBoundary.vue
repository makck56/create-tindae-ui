<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';
import { useRouter } from 'vue-router';

/**
 * 错误边界组件：包裹业务内容区（router-view），用 onErrorCaptured 捕获子树渲染异常，
 * 显示 fallback UI（避免整页白屏），并提供「重试 / 返回首页」。
 *
 * 与 bootstrap 的全局 app.config.errorHandler 分工配合：
 * - 本组件捕获「渲染期」错误 → 局部 fallback，保留布局壳（侧边栏/顶栏仍可用）；
 * - app.config.errorHandler 兜底「非渲染期」错误（事件回调、setup 同步异常、未捕获 Promise）。
 *
 * onErrorCaptured 返回 false → 阻止错误继续向上冒泡（已被本边界处理）。
 */
defineOptions({ name: 'ErrorBoundary' });

const error = ref<unknown>(null);
const router = useRouter();

onErrorCaptured((err) => {
  error.value = err;
  if (import.meta.env.DEV) {
    console.error('[error-boundary] 渲染异常:', err);
  }
  // 生产环境可在此接入错误上报（Sentry / 自建埋点）
  return false;
});

/** 重试：清空错误态，Vue 自动重新渲染 slot（router-view 内容） */
function retry() {
  error.value = null;
}

/** 返回首页并清空错误态 */
function goHome() {
  error.value = null;
  router.push('/');
}
</script>

<template>
  <template v-if="error">
    <div class="flex items-center justify-center min-h-[60vh]">
      <a-result status="error" title="页面加载失败" sub-title="抱歉，页面出现异常，请重试或返回首页">
        <template #extra>
          <a-button type="primary" @click="retry">重试</a-button>
          <a-button @click="goHome">返回首页</a-button>
        </template>
      </a-result>
    </div>
  </template>
  <slot v-else />
</template>
