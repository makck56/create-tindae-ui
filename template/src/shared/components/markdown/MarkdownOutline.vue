<script setup lang="ts">
import type { Heading } from './heading';

/**
 * Markdown 文档大纲（科技风，跟随主题系统，与 MarkdownViewer 配套）。
 *
 * - 接收 MarkdownViewer 渲染后提取的标题列表（slug 即 <hN> 真实 id）；
 * - 按层级缩进渲染；点击用 getElementById + scrollIntoView 跳转——
 *   刻意不改 location.hash，规避中文 id 在 URL 中的编码问题。
 */
defineOptions({ name: 'MarkdownOutline' });

defineProps<{
  headings: Heading[];
}>();

/** 跳转到对应标题（平滑滚动，标题已设 scroll-margin-top 避开顶栏）。 */
function scrollTo(slug: string): void {
  document.getElementById(slug)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
</script>

<template>
  <nav v-if="headings.length" class="markdown-outline">
    <div class="title">大纲</div>
    <ul class="list">
      <li
        v-for="h in headings"
        :key="h.slug"
        class="item"
        :class="[`level-${h.level}`]"
        :style="{ paddingLeft: `${Math.min(h.level - 1, 4) * 14 + 12}px` }"
        :title="h.text"
        @click="scrollTo(h.slug)"
      >
        {{ h.text }}
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.markdown-outline {
  position: sticky;
  top: 16px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  padding: 14px 16px;
  /* 主色调底 + 主色描边 + 发光，跟随主题 */
  background: color-mix(in srgb, var(--bg-container) 90%, var(--color-primary));
  border: 1px solid color-mix(in srgb, var(--color-primary) 28%, transparent);
  border-radius: 12px;
  box-shadow: 0 0 30px color-mix(in srgb, var(--color-primary) 6%, transparent);
}

.title {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
  letter-spacing: 0.15em;
  margin-bottom: 10px;
  padding: 0 2px;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.item {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  border-left: 2px solid transparent;
  transition: color 0.15s, background-color 0.15s, border-color 0.15s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item:hover {
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  border-left-color: var(--color-primary);
}

/* h1 高亮、h4+ 弱化，体现层级 */
.level-1 {
  font-weight: 600;
  color: var(--text-title);
}
.level-4,
.level-5,
.level-6 {
  font-size: 12px;
  opacity: 0.8;
}
</style>
