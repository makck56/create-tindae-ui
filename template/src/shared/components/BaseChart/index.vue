<template>
  <VChart ref="chartRef" v-bind="forwarded" :theme="themeObj" />
</template>

<script lang="ts">
import { use } from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

/*
 * ECharts 6 的核心包默认不包含渲染器、图表类型和组件，vue-echarts 也不会自动注册。
 * 这段代码必须在 <VChart> 实例创建前执行，否则 ZRender 初始化时拿不到 renderer，会抛出：
 * "Renderer 'undefined' is not imported. Please import it first."
 *
 * 放在普通 <script> 的模块作用域中，可以保证：
 * - BaseChart chunk 被懒加载时才引入 ECharts，避免污染首屏主包。
 * - 同一个页面渲染多个图表时只注册一次，避免在每个组件实例 setup 阶段重复执行。
 */
use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
]);
</script>

<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue';
import VChart from 'vue-echarts';
import type { EChartsOption } from 'echarts';
import { useThemeStore } from '@/core/theme';
import { buildEChartsTheme } from '@/core/theme/bridges/echarts';

/**
 * 项目级图表组件：vue-echarts <VChart> 的透明包装。
 *
 * 设计取舍：
 * - option / group / loading / 事件 / class 等能力全部通过 $attrs 原样透传给 VChart。
 * - theme 由 BaseChart 接管，统一接入主题 token，避免业务图表重复拼接主题配置。
 * - autoresize 默认开启；消费方仍可显式传入 autoresize 覆盖默认值。
 *
 * 使用约束：
 * - 图表外层必须提供稳定高度，例如 class="h-[260px]" 或固定高度 viewport。
 * - 如果缺少显式高度，ECharts 无法正确计算画布尺寸；如果高度参与父级反馈，可能造成不断撑高。
 */
defineOptions({ name: 'BaseChart', inheritAttrs: false });

const attrs = useAttrs();
const themeStore = useThemeStore();
const themeObj = computed(() => buildEChartsTheme(themeStore.currentTokens));

// 默认开启 autoresize，同时允许调用方通过同名 attr 覆盖这个默认值。
const forwarded = computed(() => ({ autoresize: true, ...attrs }));

const chartRef = ref<InstanceType<typeof VChart>>();

defineExpose({
  // 仅在 vue-echarts 的 manual-update 模式下建议手动调用 setOption。
  // 常规场景应优先修改 :option，让 Vue 响应式更新驱动图表变化。
  setOption: (option: EChartsOption, ...args: any[]) => chartRef.value?.setOption(option, ...args),
  resize: (...args: any[]) => chartRef.value?.resize(...args),
  dispatchAction: (payload: any) => chartRef.value?.dispatchAction(payload),
  clear: () => chartRef.value?.clear(),
  getDataURL: (opts?: any) => chartRef.value?.getDataURL(opts),

  get vchart() {
    return chartRef.value;
  },

  // vue-echarts expose 的 .chart 会被组件实例代理自动解包，这里返回底层 echarts 实例。
  get echarts() {
    return chartRef.value?.chart;
  },
});
</script>
