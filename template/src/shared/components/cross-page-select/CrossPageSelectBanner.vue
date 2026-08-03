<script setup lang="ts">
defineOptions({ name: 'CrossPageSelectBanner' });

defineProps<{
  selectedCount: number;
  total: number;
}>();

const emit = defineEmits<{ clear: [] }>();
</script>

<template>
  <div
    class="flex items-center justify-between px-3 py-2 text-sm bg-primary-disabled border-b border-primary"
  >
    <span>已选 {{ selectedCount }} 条，总共 {{ total }} 条</span>
    <a-button type="link" danger @click="emit('clear')">清除选择</a-button>
  </div>
</template>
