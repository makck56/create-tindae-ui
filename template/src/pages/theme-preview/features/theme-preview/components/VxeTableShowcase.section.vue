<script setup lang="ts">
import { ref } from 'vue';

/**
 * VXE Table 表格展示：静态数据 + 勾选 + hover/当前行高亮 + 排序。
 * 用于观察表头底色、行 hover、当前行、勾选行、排序图标、边框是否跟随主题。
 */
defineOptions({ name: 'VxeTableShowcaseSection' });

interface OrderRow {
  id: number;
  name: string;
  dept: string;
  amount: number;
  status: string;
}

const rows = ref<OrderRow[]>([
  { id: 1, name: '订单 A-001', dept: '销售部', amount: 1280, status: '成功' },
  { id: 2, name: '订单 A-014', dept: '市场部', amount: 560, status: '处理中' },
  { id: 3, name: '订单 B-207', dept: '销售部', amount: 3420, status: '成功' },
  { id: 4, name: '订单 B-231', dept: '客服部', amount: 880, status: '已取消' },
  { id: 5, name: '订单 C-090', dept: '市场部', amount: 1980, status: '成功' },
  { id: 6, name: '订单 C-112', dept: '销售部', amount: 720, status: '处理中' },
  { id: 7, name: '订单 D-455', dept: '客服部', amount: 2640, status: '成功' },
  { id: 8, name: '订单 D-489', dept: '市场部', amount: 430, status: '已取消' },
]);

// vxe-grid columns 配置：type:'checkbox' 勾选列 / type:'seq' 序号列 / sortable 排序。
const columns = [
  { type: 'checkbox', width: 50 },
  { type: 'seq', title: '#', width: 60 },
  { field: 'name', title: '订单名称', sortable: true, minWidth: 140 },
  { field: 'dept', title: '部门', minWidth: 100 },
  { field: 'amount', title: '金额（元）', sortable: true, width: 130 },
  { field: 'status', title: '状态', width: 110 },
];

// 主题预览页只展示静态表格，不使用 VXE 内置查询表单和工具栏。
// 在当前表格实例上显式关闭，避免 vxe-table 4.20.x 的默认 grid 配置路径继续查找空 renderer，
// 从而触发 "Renderer 'undefined' is not imported"。
const disabledFormConfig = { enabled: false };
const disabledToolbarConfig = { enabled: false };
</script>

<template>
  <a-card title="③ VXE Table 表格">
    <p class="mb-3 text-sm text-secondary">
      勾选行 / 鼠标悬停行 / 点击行 / 点击列头排序，观察表头、行、排序图标、边框是否跟随主题。
    </p>
    <vxe-grid
      :data="rows"
      :columns="columns"
      :form-config="disabledFormConfig"
      :toolbar-config="disabledToolbarConfig"
      :row-config="{ isHover: true, isCurrent: true }"
      :checkbox-config="{ highlight: true }"
      height="320"
      border
    />
  </a-card>
</template>
