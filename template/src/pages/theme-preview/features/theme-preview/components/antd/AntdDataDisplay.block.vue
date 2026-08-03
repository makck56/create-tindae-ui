<script setup lang="ts">
import { ref } from 'vue';

/**
 * Ant Design Vue「数据展示」展示块。
 *
 * 覆盖 Tag / Badge / Avatar / Statistic / Timeline / Collapse / Descriptions。
 * 头像背景、统计数值、徽标状态色可直观反映主题主色与语义色。
 */
defineOptions({ name: 'AntdDataDisplayBlock' });

/** Collapse 受控展开项 */
const activeCollapse = ref<string[]>(['1']);
</script>

<template>
  <!-- 标签 Tag -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">标签 Tag</h4>
  <a-space wrap class="mb-2">
    <a-tag color="processing">主色</a-tag>
    <a-tag color="success">成功</a-tag>
    <a-tag color="warning">警告</a-tag>
    <a-tag color="error">危险</a-tag>
    <a-tag color="default">默认</a-tag>
  </a-space>

  <!-- 徽标 Badge -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">徽标 Badge</h4>
  <a-space wrap class="mb-2" :size="24">
    <a-badge :count="5">
      <a-button>消息</a-button>
    </a-badge>
    <a-badge dot>
      <a-button>通知</a-button>
    </a-badge>
    <a-badge status="success" text="成功" />
    <a-badge status="processing" text="处理中" />
    <a-badge status="error" text="错误" />
  </a-space>

  <!-- 头像 Avatar：第三枚直接用主色作背景 -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">头像 Avatar</h4>
  <a-space wrap class="mb-2" :size="16">
    <a-avatar :size="64">U</a-avatar>
    <a-avatar>A</a-avatar>
    <a-avatar :size="32" style="background-color: var(--color-primary)">B</a-avatar>
  </a-space>

  <!-- 统计数值 Statistic：增长率用主色高亮 -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">统计数值 Statistic</h4>
  <a-space wrap class="mb-2" :size="48">
    <a-statistic title="活跃用户" :value="112893" />
    <a-statistic
      title="增长率"
      :value="11.28"
      :precision="2"
      suffix="%"
      :value-style="{ color: 'var(--color-primary)' }"
    />
  </a-space>

  <!-- 时间轴 Timeline -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">时间轴 Timeline</h4>
  <a-timeline class="mb-2">
    <a-timeline-item>创建项目 2026-07-01</a-timeline-item>
    <a-timeline-item color="green">接入主题系统 2026-07-05</a-timeline-item>
    <a-timeline-item>补全组件预览 2026-07-07</a-timeline-item>
  </a-timeline>

  <!-- 折叠面板 Collapse -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">折叠面板 Collapse</h4>
  <a-collapse v-model:active-key="activeCollapse" class="mb-2">
    <a-collapse-panel key="1" header="什么是主题预览页？">
      用于肉眼验证 Tailwind / Ant Design Vue / VXE Table / ECharts 四端在切换主题时的联动效果。
    </a-collapse-panel>
    <a-collapse-panel key="2" header="如何切换主题？">
      点击顶栏右上角的主题切换器，切换亮/暗模式或主色预设。
    </a-collapse-panel>
  </a-collapse>

  <!-- 描述列表 Descriptions -->
  <h4 class="mt-4 mb-2 text-[13px] font-semibold text-secondary">描述列表 Descriptions</h4>
  <a-descriptions title="项目信息" :column="2" bordered>
    <a-descriptions-item label="框架">Vue 3 + Vite</a-descriptions-item>
    <a-descriptions-item label="UI 库">Ant Design Vue</a-descriptions-item>
    <a-descriptions-item label="主题">Token 驱动</a-descriptions-item>
    <a-descriptions-item label="状态">运行中</a-descriptions-item>
  </a-descriptions>
</template>
