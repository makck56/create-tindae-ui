<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { VerticalAlignTopOutlined } from '@ant-design/icons-vue';

/**
 * 返回顶部按钮。
 *
 * 滚动容器自适应：onMounted 时从按钮向上找最近的可滚动祖先（overflow-y: auto/scroll）；
 * 找不到（整页滚动场景）则回落到 window。这样无论布局是「整页滚动」还是「内容区独立滚动」都能工作。
 *
 * - 滚动距离超过 visibilityHeight 才淡入显示；
 * - 点击平滑滚动回容器顶部；科技风样式跟随主题。
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

const btnRef = ref<HTMLElement>();
const visible = ref(false);

// 实际监听的滚动容器：window（整页滚动）或内容区（独立滚动）。onMounted 时确定。
let scrollTarget: HTMLElement | Window = window;

function getScrollTop(): number {
  return scrollTarget === window ? window.scrollY : (scrollTarget as HTMLElement).scrollTop;
}

function handleScroll(): void {
  visible.value = getScrollTop() > props.visibilityHeight;
}

function scrollToTop(): void {
  (scrollTarget as HTMLElement | Window).scrollTo({ top: 0, behavior: 'smooth' });
}

/** 从 el 向上找第一个 overflowY 为 auto/scroll/overlay 的祖先；到 body 前未命中则回落 window。 */
function findScrollParent(el: HTMLElement | null): HTMLElement | Window {
  let node = el?.parentElement ?? null;
  while (node && node !== document.body) {
    if (/(auto|scroll|overlay)/.test(getComputedStyle(node).overflowY)) return node;
    node = node.parentElement;
  }
  return window;
}

onMounted(() => {
  scrollTarget = findScrollParent(btnRef.value);
  // passive：只读滚动位置，不阻止滚动，提升性能
  scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // 初始判定（刷新时若已停在下方也要显示）
});
onBeforeUnmount(() => scrollTarget.removeEventListener('scroll', handleScroll));
</script>

<template>
  <Transition name="backtop">
    <button
      v-show="visible"
      ref="btnRef"
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
  transition:
    transform 0.2s,
    box-shadow 0.2s;
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
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.backtop-enter-from,
.backtop-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
