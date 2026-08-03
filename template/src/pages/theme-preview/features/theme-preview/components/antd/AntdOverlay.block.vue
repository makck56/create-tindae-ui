<script setup lang="ts">
import { ref } from 'vue';
import { message } from 'ant-design-vue';

/**
 * Ant Design Vue「浮层」展示块。
 *
 * 覆盖 Tooltip / Popover / Popconfirm / Modal / Drawer。
 * 注意：Ant Design Vue v4 的受控显隐统一使用 open 契约。
 * 触发按钮、确认按钮、聚焦态均会跟随主题主色。
 */
defineOptions({ name: 'AntdOverlayBlock' });

/** Modal / Drawer 显隐受控（v4 使用 open） */
const modalVisible = ref(false);
const drawerVisible = ref(false);

/** Popconfirm 确认回调 */
function onConfirm(): void {
  message.success('Popconfirm 已确认');
}
</script>

<template>
  <!-- 文字提示 Tooltip -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">文字提示 Tooltip</h4>
  <a-space wrap class="mb-2">
    <a-tooltip>
      <template #title>这是一段 tooltip 提示文字</template>
      <a-button>悬浮我（Tooltip）</a-button>
    </a-tooltip>
  </a-space>

  <!-- 气泡卡片 Popover -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">气泡卡片 Popover</h4>
  <a-space wrap class="mb-2">
    <a-popover title="标题" trigger="hover">
      <template #content>
        <p class="m-0">这是 Popover 的内容区域，可承载更丰富的信息。</p>
      </template>
      <a-button>悬浮我（Popover）</a-button>
    </a-popover>
  </a-space>

  <!-- 气泡确认框 Popconfirm -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">气泡确认框 Popconfirm</h4>
  <a-space wrap class="mb-2">
    <a-popconfirm title="确定执行此操作吗？" ok-text="确定" cancel-text="取消" @confirm="onConfirm">
      <a-button type="primary">点击删除（Popconfirm）</a-button>
    </a-popconfirm>
  </a-space>

  <!-- Modal / Drawer：触发按钮跟随主色 -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">
    模态框 Modal / 抽屉 Drawer（触发按钮跟随主色）
  </h4>
  <a-space wrap>
    <a-button type="primary" @click="modalVisible = true">打开 Modal</a-button>
    <a-button @click="drawerVisible = true">打开 Drawer</a-button>
  </a-space>

  <!-- Modal：v4 使用 open 受控，避免 visible 旧契约回归。 -->
  <a-modal v-model:open="modalVisible" title="模态框标题" ok-text="确认" cancel-text="取消">
    <p class="m-0">Modal 内容区：切换主题后，确认按钮、关闭图标、标题聚焦态都会跟随主色。</p>
  </a-modal>

  <!-- Drawer -->
  <a-drawer v-model:open="drawerVisible" title="抽屉标题" width="380">
    <p class="m-0">Drawer 内容区：同样由主题系统统一接管配色。</p>
  </a-drawer>
</template>
