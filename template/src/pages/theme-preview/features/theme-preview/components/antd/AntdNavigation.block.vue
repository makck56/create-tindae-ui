<script setup lang="ts">
import { ref } from 'vue';
import { DownOutlined } from '@ant-design/icons-vue';

/**
 * Ant Design Vue「导航」展示块。
 *
 * 覆盖分页、标签页、步骤、菜单、面包屑、下拉菜单。
 * 菜单选中态、面包屑末级、分页当前页均会高亮主色，是核对重点。
 */
defineOptions({ name: 'AntdNavigationBlock' });

// —— 受控状态 ——
const page = ref<number>(3);
const tab = ref<string>('1');
const stepCurrent = ref<number>(1);
const menuSelectedKeys = ref<string[]>(['nav1']);

/** 步骤切换：循环 1→2→3→1 */
function nextStep(): void {
  stepCurrent.value = (stepCurrent.value % 3) + 1;
}
</script>

<template>
  <!-- 分页 -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">分页 Pagination</h4>
  <a-pagination v-model:current="page" :total="50" class="mb-2" />

  <!-- 标签页 -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">标签页 Tabs</h4>
  <a-tabs v-model:active-key="tab" class="mb-2">
    <a-tab-pane key="1" tab="标签一">标签一内容</a-tab-pane>
    <a-tab-pane key="2" tab="标签二">标签二内容</a-tab-pane>
  </a-tabs>

  <!-- 步骤 -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">步骤 Steps</h4>
  <a-steps :current="stepCurrent - 1" size="small" class="mb-2">
    <a-step title="第一步" />
    <a-step title="第二步" />
    <a-step title="第三步" />
  </a-steps>
  <a-button size="small" class="mb-2" @click="nextStep">下一步</a-button>

  <!-- 导航菜单：选中项 / 悬浮子菜单高亮主色 -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">
    导航菜单 Menu（选中态跟随主色）
  </h4>
  <a-menu v-model:selected-keys="menuSelectedKeys" mode="horizontal" class="mb-2">
    <a-menu-item key="nav1">菜单项一</a-menu-item>
    <a-menu-item key="nav2">菜单项二</a-menu-item>
    <a-sub-menu key="sub" title="子菜单">
      <a-menu-item key="nav3">子项三</a-menu-item>
      <a-menu-item key="nav4">子项四</a-menu-item>
    </a-sub-menu>
  </a-menu>

  <!-- 面包屑：末级为当前页（主色） -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">面包屑 Breadcrumb</h4>
  <a-breadcrumb class="mb-2">
    <a-breadcrumb-item>首页</a-breadcrumb-item>
    <a-breadcrumb-item>列表</a-breadcrumb-item>
    <a-breadcrumb-item>详情</a-breadcrumb-item>
  </a-breadcrumb>

  <!-- 下拉菜单 -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">下拉菜单 Dropdown</h4>
  <a-dropdown>
    <a-button>悬浮我展开 <DownOutlined /></a-button>
    <template #overlay>
      <a-menu>
        <a-menu-item>选项一</a-menu-item>
        <a-menu-item>选项二</a-menu-item>
        <a-menu-item>选项三</a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>
