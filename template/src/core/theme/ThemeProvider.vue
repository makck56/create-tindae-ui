<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useThemeStore } from './stores/theme.store';
import { applyTokensToRoot } from './bridges/cssVariables';
import { injectThemeOverrideStyles } from './bridges/injectStyle';

/**
 * 主题 Provider —— 主题系统的「状态 → DOM 副作用」承接层。
 *
 * 用法：在 App.vue 根处包裹，承载所有业务路由：
 *   <ThemeProvider>
 *     <router-view />
 *   </ThemeProvider>
 *
 * 职责：
 * 1. 挂载时注入 antd / vxe 覆盖样式（幂等，仅一次）；
 * 2. 挂载时把当前主题应用到 :root；
 * 3. 监听主题变化（模式 / 预设），重新写入 :root 变量，三端自动联动。
 *
 * 本组件不渲染额外 DOM（纯 <slot />），副作用集中在此处，便于排查与测试。
 */
defineOptions({ name: 'ThemeProvider' });

const themeStore = useThemeStore();

/** 把当前 store 状态同步到 :root（写 CSS 变量 + data-theme） */
function syncToDom(): void {
  applyTokensToRoot(themeStore.currentTokens, themeStore.mode);
}

onMounted(() => {
  injectThemeOverrideStyles();
  syncToDom();
});

// currentTokens 是 computed，已派生 mode + presetKey，因此只需监听它一个源。
// 模式或预设任意变化都会触发重新计算 → 重新写 :root → 三端联动。
watch(() => themeStore.currentTokens, syncToDom);
</script>

<template>
  <!-- 纯透传：不增加 DOM 层级，仅承担主题副作用 -->
  <slot />
</template>
