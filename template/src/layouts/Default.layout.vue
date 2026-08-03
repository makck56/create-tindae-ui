<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined } from '@ant-design/icons-vue';
import { useAppStore } from '@/modules/app/stores/app';
import { useAuthStore } from '@/modules/auth/stores/auth';
import { useTabStore, TabBar } from '@/layouts/tab';
import { ErrorBoundary } from '@/shared/components/error-boundary';
import { ThemeSwitcher } from '@/shared/components/theme-switcher';
import { useTheme } from '@/core/theme';

defineOptions({ name: 'DefaultLayout' });

const appStore = useAppStore();
const authStore = useAuthStore();
const tabStore = useTabStore();
const route = useRoute();
const router = useRouter();

// 侧边栏的明暗由布局本地样式接管：
// - 菜单仍使用 Ant Design Vue 的 light/dark 契约，确保键盘、选中态和折叠态行为保持官方实现；
// - Sider 容器和折叠 trigger 用本文件下方的 token 化 CSS 覆盖 Ant 默认深色背景，避免 v4 升级后亮色模式侧栏发黑。
const { isDark } = useTheme();
const menuTheme = computed<'dark' | 'light'>(() => (isDark.value ? 'dark' : 'light'));
const siderClass = computed(() => (isDark.value ? 'app-sider--dark' : 'app-sider--light'));

// 侧边栏直接渲染后端下发的菜单树（authStore.menus 为唯一真相源）。
// 后端按用户角色已过滤，前端不再需要本地 filterMenu / menuConfig 双源。
const menus = computed(() => authStore.menus);

const selectedKeys = computed(() => {
  const name = route.name as string;
  return name ? [name] : [];
});

function handleMenuClick({ key }: { key: string }) {
  router.push({ name: key });
}

async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}
</script>

<template>
  <!-- h-screen + overflow-hidden：外层固定一屏高、禁止整页滚动；
       配合内容区 overflow-auto，实现「侧边栏 / 顶栏 / TabBar 固定，仅内容区滚动」 -->
  <a-layout class="h-screen overflow-hidden">
    <a-layout-sider
      v-model:collapsed="appStore.sidebarCollapsed"
      collapsible
      :width="220"
      :class="siderClass"
    >
      <div :class="['p-4 text-center font-bold text-lg', isDark ? 'text-white' : 'text-title']">
        {{ appStore.appName }}
      </div>
      <a-menu
        :theme="menuTheme"
        mode="inline"
        :selected-keys="selectedKeys"
        @click="handleMenuClick"
      >
        <template v-for="item in menus" :key="item.routeName ?? item.label">
          <a-menu-item v-if="!item.children" :key="item.routeName">
            {{ item.label }}
          </a-menu-item>
          <a-sub-menu v-else :key="item.label" :title="item.label">
            <a-menu-item v-for="child in item.children" :key="child.routeName">
              {{ child.label }}
            </a-menu-item>
          </a-sub-menu>
        </template>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="app-layout-header px-4 flex items-center justify-between shadow-xs">
        <a-button type="text" @click="appStore.toggleSidebar">
          <template #icon>
            <MenuFoldOutlined v-if="!appStore.sidebarCollapsed" />
            <MenuUnfoldOutlined v-else />
          </template>
        </a-button>
        <div class="flex items-center gap-4">
          <!-- 主题切换：主色预设 + 亮/暗模式（副作用由 ThemeProvider 统一承接） -->
          <ThemeSwitcher />
          <span v-if="authStore.user" class="text-secondary">{{ authStore.user.username }}</span>
          <a-button type="text" @click="handleLogout">
            <template #icon><LogoutOutlined /></template>
            登出
          </a-button>
        </div>
      </a-layout-header>
      <TabBar />
      <!-- overflow-auto + min-h-0：内容区独立滚动。min-h-0 是 flex 子项能收缩+溢出滚动的关键
           （默认 min-height:auto 会撑开父级、导致整页滚动而非本区域滚动） -->
      <a-layout-content class="app-layout-content m-4 p-4 rounded overflow-auto min-h-0">
        <!-- ErrorBoundary 包裹业务内容区：捕获页面渲染异常 → 显示 fallback，保留布局壳不白屏 -->
        <ErrorBoundary>
          <router-view v-slot="{ Component }">
            <keep-alive :include="tabStore.cachedNames">
              <component
                :is="Component"
                v-if="!tabStore.isExcluded($route.name as string)"
                :key="$route.fullPath"
              />
            </keep-alive>
            <div
              v-if="tabStore.isExcluded($route.name as string)"
              class="flex items-center justify-center py-20"
            >
              <a-spin tip="刷新中..." />
            </div>
          </router-view>
        </ErrorBoundary>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style scoped>
/*
 * Ant Design Vue 的 Layout Header 默认使用 background: #001529。
 * Tailwind v4 升级后，工具类生成与三方样式的最终顺序更容易变化；
 * 因此这里用布局专属类承接主题变量，并通过 !important 明确覆盖 antd 默认背景。
 */
.app-layout-header {
  background: var(--bg-container) !important;
}

/*
 * 内容区同样使用语义背景变量，避免继续依赖 bg-white 这类 Tailwind 内置色名称。
 * --bg-container 会随 ThemeProvider 注入的亮/暗主题同步变化。
 */
.app-layout-content {
  background: var(--bg-container) !important;
}

/*
 * 侧边栏背景不能只依赖 Ant Layout Sider 的默认样式：
 * Ant Design Vue 的 Sider 默认背景是深蓝黑色，v4 升级后旧的 Ant 选择器桥接已被移除，
 * 如果这里不显式接管，亮色主题下会出现「侧边栏菜单栏变暗」的视觉回归。
 */
.app-sider--light {
  background: var(--bg-container) !important;
  border-right: 1px solid var(--border-light);
}

.app-sider--light :deep(.ant-layout-sider-trigger) {
  color: var(--text-title) !important;
  background: var(--bg-container) !important;
  border-top: 1px solid var(--border-light);
}

.app-sider--light :deep(.ant-menu) {
  color: var(--text-body);
  background: var(--bg-container);
}

.app-sider--dark {
  background: var(--bg-page) !important;
}

.app-sider--dark :deep(.ant-layout-sider-trigger) {
  color: var(--text-inverse) !important;
  background: var(--bg-page) !important;
}
</style>
