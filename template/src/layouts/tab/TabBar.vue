<script setup lang="ts">
import { ReloadOutlined, CloseOutlined } from '@ant-design/icons-vue';
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
      <a-dropdown v-for="tab in tabStore.tabs" :key="tab.key" :trigger="['contextmenu']">
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
/* 多标签页栏：全部引用主题 CSS 变量，跟随亮暗 / 主色 / 全套预设。
   注：<style scoped> 仅给选择器加 data 属性，不影响 var() 引用 :root 上的全局变量。 */
.tab-bar {
  padding: 8px 16px 0;
  background: var(--bg-container);
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

/* 标签默认态：次级背景 + 次要文字色 */
.tab-bar__tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  background: var(--bg-subtle);
  color: var(--text-secondary);
  transition:
    background 0.2s,
    color 0.2s;
  user-select: none;
}

/* hover：在容器色上叠加少量前景色，亮 / 暗模式都有可见反馈 */
.tab-bar__tag:hover {
  background: color-mix(in srgb, var(--text-title) 8%, var(--bg-container));
}

/* 激活标签：主色实底 + 反色文字（切主色立即跟随） */
.tab-bar__tag--active {
  background: var(--color-primary);
  color: var(--text-inverse);
}

.tab-bar__tag--active:hover {
  background: var(--color-primary-hover);
}

.tab-bar__close {
  font-size: 10px;
  border-radius: 50%;
  padding: 2px;
  line-height: 1;
  transition: background 0.2s;
}

/* 关闭按钮 hover：叠加前景色，亮 / 暗通用 */
.tab-bar__close:hover {
  background: color-mix(in srgb, var(--text-title) 12%, transparent);
}

/* 激活标签上的关闭按钮 hover：反色叠加（在主色底上可见） */
.tab-bar__tag--active .tab-bar__close:hover {
  background: color-mix(in srgb, var(--text-inverse) 30%, transparent);
}
</style>
