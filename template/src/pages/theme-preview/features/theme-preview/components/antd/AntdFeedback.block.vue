<script setup lang="ts">
import { ref, h } from 'vue';
import { notification } from 'ant-design-vue';
import { SmileOutlined } from '@ant-design/icons-vue';

/**
 * Ant Design Vue「反馈」展示块。
 *
 * 覆盖 Alert / Progress / Spin / Skeleton / Empty / Result / Notification。
 * Alert 边框、Progress 主色填充、Notification 图标色均跟随主题，是核对重点。
 */
defineOptions({ name: 'AntdFeedbackBlock' });

const progress = ref<number>(66);

/** 弹出 notification（图标与主色均跟随当前主题） */
function openNotification(): void {
  notification.open({
    message: '通知标题',
    description: '这是一条 notification 通知，图标与主色均跟随当前主题。',
    icon: h(SmileOutlined),
  });
}
</script>

<template>
  <!-- 警告提示 Alert：四种语义色 -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">警告提示 Alert</h4>
  <a-alert class="mb-2" type="info" show-icon message="信息提示文案" />
  <a-alert class="mb-2" type="success" show-icon message="成功提示文案" />
  <a-alert class="mb-2" type="warning" show-icon message="警告提示文案" />
  <a-alert class="mb-2" type="error" show-icon message="错误提示文案" />

  <!-- 进度 Progress -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">进度 Progress</h4>
  <a-progress :percent="progress" class="mb-2" />

  <!-- 加载 Spin / 骨架屏 Skeleton -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">加载 Spin / 骨架屏 Skeleton</h4>
  <a-space wrap class="mb-2" :size="24">
    <a-spin />
    <a-spin tip="加载中...">
      <div class="w-[160px] h-[40px] rounded bg-[var(--bg-subtle)]" />
    </a-spin>
  </a-space>
  <a-skeleton class="mb-2" :rows="2" active />

  <!-- 空状态 Empty -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">空状态 Empty</h4>
  <a-empty class="mb-2" />

  <!-- 结果 Result -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">结果 Result</h4>
  <a-result status="success" title="操作成功" sub-title="订单号：20260707-0001" class="mb-2">
    <template #extra>
      <a-button type="primary">查看详情</a-button>
      <a-button>返回列表</a-button>
    </template>
  </a-result>

  <!-- Notification 触发 -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">通知 Notification</h4>
  <a-button @click="openNotification">弹出 Notification</a-button>
</template>
