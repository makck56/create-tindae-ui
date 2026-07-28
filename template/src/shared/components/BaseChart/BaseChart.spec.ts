import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { use } from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

vi.mock('vue-echarts', () => ({
  default: { name: 'VChart', template: '<div />' },
}));

vi.mock('echarts/core', () => ({
  use: vi.fn(),
}));

vi.mock('echarts/charts', () => ({
  BarChart: { type: 'BarChart' },
  LineChart: { type: 'LineChart' },
  PieChart: { type: 'PieChart' },
}));

vi.mock('echarts/components', () => ({
  GridComponent: { type: 'GridComponent' },
  LegendComponent: { type: 'LegendComponent' },
  TooltipComponent: { type: 'TooltipComponent' },
}));

vi.mock('echarts/renderers', () => ({
  CanvasRenderer: { type: 'CanvasRenderer' },
}));

describe('BaseChart', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('加载图表组件时预注册 ECharts renderer、图表类型和基础组件', async () => {
    // 主题预览页通过 BaseChart 间接加载 vue-echarts。
    // renderer 注册放在普通 <script> 的模块作用域，确保 VChart 实例创建前就已经执行。
    const { default: BaseChart } = await import('./index.vue');

    expect(use).toHaveBeenCalledWith([
      CanvasRenderer,
      BarChart,
      LineChart,
      PieChart,
      GridComponent,
      TooltipComponent,
      LegendComponent,
    ]);

    mount(BaseChart, {
      attrs: {
        option: {},
      },
    });
  });
});
