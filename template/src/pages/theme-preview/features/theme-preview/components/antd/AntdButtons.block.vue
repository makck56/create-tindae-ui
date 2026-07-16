<script setup lang="ts">
import { message } from 'ant-design-vue';

/**
 * Ant Design Vue「按钮」展示块。
 *
 * 按钮是主色最直接的承载者：切换主色预设时，
 * primary / link / danger / 聚焦态都应实时跟随变化。
 */
defineOptions({ name: 'AntdButtonsBlock' });

/** 点击演示：弹出 message（message 同样跟随主题主色） */
function handleClick(): void {
  message.success('操作成功（message 也跟随主题色）');
}
</script>

<template>
  <!-- 按钮：覆盖全部 type 与交互状态 -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">按钮 Button</h4>
  <a-space wrap class="mb-2">
    <a-button type="primary" @click="handleClick">Primary</a-button>
    <a-button>Default</a-button>
    <a-button type="dashed">Dashed</a-button>
    <a-button type="link">Link</a-button>
    <a-button type="text">Text</a-button>
    <a-button type="primary" danger>Danger</a-button>
    <a-button type="primary" disabled>Disabled</a-button>
    <a-button type="primary" loading>Loading</a-button>
  </a-space>
</template>
