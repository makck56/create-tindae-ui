<script setup lang="ts">
// 走深路径而非 'ant-design-vue' 根 barrel：根入口 es/index.js 的 install(Object.keys 遍历全组件)
// 会破坏 tree-shaking，把全量 antd 钉进包。Form/FormItem/Button 模板用小写 <a-*>，已由 resolver 按需，无需 import。
import AInput from 'ant-design-vue/es/input';
import ASelect from 'ant-design-vue/es/select';
import ATreeSelect from 'ant-design-vue/es/tree-select';
import ACascader from 'ant-design-vue/es/cascader';
import ADatePicker, { RangePicker as ARangePicker } from 'ant-design-vue/es/date-picker';
import type { FilterItemConfig } from './types';
import { COPY } from '@/shared/constants/copy';

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

function isDateRange(
  item: FilterItemConfig,
): item is Extract<FilterItemConfig, { type: 'date-range' }> {
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
      :label-col="{
        style: labelWidth
          ? { width: typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth }
          : undefined,
      }"
    >
      <component
        :is="COMPONENT_MAP[item.type]"
        v-bind="item.fieldProps"
        :value="getFieldValue(item)"
        @update:value="handleFieldChange(item, $event)"
        @press-enter="item.type === 'input' ? handleSearch() : undefined"
      />
    </a-form-item>
    <a-form-item>
      <a-button type="primary" @click="handleSearch">{{ COPY.COMMON.SEARCH }}</a-button>
      <a-button class="ml-2" @click="handleReset">{{ COPY.COMMON.RESET }}</a-button>
    </a-form-item>
  </a-form>
</template>
