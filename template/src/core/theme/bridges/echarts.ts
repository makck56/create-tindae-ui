import type { ThemeTokens } from '../types';

/**
 * ECharts 主题桥接层 —— 把主题 Token 翻译成 ECharts 的主题 option（纯函数）。
 *
 * 与 antd / vxe 桥接不同：ECharts 是「命令式」canvas 渲染，没有 CSS 变量可用，
 * 需把主题作为数据交给 echarts 实例。本文件只负责「Token → theme option」的翻译，
 * 不 import echarts 运行时（保持主题模块轻量、可单测、不进首屏主包）。
 *
 * 消费方式：shared/components/BaseChart 把本函数产物作为 :theme 传给 <VChart>（vue-echarts）。
 * 切主题时 vue-echarts（配合 echarts 6+）走实例级 setTheme 热更新，不重建实例、不丢事件。
 */

/**
 * 由主题 Token 生成 ECharts 主题 option（纯函数）。
 *
 * 覆盖维度：
 * - 调色板（color）：品牌主色打头，接功能色，构成默认系列配色；
 * - 背景 / 画布色；
 * - 文字色阶（标题 / 图例 / 坐标轴标签）；
 * - 分隔线 / 坐标轴线色；
 * - 提示框 / 图例的配色细节。
 *
 * @param tokens 当前生效的完整 Token
 * @returns 标准 ECharts theme option，可直接作为 <VChart :theme="..."> 的对象主题
 */
export function buildEChartsTheme(tokens: ThemeTokens): Record<string, unknown> {
  const { colors, text, bg, border } = tokens;

  // 默认系列调色板：主色 → 主色 hover → info → success → warning → danger，
  // 顺序即「第一根柱/线用主色」的直觉配色
  const palette = [
    colors.primary.DEFAULT,
    colors.primary.hover,
    colors.info.DEFAULT,
    colors.success.DEFAULT,
    colors.warning.DEFAULT,
    colors.danger.DEFAULT,
  ];

  return {
    // 默认系列配色
    color: palette,
    // 画布背景：使用容器色（图表通常嵌在卡片内）
    backgroundColor: bg.container,
    // 全局文字
    textStyle: {
      color: text.body,
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    },
    // 标题
    title: {
      textStyle: { color: text.title, fontWeight: 600 },
      subtextStyle: { color: text.secondary },
    },
    // 图例
    legend: {
      textStyle: { color: text.body },
      pageTextStyle: { color: text.body },
      pageIconColor: colors.primary.DEFAULT,
      pageIconInactiveColor: text.disabled,
    },
    // 提示框
    tooltip: {
      backgroundColor: bg.elevated,
      borderColor: border.base,
      textStyle: { color: text.body },
      axisPointer: {
        lineStyle: { color: border.light },
        crossStyle: { color: border.light },
      },
    },
    // 坐标轴
    categoryAxis: {
      axisLine: { lineStyle: { color: border.base } },
      axisTick: { lineStyle: { color: border.light } },
      axisLabel: { color: text.secondary },
      splitLine: { lineStyle: { color: border.lighter } },
      splitArea: { areaStyle: { color: [bg.subtle, bg.container] } },
    },
    // 数值轴（沿用 category 样式，保持一致）
    valueAxis: {
      axisLine: { lineStyle: { color: border.base } },
      axisTick: { lineStyle: { color: border.light } },
      axisLabel: { color: text.secondary },
      splitLine: { lineStyle: { color: border.lighter } },
      splitArea: { areaStyle: { color: [bg.subtle, bg.container] } },
    },
    // 折线默认取色走全局 color；线宽/平滑等留业务自定义
    line: {
      itemStyle: { borderWidth: 2 },
      lineStyle: { width: 2 },
      symbolSize: 6,
      symbol: 'emptyCircle',
      smooth: false,
    },
    // 柱状默认
    bar: {
      itemStyle: { borderWidth: 0 },
    },
    // 饼图
    pie: {
      itemStyle: {
        borderWidth: 1,
        borderColor: bg.container,
      },
    },
  };
}
