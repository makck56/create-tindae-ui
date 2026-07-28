<script setup lang="ts">
import AntdButtonsBlock from './antd/AntdButtons.block.vue';
import AntdFormsBlock from './antd/AntdForms.block.vue';
import AntdDateTimeBlock from './antd/AntdDateTime.block.vue';
import AntdNavigationBlock from './antd/AntdNavigation.block.vue';
import AntdFeedbackBlock from './antd/AntdFeedback.block.vue';
import AntdDataDisplayBlock from './antd/AntdDataDisplay.block.vue';
import AntdOverlayBlock from './antd/AntdOverlay.block.vue';

/**
 * Ant Design Vue 组件展示容器。
 *
 * 各类组件拆到独立 block 中，当前文件只负责组合和统一间距。
 * 这样新增展示项时不需要在每个子组件里感知相邻模块，页面整体节奏也更稳定。
 */
defineOptions({ name: 'AntdShowcaseSection' });
</script>

<template>
  <a-card title="② Ant Design Vue 组件">
    <!-- 多个 block 连续展示时容易拥挤，统一用 space-y 拉开纵向距离。 -->
    <div class="theme-antd-stack space-y-6">
      <AntdButtonsBlock />
      <AntdFormsBlock />
      <AntdDateTimeBlock />
      <AntdNavigationBlock />
      <AntdFeedbackBlock />
      <AntdDataDisplayBlock />
      <AntdOverlayBlock />
    </div>
  </a-card>
</template>

<style scoped>
/*
 * Ant Design Vue 子组件自身带有 margin，尤其 Form、Tabs、Steps、Alert 等组件组合展示时，
 * 单靠 Tailwind 的 space-y 容易被后续组件样式抵消。这里用页面展示容器统一强制 block 间距。
 */
.theme-antd-stack {
  display: flex !important;
  flex-direction: column !important;
  gap: 24px !important;
}

/*
 * 子 block 内部的首个标题不再额外顶出一段 margin，避免和外层 gap 叠加后忽大忽小。
 * 后续标题仍保留 Antd block 自身的段落间隔。
 */
.theme-antd-stack :deep(> * > h4:first-child) {
  margin-top: 0 !important;
}
</style>
