<script setup lang="ts">
import {
  ReloadOutlined,
  CloseOutlined,
} from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import { useTabStore } from './tab';

defineOptions({ name: 'TabBar' });

const tabStore = useTabStore();
const router = useRouter();

function handleTabClick(key: string) {
  if (key !== tabStore.activeTab) {
    const tab = tabStore.tabs.find((t) => t.key === key);
    if (tab) router.push(tab.path);
  }
}

function handleClose(key: string, e?: MouseEvent) {
  e?.stopPropagation();
  tabStore.closeTab(key, router);
}

function handleRefresh(key: string) {
  tabStore.refreshTab(key);
}

function handleCloseLeft(key: string) {
  tabStore.closeLeftTabs(key, router);
}

function handleCloseRight(key: string) {
  tabStore.closeRightTabs(key, router);
}

function handleCloseOthers(key: string) {
  tabStore.closeOtherTabs(key, router);
}

function getMenuDisabled(key: string) {
  const index = tabStore.tabs.findIndex((t) => t.key === key);
  const tab = index !== -1 ? tabStore.tabs[index] : undefined;
  return {
    refresh: !tab?.keepAlive,
    close: tabStore.tabs.length <= 1,
    closeLeft: index <= 0,
    closeRight: index === -1 || index >= tabStore.tabs.length - 1,
    closeOthers: tabStore.tabs.length <= 1,
  };
}
</script>

<template>
  <div v-if="tabStore.tabs.length > 0" class="tab-bar">
    <div class="tab-bar__list">
      <a-dropdown
        v-for="tab in tabStore.tabs"
        :key="tab.key"
        :trigger="['contextmenu']"
      >
        <div
          class="tab-bar__tag"
          :class="{ 'tab-bar__tag--active': tab.key === tabStore.activeTab }"
          @click="handleTabClick(tab.key)"
        >
          <span class="tab-bar__title">{{ tab.title }}</span>
          <CloseOutlined
            v-if="tabStore.tabs.length > 1"
            class="tab-bar__close"
            @click="handleClose(tab.key, $event)"
          />
        </div>
        <template #overlay>
          <a-menu>
            <a-menu-item
              key="refresh"
              :disabled="getMenuDisabled(tab.key).refresh"
              @click="handleRefresh(tab.key)"
            >
              <ReloadOutlined />
              <span style="margin-left: 8px">刷新</span>
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item
              key="close"
              :disabled="getMenuDisabled(tab.key).close"
              @click="handleClose(tab.key)"
            >
              <CloseOutlined />
              <span style="margin-left: 8px">关闭</span>
            </a-menu-item>
            <a-menu-item
              key="closeLeft"
              :disabled="getMenuDisabled(tab.key).closeLeft"
              @click="handleCloseLeft(tab.key)"
            >
              <span style="margin-left: 24px">关闭左侧</span>
            </a-menu-item>
            <a-menu-item
              key="closeRight"
              :disabled="getMenuDisabled(tab.key).closeRight"
              @click="handleCloseRight(tab.key)"
            >
              <span style="margin-left: 24px">关闭右侧</span>
            </a-menu-item>
            <a-menu-item
              key="closeOthers"
              :disabled="getMenuDisabled(tab.key).closeOthers"
              @click="handleCloseOthers(tab.key)"
            >
              <span style="margin-left: 24px">关闭其他</span>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </div>
</template>

<style scoped>
.tab-bar {
  padding: 8px 16px 0;
  background: #fff;
}

.tab-bar__list {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
}

.tab-bar__list::-webkit-scrollbar {
  display: none;
}

.tab-bar__tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  background: #f5f5f5;
  color: #666;
  transition: background 0.2s, color 0.2s;
  user-select: none;
}

.tab-bar__tag:hover {
  background: #e8e8e8;
}

.tab-bar__tag--active {
  background: #1677ff;
  color: #fff;
}

.tab-bar__tag--active:hover {
  background: #4096ff;
}

.tab-bar__close {
  font-size: 10px;
  border-radius: 50%;
  padding: 2px;
  line-height: 1;
  transition: background 0.2s;
}

.tab-bar__close:hover {
  background: rgba(0, 0, 0, 0.12);
}

.tab-bar__tag--active .tab-bar__close:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
