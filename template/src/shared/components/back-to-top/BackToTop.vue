<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { VerticalAlignTopOutlined } from '@ant-design/icons-vue';

/**
 * 返回顶部按钮。
 *
 * - 监听 window 整页滚动（本脚手架 DefaultLayout 的内容区无独立滚动容器，长页面靠 body 滚动）；
 * - 滚动距离超过 visibilityHeight 才淡入显示，避免页面顶部时也出现按钮；
 * - 点击平滑滚动回顶部；样式为科技风（主色描边 + 发光 + 毛玻璃），跟随主题系统。
 *
 * 放在任意长页面末尾即可：<BackToTop />（fixed 定位，不占文档流）。
 */
defineOptions({ name: 'BackToTop' });

const props = withDefaults(
  defineProps<{
    /** 滚动超过此距离（px）才显示按钮 */
    visibilityHeight?: number;
  }>(),
  { visibilityHeight: 300 },
);

const visible = ref(false);

function handleScroll(): void {
  visible.value = window.scrollY > props.visibilityHeight;
}

function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

onMounted(() => {
  // passive：只读滚动位置，不阻止滚动，提升滚动性能
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // 初始判定（刷新时若已停在页面下方也要显示）
});
onBeforeUnmount(() => window.removeEventListener('scroll', handleScroll));
</script>

<template>
  <Transition name="backtop">
    <button
      v-show="visible"
      class="back-to-top"
      type="button"
      aria-label="返回顶部"
      title="返回顶部"
      @click="scrollToTop"
    >
      <VerticalAlignTopOutlined />
    </button>
  </Transition>
</template>

<style scoped>
.back-to-top {
  position: fixed;
  right: 32px;
  bottom: 32px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  border-radius: 50%;
  cursor: pointer;
  color: var(--color-primary);
  background: color-mix(in srgb, var(--bg-container) 72%, var(--color-primary));
  border: 1px solid color-mix(in srgb, var(--color-primary) 40%, transparent);
  box-shadow: 0 0 20px color-mix(in srgb, var(--color-primary) 28%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 100;
  transition: transform 0.2s, box-shadow 0.2s;
}

.back-to-top:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 28px color-mix(in srgb, var(--color-primary) 48%, transparent);
}

.back-to-top :deep(svg) {
  filter: drop-shadow(0 0 8px color-mix(in srgb, var(--color-primary) 55%, transparent));
}

/* 淡入淡出 + 轻微上移 */
.backtop-enter-active,
.backtop-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.backtop-enter-from,
.backtop-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
