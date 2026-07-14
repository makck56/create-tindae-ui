import type { App } from 'vue';

/**
 * ECharts 运行时入口（占位）。
 *
 * 项目通过 vue-echarts 的 <VChart> + shared/components/BaseChart 使用 echarts：
 *   - BaseChart 内部把 core/theme 的 buildEChartsTheme 产物作为 :theme 注入；
 *   - echarts / vue-echarts 由 BaseChart（被懒加载路由的图表页引用）按需引入，不进首屏主包；
 *   - 切主题时 vue-echarts（echarts 6+）走实例级 setTheme 热更新，不重建实例。
 *
 * 依赖约束：vue-echarts 8 的 peerDep 为 echarts ^6，故项目锁定 echarts 6。
 *
 * 业务用法：见 shared/components/BaseChart（声明式 <BaseChart :option="..." />）。
 * 若确有「全局预注册 echarts 组件 / 自定义渲染器」需求，可在此扩展 setupEcharts。
 */
export function setupEcharts(_app: App): void {
  // 暂无全局预注册需求：echarts 由 BaseChart 按需引入，主题由 core/theme 提供纯函数翻译。
}
