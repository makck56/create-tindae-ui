<script setup lang="ts">
import { ref } from 'vue';

/**
 * Ant Design Vue「表单输入」展示块。
 *
 * 覆盖选择类、文本输入类、选择器类、数值/范围类组件，
 * 聚焦态与选中态的主色描边是这里需要肉眼核对的点。
 */
defineOptions({ name: 'AntdFormsBlock' });

// —— 各组件受控状态（演示交互，不提交任何业务）——
const checked = ref(true);
const radioVal = ref<string>('a');
const switchOn = ref(true);
const inputVal = ref('');
const selectVal = ref<string | undefined>(undefined);
const inputNumber = ref<number>(5);
const cascaderVal = ref<string[]>([]);
const treeSelectVal = ref<string | undefined>(undefined);
const autoCompleteVal = ref('');
const rate = ref<number>(4);
const slider = ref<number>(30);

// Select 选项：标准 { value, label } 结构
const selectOptions = [
  { value: 'opt1', label: '选项一' },
  { value: 'opt2', label: '选项二' },
];

// Cascader 选项：默认显示字段为 label
const cascaderOptions = [
  {
    value: 'zhejiang',
    label: '浙江',
    children: [{ value: 'hangzhou', label: '杭州' }],
  },
  {
    value: 'jiangsu',
    label: '江苏',
    children: [{ value: 'nanjing', label: '南京' }],
  },
];

// TreeSelect 数据：v3 默认显示字段为 title
const treeData = [
  { value: 'leaf1', title: '叶子一' },
  { value: 'leaf2', title: '叶子二' },
];

// AutoComplete 候选项
const autoCompleteOptions = [{ value: '前端' }, { value: '前端工程' }, { value: '前段' }];

// Ant Design Vue v4 已废弃 Mentions 子选项组件，统一使用 options 契约。
const mentionsOptions = [{ value: 'afc163' }, { value: 'zombiej' }];

/** AutoComplete 过滤：按输入文本模糊匹配候选 */
function filterOption(input: string, option: { value: string }): boolean {
  return option.value.includes(input);
}
</script>

<template>
  <!-- 选择控件：Checkbox / Radio / Switch -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">
    选择控件 Checkbox / Radio / Switch
  </h4>
  <a-space wrap class="mb-2">
    <a-checkbox v-model:checked="checked">Checkbox</a-checkbox>
    <a-radio-group v-model:value="radioVal">
      <a-radio value="a">A</a-radio>
      <a-radio value="b">B</a-radio>
    </a-radio-group>
    <a-radio-group v-model:value="radioVal" button-style="solid">
      <a-radio-button value="a">甲</a-radio-button>
      <a-radio-button value="b">乙</a-radio-button>
    </a-radio-group>
    <a-switch v-model:checked="switchOn" />
  </a-space>

  <!-- 文本输入：Input / Select / InputNumber -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">
    输入 Input / Select / InputNumber（聚焦观察主色描边）
  </h4>
  <a-space wrap class="mb-2">
    <a-input v-model:value="inputVal" placeholder="点我聚焦" style="width: 200px" />
    <a-select
      v-model:value="selectVal"
      :options="selectOptions"
      placeholder="请选择"
      style="width: 160px"
      allow-clear
    />
    <a-input-number v-model:value="inputNumber" :min="0" :max="10" />
  </a-space>

  <!-- 级联选择：Cascader / TreeSelect / AutoComplete -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">
    级联 Cascader / 树选择 TreeSelect / 自动补全 AutoComplete
  </h4>
  <a-space wrap class="mb-2">
    <a-cascader
      v-model:value="cascaderVal"
      :options="cascaderOptions"
      placeholder="选择地区"
      style="width: 200px"
    />
    <a-tree-select
      v-model:value="treeSelectVal"
      :tree-data="treeData"
      placeholder="选择节点"
      style="width: 200px"
      allow-clear
    />
    <a-auto-complete
      v-model:value="autoCompleteVal"
      :options="autoCompleteOptions"
      :filter-option="filterOption"
      placeholder="输入「前」试试"
      style="width: 200px"
    />
  </a-space>

  <!-- 数值/范围：Rate / Slider -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">评分 Rate / 滑动 Slider</h4>
  <a-space wrap>
    <a-rate v-model:value="rate" />
    <a-slider v-model:value="slider" style="width: 200px" />
  </a-space>

  <!-- 提及：Mentions -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">提及 Mentions（输入 @ 触发）</h4>
  <a-mentions :options="mentionsOptions" style="width: 100%" />
</template>
