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
 * 把各展示 section 组合在一处，用于肉眼验证「切换亮暗 / 主色预设」后，
 * Tailwind / Ant Design Vue / VXE Table / ECharts 四端的联动效果。
 * 全程使用 Tailwind 工具类（含 arbitrary value 表达未注册的语义 CSS 变量）。
 */
defineOptions({ name: 'ThemePreviewView' });

const { mode, presetKey, presets } = useTheme();

/** 当前预设中文名（用于顶部状态展示） */
const presetLabel = computed(
  () => presets.find((p) => p.key === presetKey.value)?.label ?? presetKey.value,
);
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 顶部说明 + 当前主题状态：语义色，暗色自动适配 -->
    <div
      class="flex items-start justify-between gap-4 flex-wrap p-5 rounded-lg border border-light bg-[var(--bg-container)]"
    >
      <div class="min-w-0">
        <h2 class="m-0 mb-2 text-2xl font-bold text-title">主题预览</h2>
        <p class="m-0 text-sm leading-relaxed text-secondary">
          统一配置 Tailwind / VXE Table / Ant Design Vue / ECharts。点击顶栏右上角的
          <b>主题切换器</b> 切换「亮 / 暗」或「主色预设」，观察下方所有区块实时变化。
        </p>
      </div>
      <div class="flex shrink-0 gap-2">
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
