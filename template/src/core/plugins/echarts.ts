import type { App } from 'vue';

/**
 * ECharts 运行时入口。
 *
 * 主题说明：echarts 体积大，模板项目约定「由业务组件按需 import echarts」，
 * 因此本 setup 不强制引入 echarts。主题配色由 core/theme 统一接管：
 *   - core/theme/bridges/echarts.ts 提供 buildEChartsTheme（Token → ECharts 主题 option，纯函数）；
 *   - core/theme/composables/useEcharts.ts 提供 useEcharts(el, echarts)，
 *     自动完成「主题注入 + 容器 resize 自适应 + 切主题重建实例并回放 option」。
 *
 * 业务推荐用法（无需调用本 setup）：
 *   import * as echarts from 'echarts';
 *   import { useEcharts } from '@/core/theme';
 *   const el = ref<HTMLElement>();
 *   const { setOption } = useEcharts(el, echarts);
 *   onMounted(() => setOption({ series: [...] }));
 *
 * 若确有「全局预注册 echarts 主题 / 组件」的需求，可在此扩展 setupEcharts（传入 echarts 运行时）。
 */
export function setupEcharts(_app: App): void {
  // 暂无全局预注册需求：主题由 core/theme 在各图表实例化时按需注入。
}
