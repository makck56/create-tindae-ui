import { describe, it, expect, vi, beforeAll } from 'vitest';
import { mount, type MountingOptions } from '@vue/test-utils';
import {
  Form as AForm,
  FormItem as AFormItem,
  Button as AButton,
  Input as AInput,
  Select as ASelect,
} from 'ant-design-vue';
import QueryFilter from './QueryFilter.vue';

vi.mock('ant-design-vue/es/date-picker', () => {
  const DatePickerStub = {
    name: 'ADatePicker',
    props: ['value'],
    template: '<div class="date-picker-stub"></div>',
    emits: ['update:value'],
  };
  const RangePickerStub = {
    name: 'ARangePicker',
    props: ['value'],
    template: '<div class="range-picker-stub"></div>',
    emits: ['update:value'],
  };

  return {
    default: DatePickerStub,
    RangePicker: RangePickerStub,
  };
});

// ant-design-vue components require window.matchMedia in jsdom
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

const INPUT_CONFIG = [
  { type: 'input' as const, label: '用户名', name: 'name' },
  { type: 'select' as const, label: '状态', name: 'status' },
];

const DATE_RANGE_CONFIG = [
  {
    type: 'date-range' as const,
    label: '创建时间',
    name: ['startTime', 'endTime'] as [string, string],
  },
];

type QueryFilterProps = InstanceType<typeof QueryFilter>['$props'];
type QueryFilterMountOptions = MountingOptions<QueryFilterProps>;

function mountQueryFilter(options: QueryFilterMountOptions) {
  return mount(QueryFilter, {
    ...options,
    global: {
      ...options.global,
      components: {
        // QueryFilter relies on unplugin-vue-components in the real Vite app.
        // Unit tests do not run that resolver, so the antd tags must be registered here.
        AForm,
        AFormItem,
        AButton,
        ...options.global?.components,
      },
    },
  });
}

describe('QueryFilter', () => {
  it('根据 config 渲染对应数量的 form-item', () => {
    const wrapper = mountQueryFilter({
      props: { config: INPUT_CONFIG },
    });
    // config 项 + 1 个按钮组
    const formItems = wrapper.findAllComponents(AFormItem);
    expect(formItems.length).toBe(INPUT_CONFIG.length + 1);
  });

  it('渲染查询和重置按钮', () => {
    const wrapper = mountQueryFilter({
      props: { config: INPUT_CONFIG },
    });
    // antd Button inserts whitespace around text in jsdom
    const text = wrapper.text().replace(/\s+/g, '');
    expect(text).toContain('搜索');
    expect(text).toContain('重置');
  });

  it('点击查询按钮 emit search 事件，携带当前值', async () => {
    const wrapper = mountQueryFilter({
      props: { config: INPUT_CONFIG, modelValue: { name: 'test', status: 'active' } },
    });
    await wrapper.findAllComponents(AButton)[0].vm.$emit('click');
    expect(wrapper.emitted('search')?.[0][0]).toEqual({ name: 'test', status: 'active' });
  });

  it('点击重置按钮 emit update:modelValue 和 reset', async () => {
    const wrapper = mountQueryFilter({
      props: { config: INPUT_CONFIG, modelValue: { name: 'test', status: 'active' } },
    });
    const buttons = wrapper.findAllComponents(AButton);
    await buttons[1].vm.$emit('click');
    expect(wrapper.emitted('update:modelValue')?.[0][0]).toEqual({
      name: undefined,
      status: undefined,
    });
    expect(wrapper.emitted('reset')).toBeTruthy();
  });

  it('input 值变化时 emit update:modelValue', async () => {
    const wrapper = mountQueryFilter({
      props: { config: INPUT_CONFIG, modelValue: {} },
    });
    const input = wrapper.findComponent(AInput);
    await input.vm.$emit('update:value', 'hello');
    expect(wrapper.emitted('update:modelValue')?.[0][0]).toEqual({ name: 'hello' });
  });

  it('date-range 值变化时将数组解析为两个 key', async () => {
    const wrapper = mountQueryFilter({
      props: { config: DATE_RANGE_CONFIG, modelValue: {} },
    });
    const rangePicker = wrapper.findComponent({ name: 'ARangePicker' });
    await rangePicker.vm.$emit('update:value', ['2024-01-01', '2024-12-31']);
    expect(wrapper.emitted('update:modelValue')?.[0][0]).toEqual({
      startTime: '2024-01-01',
      endTime: '2024-12-31',
    });
  });

  it('date-range 反向同步：从 modelValue 读取两个 key 回填', () => {
    const wrapper = mountQueryFilter({
      props: {
        config: DATE_RANGE_CONFIG,
        modelValue: { startTime: '2024-01-01', endTime: '2024-12-31' },
      },
    });
    const rangePicker = wrapper.findComponent({ name: 'ARangePicker' });
    expect(rangePicker.props('value')).toEqual(['2024-01-01', '2024-12-31']);
  });

  it('date-range 重置时清空两个 key', async () => {
    const wrapper = mountQueryFilter({
      props: {
        config: DATE_RANGE_CONFIG,
        modelValue: { startTime: '2024-01-01', endTime: '2024-12-31' },
      },
    });
    const buttons = wrapper.findAllComponents(AButton);
    await buttons[1].vm.$emit('click');
    expect(wrapper.emitted('update:modelValue')?.[0][0]).toEqual({
      startTime: undefined,
      endTime: undefined,
    });
  });

  it('date-range 值为 null 时两个 key 设为 undefined', async () => {
    const wrapper = mountQueryFilter({
      props: {
        config: DATE_RANGE_CONFIG,
        modelValue: { startTime: '2024-01-01', endTime: '2024-12-31' },
      },
    });
    const rangePicker = wrapper.findComponent({ name: 'ARangePicker' });
    await rangePicker.vm.$emit('update:value', null);
    expect(wrapper.emitted('update:modelValue')?.[0][0]).toEqual({
      startTime: undefined,
      endTime: undefined,
    });
  });

  it('fieldProps 透传给对应组件', () => {
    const wrapper = mountQueryFilter({
      props: {
        config: [
          {
            type: 'select',
            label: '状态',
            name: 'status',
            fieldProps: { placeholder: '请选择', allowClear: true },
          },
        ],
      },
    });
    const select = wrapper.findComponent(ASelect);
    expect(select.props('placeholder')).toBe('请选择');
    expect(select.props('allowClear')).toBe(true);
  });

  it('labelWidth 设置 label 列宽度', () => {
    const wrapper = mountQueryFilter({
      props: { config: INPUT_CONFIG, labelWidth: 80 },
    });
    const formItem = wrapper.findComponent(AFormItem);
    expect(formItem.props('labelCol')).toEqual({ style: { width: '80px' } });
  });
});
