<script setup lang="ts">
import type { StyleValue } from 'vue';

defineOptions({ name: 'PageWrapper' });

defineProps<{
  headerClass?: string;
  headerStyle?: StyleValue;
  contentClass?: string;
  contentStyle?: StyleValue;
  footerClass?: string;
  footerStyle?: StyleValue;
}>();
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div
      v-if="$slots.header || $slots.search || $slots.extra"
      :class="['bg-white rounded p-4 mb-4', headerClass]"
      :style="headerStyle"
    >
      <slot name="header">
        <div class="flex items-center justify-between">
          <div><slot name="search" /></div>
          <div><slot name="extra" /></div>
        </div>
      </slot>
    </div>

    <!-- Content -->
    <div :class="['flex-1 overflow-auto p-4', contentClass]" :style="contentStyle">
      <slot />
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" :class="['pt-4', footerClass]" :style="footerStyle">
      <slot name="footer" />
    </div>
  </div>
</template>
