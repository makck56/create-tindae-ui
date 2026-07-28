<script setup lang="ts">
/**
 * 色板展示：直接渲染 var(--color-*) 等 CSS 变量。
 * 切换主题（亮暗 / 预设）时，:root 变量刷新，色块实时变化。
 * 全程 Tailwind 工具类；未注册的语义变量用 arbitrary value（如 bg-[var(--bg-subtle)]）。
 */
defineOptions({ name: 'ColorPaletteSection' });

/** 品牌 / 功能色系：每个色系四个交互态 */
const scales = [
  { key: 'primary', label: '主色 Primary' },
  { key: 'success', label: '成功 Success' },
  { key: 'warning', label: '警告 Warning' },
  { key: 'danger', label: '危险 Danger' },
  { key: 'info', label: '信息 Info' },
];
/** 色阶四态后缀（'' 即 DEFAULT） */
const states = ['', '-hover', '-active', '-disabled'];

/** 文本色阶 */
const textSwatches = [
  { name: 'title', varName: '--text-title' },
  { name: 'body', varName: '--text-body' },
  { name: 'secondary', varName: '--text-secondary' },
  { name: 'disabled', varName: '--text-disabled' },
  { name: 'inverse', varName: '--text-inverse' },
];

/** 背景色阶 */
const bgSwatches = [
  { name: 'page', varName: '--bg-page' },
  { name: 'container', varName: '--bg-container' },
  { name: 'elevated', varName: '--bg-elevated' },
  { name: 'white', varName: '--bg-white' },
  { name: 'subtle', varName: '--bg-subtle' },
];

/** 边框色阶 */
const borderSwatches = [
  { name: 'base', varName: '--border-base' },
  { name: 'light', varName: '--border-light' },
  { name: 'lighter', varName: '--border-lighter' },
  { name: 'extra-light', varName: '--border-extra-light' },
];
</script>

<template>
  <a-card title="① Tailwind / CSS 变量色板">
    <p class="mb-3 text-sm text-secondary">
      色块直接以 <code>var(--color-*)</code> 渲染，切换主题时实时变化。
    </p>

    <!-- 品牌 / 功能色 -->
    <div v-for="s in scales" :key="s.key" class="mb-3">
      <div class="mb-1 text-sm font-semibold text-secondary">{{ s.label }}</div>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="st in states"
          :key="st"
          class="inline-flex h-14 w-[104px] items-end justify-center rounded-md border border-[var(--border-lighter)] p-1"
          :style="{ backgroundColor: `var(--color-${s.key}${st})` }"
        >
          <!-- 色块标签：半透明黑底白字，任意主色上都清晰 -->
          <span class="rounded-xs bg-black/40 px-1 text-[11px] leading-tight text-white">
            {{ st || 'DEFAULT' }}
          </span>
        </div>
      </div>
    </div>

    <a-divider />

    <!-- 文本 -->
    <div class="mb-1 text-sm font-semibold text-secondary">文本 Text</div>
    <div class="mb-4 flex flex-wrap gap-2">
      <div
        v-for="t in textSwatches"
        :key="t.varName"
        class="inline-flex h-14 w-[104px] items-center justify-center rounded-md border border-[var(--border-light)] bg-[var(--bg-container)] text-sm font-bold"
        :style="{ color: `var(${t.varName})` }"
      >
        {{ t.name }}
      </div>
    </div>

    <!-- 背景 -->
    <div class="mb-1 text-sm font-semibold text-secondary">背景 Background</div>
    <div class="mb-4 flex flex-wrap gap-2">
      <div
        v-for="b in bgSwatches"
        :key="b.varName"
        class="inline-flex h-14 w-[104px] items-end justify-center rounded-md border border-[var(--border-base)] p-1"
        :style="{ backgroundColor: `var(${b.varName})` }"
      >
        <span
          class="rounded-xs border border-light bg-[var(--bg-subtle)] px-1 text-[11px] leading-tight text-[var(--text-title)]"
        >
          {{ b.name }}
        </span>
      </div>
    </div>

    <!-- 边框 -->
    <div class="mb-1 text-sm font-semibold text-secondary">边框 Border</div>
    <div class="flex flex-wrap gap-2">
      <div
        v-for="b in borderSwatches"
        :key="b.varName"
        class="inline-flex h-14 w-[104px] items-end justify-center rounded-md bg-[var(--bg-container)] p-1"
        :style="{ border: `2px solid var(${b.varName})` }"
      >
        <span
          class="rounded-xs border border-light bg-[var(--bg-subtle)] px-1 text-[11px] leading-tight text-[var(--text-title)]"
        >
          {{ b.name }}
        </span>
      </div>
    </div>
  </a-card>
</template>
