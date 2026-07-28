import type { App } from 'vue';

/**
 * ECharts 应用级插件入口。
 *
 * 这里刻意保持为空，不引入 `echarts/core`、renderer、charts 或 components。
 * 原因是 ECharts 体积较大，如果在应用启动阶段注册模块，会被 Vite 合并进首屏主包。
 * 具体的 renderer、图表类型和基础组件由 `shared/components/BaseChart` 在图表组件加载时注册，
 * 这样可以保证主题预览等图表页面正常渲染，同时保留路由级懒加载带来的首屏性能收益。
 *
 * 后续新增图表能力时，优先扩展 BaseChart 中的按需注册清单。
 */
export function setupEcharts(_app: App): void {
  // 保留统一 bootstrap 调用点，避免上层启动流程为了 ECharts 做特殊分支。
}
