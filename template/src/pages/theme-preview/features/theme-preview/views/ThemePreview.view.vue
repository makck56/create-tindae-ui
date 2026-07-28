<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from '@/core/theme';
import ColorPaletteSection from '../components/ColorPalette.section.vue';
import AntdShowcaseSection from '../components/AntdShowcase.section.vue';
import VxeTableShowcaseSection from '../components/VxeTableShowcase.section.vue';
import EchartsShowcaseSection from '../components/EchartsShowcase.section.vue';
import CardShowcaseSection from '../components/CardShowcase.section.vue';

/**
 * 主题预览页容器。
 *
 * 本页用于集中观察 Tailwind / Ant Design Vue / VXE Table / ECharts 在主题切换后的联动效果。
 * 与业务页不同，预览页更像组件陈列面板，需要留出更宽松的垂直节奏，避免组件密集堆叠后难以判断视觉状态。
 */
defineOptions({ name: 'ThemePreviewView' });

const { mode, presetKey, presets } = useTheme();

/** 当前主题预设中文名，用于顶部状态展示。 */
const presetLabel = computed(
  () => presets.find((p) => p.key === presetKey.value)?.label ?? presetKey.value,
);
</script>

<template>
  <div class="theme-preview-page flex flex-col gap-6 lg:gap-8">
    <!-- 顶部说明与当前主题状态使用语义色，亮色 / 暗色模式下会自动适配。 -->
    <div
      class="flex flex-wrap items-start justify-between gap-6 rounded-lg border border-light bg-[var(--bg-container)] p-6"
    >
      <div class="min-w-0">
        <h2 class="m-0 mb-3 text-2xl font-bold text-title">主题预览</h2>
        <p class="m-0 text-sm leading-relaxed text-secondary">
          统一配置 Tailwind / VXE Table / Ant Design Vue / ECharts。点击顶栏右上角的
          <b>主题切换器</b> 切换「亮 / 暗」或「主色预设」，观察下方所有区块实时变化。
        </p>
      </div>
      <div class="flex shrink-0 flex-wrap gap-2">
        <a-tag>模式：{{ mode === 'dark' ? '暗色 Dark' : '亮色 Light' }}</a-tag>
        <a-tag color="processing">主色：{{ presetLabel }}</a-tag>
      </div>
    </div>

    <ColorPaletteSection />
    <AntdShowcaseSection />
    <VxeTableShowcaseSection />
    <EchartsShowcaseSection />
    <CardShowcaseSection />
  </div>
</template>

<style scoped>
/*
 * 主题预览页一次性承载多类组件，默认 Card body 间距会显得偏紧。
 * 调整限定在当前页面，避免影响业务列表页、表单页等需要高密度信息的场景。
 */
.theme-preview-page :deep(.ant-card-body) {
  padding: 28px !important;
}

/*
 * section 之间的距离是预览页的页面级规则，优先级应高于 Ant Design Vue 的卡片、
 * 栅格或表单组件默认样式。这里用 !important 明确锁定展示页节奏，防止后加载的组件 CSS 把间距压小。
 */
.theme-preview-page {
  gap: 24px !important;
}

@media (min-width: 1024px) {
  .theme-preview-page {
    gap: 32px !important;
  }
}

/*
 * 窄屏下保留更克制的内边距，防止内容区域被 padding 挤压。
 */
@media (max-width: 640px) {
  .theme-preview-page :deep(.ant-card-body) {
    padding: 20px !important;
  }
}
</style>
