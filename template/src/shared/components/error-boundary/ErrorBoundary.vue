<script setup lang="ts">
import { ref, onErrorCaptured, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

/**
 * 错误边界组件：包裹业务内容区（router-view），用 onErrorCaptured 捕获子树渲染异常。
 * 捕获后显示 fallback UI，避免整页白屏，并提供「重试 / 返回首页」操作。
 *
 * 与 bootstrap 的全局 app.config.errorHandler 分工：
 * - 本组件捕获「渲染期」错误，展示局部 fallback，保留侧边栏、顶栏、页签等布局壳。
 * - app.config.errorHandler 兜底「非渲染期」错误，例如事件回调、未捕获 Promise 等。
 *
 * 注意：ErrorBoundary 位于 DefaultLayout 内，生命周期长于具体页面组件。
 * 因此某个页面失败后，必须在路由切换时清空错误态，否则切到其它页面仍会显示旧失败态。
 */
defineOptions({ name: 'ErrorBoundary' });

const error = ref<unknown>(null);
const route = useRoute();
const router = useRouter();

onErrorCaptured((err) => {
  error.value = err;
  if (import.meta.env.DEV) {
    console.error('[error-boundary] 渲染异常:', err);
  }
  // 生产环境可在此接入错误上报（Sentry / 自建埋点）。
  // 返回 false 表示错误已由本边界处理，不再继续向上冒泡。
  return false;
});

watch(
  () => route.fullPath,
  () => {
    // 路由真正变化时清空旧错误，让新的 router-view 内容可以重新挂载和渲染。
    if (error.value) {
      error.value = null;
    }
  },
);

/** 重试：清空错误态，Vue 会重新渲染 slot（router-view 内容）。 */
function retry() {
  error.value = null;
}

/** 返回首页并清空错误态。 */
function goHome() {
  error.value = null;
  router.push('/');
}
</script>

<template>
  <template v-if="error">
    <div class="flex items-center justify-center min-h-[60vh]">
      <a-result
        status="error"
        title="页面加载失败"
        sub-title="抱歉，页面出现异常，请重试或返回首页"
      >
        <template #extra>
          <a-button type="primary" @click="retry">重试</a-button>
          <a-button @click="goHome">返回首页</a-button>
        </template>
      </a-result>
    </div>
  </template>
  <slot v-else />
</template>
