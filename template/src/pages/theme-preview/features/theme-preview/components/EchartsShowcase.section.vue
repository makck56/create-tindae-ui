<script setup lang="ts">
import type { EChartsOption } from 'echarts';
import BaseChart from '@/shared/components/BaseChart/index.vue';

/**
 * ECharts 图表展示：柱状图 / 折线图 / 饼图。
 *
 * 使用 BaseChart 封装 vue-echarts：
 * - 主题由 BaseChart 注入，切换亮暗色或主色预设时图表自动跟随。
 * - autoresize 默认开启，因此外层必须提供稳定高度，避免图表尺寸反过来影响页面高度。
 */
defineOptions({ name: 'EchartsShowcaseSection' });

const barOption: EChartsOption = {
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五'] },
  yAxis: { type: 'value' },
  series: [{ type: 'bar', data: [120, 200, 150, 80, 70] }],
};

// 双系列用于验证主题调色板在多条 series 下的配色联动。
const lineOption: EChartsOption = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['收入', '支出'] },
  xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五'] },
  yAxis: { type: 'value' },
  series: [
    { name: '收入', type: 'line', smooth: true, data: [320, 432, 401, 534, 390] },
    { name: '支出', type: 'line', smooth: true, data: [220, 282, 391, 234, 290] },
  ],
};

const pieOption: EChartsOption = {
  tooltip: { trigger: 'item' },
  legend: { bottom: 0 },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: 1048, name: '直接访问' },
        { value: 735, name: '邮件营销' },
        { value: 580, name: '联盟广告' },
        { value: 484, name: '视频广告' },
      ],
    },
  ],
};
</script>

<template>
  <a-card title="⑤ ECharts 图表">
    <p class="mb-5 text-sm leading-relaxed text-secondary">
      切换主题时图表自动跟随，观察系列配色、坐标轴、文字、图例、tooltip 是否同步变化。
    </p>

    <!--
      图表使用固定 viewport 承载 BaseChart。
      这样 ECharts autoresize 只能读取稳定容器尺寸，不会把自身绘制后的 canvas 高度反馈给外层布局。
    -->
    <div class="theme-chart-grid grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div class="rounded-md border border-[var(--border-lighter)] bg-[var(--bg-container)] p-4">
        <div class="mb-4 text-[13px] font-semibold text-secondary">柱状图</div>
        <div class="theme-chart-viewport h-[260px] max-h-[260px] min-h-[260px] overflow-hidden">
          <BaseChart :option="barOption" class="h-full max-h-full min-h-0 w-full" />
        </div>
      </div>

      <div class="rounded-md border border-[var(--border-lighter)] bg-[var(--bg-container)] p-4">
        <div class="mb-4 text-[13px] font-semibold text-secondary">折线图</div>
        <div class="theme-chart-viewport h-[260px] max-h-[260px] min-h-[260px] overflow-hidden">
          <BaseChart :option="lineOption" class="h-full max-h-full min-h-0 w-full" />
        </div>
      </div>

      <div
        class="rounded-md border border-[var(--border-lighter)] bg-[var(--bg-container)] p-4 lg:col-span-2"
      >
        <div class="mb-4 text-[13px] font-semibold text-secondary">饼图</div>
        <div class="theme-chart-viewport h-[300px] max-h-[300px] min-h-[300px] overflow-hidden">
          <BaseChart :option="pieOption" class="h-full max-h-full min-h-0 w-full" />
        </div>
      </div>
    </div>
  </a-card>
</template>

<style scoped>
/*
 * vue-echarts 的 autoresize 会监听图表容器尺寸变化。
 * 固定 viewport 高度并裁剪溢出，可以避免图表根节点和父级卡片之间形成高度反馈，
 * 从而解决主题预览页图表不断把页面撑高的问题。
 */
.theme-chart-viewport {
  contain: layout size;
}

.theme-chart-viewport :deep(.echarts),
.theme-chart-viewport :deep(canvas) {
  max-height: 100% !important;
}

/*
 * 图表卡片之间的空隙同样属于预览页展示规则，需要压过 Ant Card / Grid 的默认样式。
 */
.theme-chart-grid {
  gap: 24px !important;
}
</style>
