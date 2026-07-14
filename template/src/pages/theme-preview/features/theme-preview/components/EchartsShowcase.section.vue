<script setup lang="ts">
import type { EChartsOption } from 'echarts';
import BaseChart from '@/shared/components/BaseChart/index.vue';

/**
 * ECharts 图表展示：柱状 / 折线 / 饼图。
 * 使用 BaseChart（封装 vue-echarts 的 <VChart>）：主题自动跟随、autoresize 默认开启、
 * 切换主题走实例级 setTheme 热更新（不重建实例）。系列配色 / 坐标轴 / 文字 / 图例 / tooltip 自动联动。
 */
defineOptions({ name: 'EchartsShowcaseSection' });

const barOption: EChartsOption = {
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五'] },
  yAxis: { type: 'value' },
  series: [{ type: 'bar', data: [120, 200, 150, 80, 70] }],
};

// 双系列，验证调色板多色
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
  <a-card title="④ ECharts 图表">
    <p class="mb-3 text-sm text-secondary">
      切换主题时图表自动跟随（实例级 setTheme 热更新，不重建实例）—— 观察系列配色、坐标轴、文字、图例、tooltip 是否跟随。
    </p>
    <!-- 默认单列，md 及以上双列；饼图跨两列 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div class="rounded-md border border-[var(--border-lighter)] bg-[var(--bg-container)] p-3">
        <div class="mb-2 text-[13px] font-semibold text-secondary">柱状图</div>
        <BaseChart :option="barOption" class="h-[260px] w-full" />
      </div>
      <div class="rounded-md border border-[var(--border-lighter)] bg-[var(--bg-container)] p-3">
        <div class="mb-2 text-[13px] font-semibold text-secondary">折线图</div>
        <BaseChart :option="lineOption" class="h-[260px] w-full" />
      </div>
      <div
        class="rounded-md border border-[var(--border-lighter)] bg-[var(--bg-container)] p-3 md:col-span-2"
      >
        <div class="mb-2 text-[13px] font-semibold text-secondary">饼图</div>
        <BaseChart :option="pieOption" class="h-[300px] w-full" />
      </div>
    </div>
  </a-card>
</template>
