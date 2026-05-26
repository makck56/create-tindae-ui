# QueryFilter 通用筛选组件 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建 config 驱动的 QueryFilter 组件，替代每个页面手写筛选表单。

**Architecture:** 单 Vue SFC 组件，接收 `config` 数组 + `v-model` 对象，遍历 config 动态渲染 antdv 表单组件，内置查询/重置按钮。放在 `template/src/shared/components/query-filter/`。

**Tech Stack:** Vue 3 SFC + Ant Design Vue + Vitest

---

## File Structure

| 操作 | 文件 | 职责 |
|------|------|------|
| Create | `template/src/shared/components/query-filter/types.ts` | FilterItemConfig 类型定义 |
| Create | `template/src/shared/components/query-filter/QueryFilter.vue` | 筛选组件 |
| Create | `template/src/shared/components/query-filter/index.ts` | 导出 |
| Create | `template/src/shared/components/query-filter/QueryFilter.spec.ts` | 测试 |

---

### Task 1: 创建类型定义和组件

**Files:**
- Create: `template/src/shared/components/query-filter/types.ts`
- Create: `template/src/shared/components/query-filter/QueryFilter.vue`
- Create: `template/src/shared/components/query-filter/index.ts`

- [ ] **Step 1: 创建 types.ts**

```typescript
export type FilterItemConfig =
  | {
      type: 'input' | 'select' | 'tree-select' | 'cascader' | 'date-picker';
      label?: string;
      name: string;
      fieldProps?: Record<string, any>;
    }
  | {
      type: 'date-range';
      label?: string;
      name: [string, string];
      fieldProps?: Record<string, any>;
    };
```

- [ ] **Step 2: 创建 QueryFilter.vue**

```vue
<script setup lang="ts">
import {
  Form as AForm,
  FormItem as AFormItem,
  Button as AButton,
  Input as AInput,
  Select as ASelect,
  TreeSelect as ATreeSelect,
  Cascader as ACascader,
  DatePicker as ADatePicker,
  RangePicker as ARangePicker,
} from 'ant-design-vue';
import type { FilterItemConfig } from './types';

defineOptions({ name: 'QueryFilter' });

const props = withDefaults(
  defineProps<{
    config: FilterItemConfig[];
    modelValue?: Record<string, any>;
    labelWidth?: number | string;
  }>(),
  { modelValue: () => ({}) },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, any>): void;
  (e: 'search', value: Record<string, any>): void;
  (e: 'reset'): void;
}>();

const COMPONENT_MAP = {
  input: AInput,
  select: ASelect,
  'tree-select': ATreeSelect,
  cascader: ACascader,
  'date-picker': ADatePicker,
  'date-range': ARangePicker,
};

function isDateRange(item: FilterItemConfig): item is Extract<FilterItemConfig, { type: 'date-range' }> {
  return item.type === 'date-range';
}

function getFieldValue(item: FilterItemConfig): any {
  if (isDateRange(item)) {
    const start = props.modelValue?.[item.name[0]];
    const end = props.modelValue?.[item.name[1]];
    return start === undefined && end === undefined ? undefined : [start, end];
  }
  return props.modelValue?.[item.name];
}

function handleFieldChange(item: FilterItemConfig, value: any) {
  if (isDateRange(item)) {
    const [start, end] = value ?? [undefined, undefined];
    emit('update:modelValue', {
      ...props.modelValue,
      [item.name[0]]: start,
      [item.name[1]]: end,
    });
  } else {
    emit('update:modelValue', {
      ...props.modelValue,
      [item.name]: value,
    });
  }
}

function handleSearch() {
  emit('search', { ...props.modelValue });
}

function handleReset() {
  const emptyValue = { ...props.modelValue };
  for (const item of props.config) {
    if (isDateRange(item)) {
      emptyValue[item.name[0]] = undefined;
      emptyValue[item.name[1]] = undefined;
    } else {
      emptyValue[item.name] = undefined;
    }
  }
  emit('update:modelValue', emptyValue);
  emit('reset');
}
</script>

<template>
  <a-form layout="inline" class="mb-4">
    <a-form-item
      v-for="item in config"
      :key="isDateRange(item) ? item.name.join('-') : item.name"
      :label="item.label"
      :label-col="{ style: labelWidth ? { width: typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth } : undefined }"
    >
      <component
        :is="COMPONENT_MAP[item.type]"
        v-bind="item.fieldProps"
        :value="getFieldValue(item)"
        @update:value="handleFieldChange(item, $event)"
        @pressEnter="item.type === 'input' ? handleSearch() : undefined"
      />
    </a-form-item>
    <a-form-item>
      <a-button type="primary" @click="handleSearch">查询</a-button>
      <a-button class="ml-2" @click="handleReset">重置</a-button>
    </a-form-item>
  </a-form>
</template>
```

- [ ] **Step 3: 创建 index.ts**

```typescript
export { default as QueryFilter } from './QueryFilter.vue';
export type { FilterItemConfig } from './types';
```

---

### Task 2: 编写测试

**Files:**
- Create: `template/src/shared/components/query-filter/QueryFilter.spec.ts`

- [ ] **Step 1: 编写组件测试**

