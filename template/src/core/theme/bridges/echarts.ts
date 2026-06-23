import type { ThemeTokens } from '../types';

/**
 * ECharts 主题桥接层 —— 把主题 Token 翻译成 ECharts 的主题 option。
 *
 * 与 antd / vxe 桥接不同：ECharts 是「命令式」渲染，没有 CSS 变量可用，
 * 必须通过 `echarts.registerTheme(name, option)` 注册一份主题 option，
 * 实例化时 `echarts.init(dom, name)` 应用；主题变化时需重新注册 + 刷新实例。
 *
 * 设计要点：
 * 1. 本文件是「纯数据翻译」，不 import echarts（避免主题模块强行绑定 echarts 依赖），
 *    由调用方（registerAppEChartsTheme / useEcharts）传入 echarts 运行时；
 * 2. buildEChartsTheme 为纯函数，输出标准 ECharts theme option，可直接单测；
 * 3. 颜色取自语义 Token，与 Tailwind / antd / vxe 视觉统一。
 */

/** 注册到 echarts 的主题名（init 时作为第二参数传入） */
export const ECHARTS_THEME_NAME = 'app-theme';

/** ECharts 实例类型（结构化类型，避免直接 import echarts 的完整类型） */
export interface EChartsInstance {
  setOption(option: Record<string, unknown>, lazyUpdate?: boolean): unknown;
  resize(): void;
  dispose(): unknown;
  getOption(): Record<string, unknown>;
}

/** echarts 运行时的最小结构化类型（仅声明主题桥接用到的 API） */
export interface EChartsRuntime {
  registerTheme(name: string, option: Record<string, unknown>): unknown;
  init(el: HTMLElement, theme?: string): EChartsInstance;
}

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
 * @returns 可直接传给 echarts.registerTheme 的主题 option
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

/**
 * 将当前 Token 注册为 ECharts 主题（写入 echarts 内部主题表）。
 * 主题变化时重复调用即可覆盖同名主题，实例刷新后即生效。
 *
 * @param echarts 业务按需 import 的 echarts 运行时
 * @param tokens  当前生效的完整 Token
 */
export function registerAppEChartsTheme(
  echarts: EChartsRuntime,
  tokens: ThemeTokens,
): void {
  echarts.registerTheme(ECHARTS_THEME_NAME, buildEChartsTheme(tokens));
}
