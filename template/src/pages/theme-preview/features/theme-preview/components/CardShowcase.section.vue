<script setup lang="ts">
/**
 * 典型业务卡片：仅使用语义色（bg-container / text-title / border-light / 主色），
 * 验证暗色模式下的自动适配，以及主色预设变化时主色区块的联动。全程 Tailwind 工具类。
 */
defineOptions({ name: 'CardShowcaseSection' });

const kpis = [
  { label: '总订单', value: '12,860', delta: '+12.5%', trend: 'up' as const },
  { label: '活跃用户', value: '3,420', delta: '+3.2%', trend: 'up' as const },
  { label: '退款率', value: '1.8%', delta: '-0.4%', trend: 'down' as const },
];
</script>

<template>
  <a-card title="⑤ 典型业务卡片（语义色 / 暗色适配）">
    <p class="mb-4 text-sm text-secondary">
      下方卡片只用语义 CSS 变量，切换亮暗时背景 / 文字 /
      边框自动适配；切换主色预设时主色区块立即变化。
    </p>

    <!-- KPI 卡片：默认单列，md 及以上三列 -->
    <div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
      <div
        v-for="k in kpis"
        :key="k.label"
        class="rounded-lg border border-light bg-[var(--bg-container)] p-4"
      >
        <div class="text-sm text-secondary">{{ k.label }}</div>
        <div class="mt-1 text-[26px] font-bold text-title">{{ k.value }}</div>
        <div
          class="mt-1 text-[13px] font-semibold"
          :class="k.trend === 'up' ? 'text-success' : 'text-danger'"
        >
          {{ k.delta }}
        </div>
      </div>
    </div>

    <!-- 主色 hero 区块 -->
    <div class="rounded-lg bg-primary p-5 text-[var(--text-inverse)]">
      <div class="text-lg font-bold">主色背景区域</div>
      <div class="mt-2 text-sm leading-relaxed opacity-90">
        背景 <code>var(--color-primary)</code>、文字 <code>var(--text-inverse)</code>。
        换主色预设时此处立即变化，用于验证 primary 联动。
      </div>
      <a-button class="mt-3" ghost>Ghost 按钮（反色描边）</a-button>
    </div>
  </a-card>
</template>
