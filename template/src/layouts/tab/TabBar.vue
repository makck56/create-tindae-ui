<script setup lang="ts">
import { ReloadOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import { useTabStore } from './tab';

defineOptions({ name: 'TabBar' });

const tabStore = useTabStore();
const router = useRouter();

function handleTabClick(key: string | number) {
  const tab = tabStore.tabs.find((t) => t.name === key);
  if (tab && tab.name !== tabStore.activeTab) router.push(tab.path);
}

function handleTabEdit(e: MouseEvent | KeyboardEvent | string | number, action: 'add' | 'remove') {
  if (action === 'remove' && typeof e === 'string') {
    tabStore.closeTab(e, router);
  }
}

function handleRefresh() {
  if (tabStore.activeTab) {
    tabStore.refreshTab(tabStore.activeTab);
  }
}
</script>

<template>
  <div v-if="tabStore.tabs.length > 0" class="px-4 pt-2 bg-white flex items-center">
    <a-tabs
      type="editable-card"
      hide-add
      :active-key="tabStore.activeTab"
      @change="handleTabClick"
      @edit="handleTabEdit"
      class="flex-1"
    >
      <a-tab-pane
        v-for="tab in tabStore.tabs"
        :key="tab.name"
        :tab="tab.title"
        :closable="tabStore.tabs.length > 1"
      />
    </a-tabs>
    <a-button type="text" size="small" :disabled="!tabStore.activeKeepAlive" @click="handleRefresh">
      <template #icon><ReloadOutlined /></template>
    </a-button>
  </div>
</template>
