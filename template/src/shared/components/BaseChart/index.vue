<template>
  <VChart ref="chartRef" v-bind="forwarded" :theme="themeObj" />
</template>

<script setup lang="ts">
import { ref, computed, useAttrs } from 'vue';
import VChart from 'vue-echarts';
import type { EChartsOption } from 'echarts';
import { useThemeStore } from '@/core/theme';
import { buildEChartsTheme } from '@/core/theme/bridges/echarts';

/**
 * 项目级图表组件：vue-echarts <VChart> 的透明包装，自动注入主题。
 *
 * 为何用 $attrs 透传而非重声明 props：vue-echarts 的 props 类型派生自
 * `InstanceType<typeof VChart>['$props']`，Vue SFC 编译器无法解析该派生类型（vite build 会失败）。
 * 故采用「inheritAttrs:false + $attrs 透传」：option / group / loading / 事件 / class 等全部
 * 原样转发给 VChart，仅 :theme 由本组件接管。
 *
 * - 主题：把 buildEChartsTheme(tokens) 作为 :theme 注入；切主题走实例级 setTheme 热更新（echarts 6+）。
 * - autoresize 默认开启（消费者显式传 autoresize 则以其值为准）。
 * - 容器需有显式高度（如 class="h-80"），否则图表塌缩为 0。
 * - 代价：BaseChart 不对 VChart 的 props 做静态类型检查（经 $attrs 透传）；如需严格类型请用原生 <VChart>。
 */
defineOptions({ name: 'BaseChart', inheritAttrs: false });

const attrs = useAttrs();
const themeStore = useThemeStore();
const themeObj = computed(() => buildEChartsTheme(themeStore.currentTokens));
// autoresize 默认 true；消费者传入的同名 attr 在后展开，覆盖默认值
const forwarded = computed(() => ({ autoresize: true, ...attrs }));

const chartRef = ref<InstanceType<typeof VChart>>();

defineExpose({
  // 仅 manual-update 模式生效：vue-echarts 常规模式下 setOption 会 warn 并忽略；
  // 常规更新请直接改 :option（响应式）。保留此方法是为 manual-update 场景透传。
  setOption: (option: EChartsOption, ...args: any[]) => chartRef.value?.setOption(option, ...args),
  resize: (...args: any[]) => chartRef.value?.resize(...args),
  dispatchAction: (payload: any) => chartRef.value?.dispatchAction(payload),
  clear: () => chartRef.value?.clear(),
  getDataURL: (opts?: any) => chartRef.value?.getDataURL(opts),

  get vchart() {
    return chartRef.value;
  },
  // vue-echarts expose 的 .chart 经组件实例代理自动解包，直接是底层 echarts 实例
  get echarts() {
    return chartRef.value?.chart;
  },
});
</script>
