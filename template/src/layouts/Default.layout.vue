<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined } from '@ant-design/icons-vue';
import { useAppStore } from '@/modules/app/stores/app';
import { useAuthStore } from '@/modules/auth/stores/auth';
import { menuConfig } from '@/modules/app/config/menu.config';
import type { MenuItem } from '@/modules/app/config/menuTypes';

defineOptions({ name: 'DefaultLayout' });

const appStore = useAppStore();
const authStore = useAuthStore();
const router = useRouter();

function filterMenu(items: MenuItem[]): MenuItem[] {
  return items
    .filter((item) => !item.code || authStore.permissionCodes.has(item.code))
    .map((item) =>
      item.children ? { ...item, children: filterMenu(item.children) } : item,
    )
    .filter((item) => !item.children || item.children.length > 0);
}

const filteredMenu = computed(() => filterMenu(menuConfig));

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
    <a-layout-sider v-model:collapsed="appStore.sidebarCollapsed" collapsible :width="220">
      <div class="p-4 text-white text-center font-bold text-lg">{{ appStore.appName }}</div>
      <a-menu theme="dark" mode="inline" @click="handleMenuClick">
        <template v-for="item in filteredMenu" :key="item.routeName ?? item.label">
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
          <span v-if="authStore.user" class="text-gray-600">{{ authStore.user.username }}</span>
          <a-button type="text" @click="handleLogout">
            <template #icon><LogoutOutlined /></template>
            登出
          </a-button>
        </div>
      </a-layout-header>
      <a-layout-content class="m-4 p-4 bg-white rounded">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