```typescript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { FormItem as AFormItem, Button as AButton, Input as AInput, Select as ASelect, RangePicker as ARangePicker } from 'ant-design-vue';
import QueryFilter from './QueryFilter.vue';

const INPUT_CONFIG = [
  { type: 'input' as const, label: '用户名', name: 'name' },
  { type: 'select' as const, label: '状态', name: 'status' },
];

const DATE_RANGE_CONFIG = [
  { type: 'date-range' as const, label: '创建时间', name: ['startTime', 'endTime'] as [string, string] },
];

describe('QueryFilter', () => {
  it('根据 config 渲染对应数量的 form-item', () => {
    const wrapper = mount(QueryFilter, {
      props: { config: INPUT_CONFIG },
    });
    // config 项 + 1 个按钮组
    const formItems = wrapper.findAllComponents(AFormItem);
    expect(formItems.length).toBe(INPUT_CONFIG.length + 1);
  });

  it('渲染查询和重置按钮', () => {
    const wrapper = mount(QueryFilter, {
      props: { config: INPUT_CONFIG },
    });
    expect(wrapper.text()).toContain('查询');
    expect(wrapper.text()).toContain('重置');
  });

  it('点击查询按钮 emit search 事件，携带当前值', async () => {
    const wrapper = mount(QueryFilter, {
      props: { config: INPUT_CONFIG, modelValue: { name: 'test', status: 'active' } },
    });
    await wrapper.findAllComponents(AButton)[0].vm.$emit('click');
    expect(wrapper.emitted('search')?.[0][0]).toEqual({ name: 'test', status: 'active' });
  });

  it('点击重置按钮 emit update:modelValue 和 reset', async () => {
    const wrapper = mount(QueryFilter, {
      props: { config: INPUT_CONFIG, modelValue: { name: 'test', status: 'active' } },
    });
    const buttons = wrapper.findAllComponents(AButton);
    await buttons[1].vm.$emit('click');
    expect(wrapper.emitted('update:modelValue')?.[0][0]).toEqual({ name: undefined, status: undefined });
    expect(wrapper.emitted('reset')).toBeTruthy();
  });

  it('input 值变化时 emit update:modelValue', async () => {
    const wrapper = mount(QueryFilter, {
      props: { config: INPUT_CONFIG, modelValue: {} },
    });
    const input = wrapper.findComponent(AInput);
    await input.vm.$emit('update:value', 'hello');
    expect(wrapper.emitted('update:modelValue')?.[0][0]).toEqual({ name: 'hello' });
  });

  it('date-range 值变化时将数组解析为两个 key', async () => {
    const wrapper = mount(QueryFilter, {
      props: { config: DATE_RANGE_CONFIG, modelValue: {} },
    });
    const rangePicker = wrapper.findComponent(ARangePicker);
    await rangePicker.vm.$emit('update:value', ['2024-01-01', '2024-12-31']);
    expect(wrapper.emitted('update:modelValue')?.[0][0]).toEqual({
      startTime: '2024-01-01',
      endTime: '2024-12-31',
    });
  });

  it('date-range 反向同步：从 modelValue 读取两个 key 回填', () => {
    const wrapper = mount(QueryFilter, {
      props: {
        config: DATE_RANGE_CONFIG,
        modelValue: { startTime: '2024-01-01', endTime: '2024-12-31' },
      },
    });
    const rangePicker = wrapper.findComponent(ARangePicker);
    expect(rangePicker.props('value')).toEqual(['2024-01-01', '2024-12-31']);
  });

  it('date-range 重置时清空两个 key', async () => {
    const wrapper = mount(QueryFilter, {
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
    const wrapper = mount(QueryFilter, {
      props: {
        config: DATE_RANGE_CONFIG,
        modelValue: { startTime: '2024-01-01', endTime: '2024-12-31' },
      },
    });
    const rangePicker = wrapper.findComponent(ARangePicker);
    await rangePicker.vm.$emit('update:value', null);
    expect(wrapper.emitted('update:modelValue')?.[0][0]).toEqual({
      startTime: undefined,
      endTime: undefined,
    });
  });

  it('fieldProps 透传给对应组件', () => {
    const wrapper = mount(QueryFilter, {
      props: {
        config: [
          { type: 'select', label: '状态', name: 'status', fieldProps: { placeholder: '请选择', allowClear: true } },
        ],
      },
    });
    const select = wrapper.findComponent(ASelect);
    expect(select.props('placeholder')).toBe('请选择');
    expect(select.props('allowClear')).toBe(true);
  });

  it('labelWidth 设置 label 列宽度', () => {
    const wrapper = mount(QueryFilter, {
      props: { config: INPUT_CONFIG, labelWidth: 80 },
    });
    const formItem = wrapper.findComponent(AFormItem);
    expect(formItem.props('labelCol')).toEqual({ style: { width: '80px' } });
  });
});
```

- [ ] **Step 2: 运行测试**

Run: `cd template && npx vitest run src/shared/components/query-filter/QueryFilter.spec.ts`
Expected: 11 tests PASS

- [ ] **Step 3: 提交**

```bash
git add template/src/shared/components/query-filter/
git commit -m "feat: add QueryFilter config-driven filter component"
```
