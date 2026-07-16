<script setup lang="ts">
/**
 * Ant Design Vue 组件展示容器。
 *
 * 按类别拆分为多个 block 子组件（见 ./antd/），本文件只负责排列，避免单文件膨胀。
 * 切换主色预设 / 亮暗模式时，各 block 内的主色、聚焦态、语义色应实时跟随。
 */
import AntdButtonsBlock from './antd/AntdButtons.block.vue';
import AntdFormsBlock from './antd/AntdForms.block.vue';
import AntdDateTimeBlock from './antd/AntdDateTime.block.vue';
import AntdNavigationBlock from './antd/AntdNavigation.block.vue';
import AntdFeedbackBlock from './antd/AntdFeedback.block.vue';
import AntdDataDisplayBlock from './antd/AntdDataDisplay.block.vue';
import AntdOverlayBlock from './antd/AntdOverlay.block.vue';

defineOptions({ name: 'AntdShowcaseSection' });
</script>

<template>
  <a-card title="② Ant Design Vue 组件">
    <AntdButtonsBlock />
    <AntdFormsBlock />
    <AntdDateTimeBlock />
    <AntdNavigationBlock />
    <AntdFeedbackBlock />
    <AntdDataDisplayBlock />
    <AntdOverlayBlock />
  </a-card>
</template>
