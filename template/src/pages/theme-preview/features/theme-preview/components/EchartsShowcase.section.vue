<script setup lang="ts">
import { onMounted, ref } from 'vue';
// 业务按需引入 echarts（全量 import；示例页为懒加载路由，不影响首屏）
import * as echarts from 'echarts';
import { useEcharts } from '@/core/theme';

/**
 * ECharts 图表展示：柱状 / 折线 / 饼图。
 * 使用 core/theme 的 useEcharts：自动注入主题、容器 resize 自适应、
 * 切换主题时重建实例并回放 option（系列配色 / 坐标轴 / 文字 自动联动）。全程 Tailwind。
 */
defineOptions({ name: 'EchartsShowcaseSection' });

// 三个图表容器 ref
const barEl = ref<HTMLElement>();
const lineEl = ref<HTMLElement>();
const pieEl = ref<HTMLElement>();

// 每个图独立一份 setOption（内部各持一个 echarts 实例）
const { setOption: setBar } = useEcharts(barEl, echarts);
const { setOption: setLine } = useEcharts(lineEl, echarts);
const { setOption: setPie } = useEcharts(pieEl, echarts);

onMounted(() => {
  // 柱状图
  setBar({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五'] },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: [120, 200, 150, 80, 70] }],
  });

  // 折线图（双系列，验证调色板多色）
  setLine({
    tooltip: { trigger: 'axis' },
    legend: { data: ['收入', '支出'] },
    xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五'] },
    yAxis: { type: 'value' },
    series: [
      { name: '收入', type: 'line', smooth: true, data: [320, 432, 401, 534, 390] },
      { name: '支出', type: 'line', smooth: true, data: [220, 282, 391, 234, 290] },
    ],
  });

  // 饼图
  setPie({
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
  });
});
</script>

<template>
  <a-card title="④ ECharts 图表">
    <p class="mb-3 text-sm text-secondary">
      切换主题时图表自动重建并回放数据 —— 观察系列配色、坐标轴、文字、图例、tooltip 是否跟随。
    </p>
    <!-- 默认单列，md 及以上双列；饼图跨两列 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div class="rounded-md border border-[var(--border-lighter)] bg-[var(--bg-container)] p-3">
        <div class="mb-2 text-[13px] font-semibold text-secondary">柱状图</div>
        <div ref="barEl" class="h-[260px] w-full"></div>
      </div>
      <div class="rounded-md border border-[var(--border-lighter)] bg-[var(--bg-container)] p-3">
        <div class="mb-2 text-[13px] font-semibold text-secondary">折线图</div>
        <div ref="lineEl" class="h-[260px] w-full"></div>
      </div>
      <div class="rounded-md border border-[var(--border-lighter)] bg-[var(--bg-container)] p-3 md:col-span-2">
        <div class="mb-2 text-[13px] font-semibold text-secondary">饼图</div>
        <div ref="pieEl" class="h-[300px] w-full"></div>
      </div>
    </div>
  </a-card>
</template>
