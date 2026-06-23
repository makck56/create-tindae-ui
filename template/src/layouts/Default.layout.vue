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

// 侧边栏跟随全局亮 / 暗：亮色=浅色侧边栏 + light 菜单，暗色=深色侧边栏 + dark 菜单。
// sider 容器 / trigger 的背景由 antd.ts 的 .app-sider--light / --dark 规则接管。
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
  <a-layout class="min-h-screen">
    <a-layout-sider
      v-model:collapsed="appStore.sidebarCollapsed"
      collapsible
      :width="220"
      :class="siderClass"
    >
      <div :class="['p-4 text-center font-bold text-lg', isDark ? 'text-white' : 'text-title']">
        {{ appStore.appName }}
      </div>
      <a-menu :theme="menuTheme" mode="inline" :selected-keys="selectedKeys" @click="handleMenuClick">
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
      <a-layout-header class="bg-white px-4 flex items-center justify-between shadow-sm">
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
      <a-layout-content class="m-4 p-4 bg-white rounded">
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
