<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
// Ant Design Vue 中文语言包：让分页、表格空状态、确认弹窗按钮等组件文案统一为中文。
import zhCN from 'ant-design-vue/es/locale/zh_CN';

// DEV 专属：Token 续期观测面板。
// 开启条件：开发环境（DEV）且未被 VITE_DEV_TOKEN_PANEL 显式关闭。
//   - 默认开启；在 .env.development 设 VITE_DEV_TOKEN_PANEL=false 可彻底关闭。
// 用 defineAsyncComponent + 编译期常量三元：生产构建 DEV=false → 整段死代码，面板不进产物。
const tokenPanelEnabled =
  import.meta.env.DEV && import.meta.env.VITE_DEV_TOKEN_PANEL !== 'false';
const TokenDevPanel = tokenPanelEnabled
  ? defineAsyncComponent(() => import('@/core/dev/TokenDevPanel.vue'))
  : null;
</script>

<template>
  <!-- :locale="zhCN" 全局中文化；未来主题 token / 动态 locale 也可在此扩展 -->
  <a-config-provider :locale="zhCN">
    <router-view />
    <!-- 仅开发环境渲染的 Token 续期观测面板 -->
    <component :is="TokenDevPanel" v-if="TokenDevPanel" />
  </a-config-provider>
</template>
