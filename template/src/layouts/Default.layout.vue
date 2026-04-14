<script setup lang="ts">
import { useAppStore } from '@/modules/app/stores/app';
import { useRouter } from 'vue-router';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue';

defineOptions({ name: 'DefaultLayout' });

const appStore = useAppStore();
const router = useRouter();

function navigateTo(path: string) {
  router.push(path);
}
</script>

<template>
  <a-layout class="min-h-screen">
    <a-layout-sider v-model:collapsed="appStore.sidebarCollapsed" collapsible :width="220">
      <div class="p-4 text-white text-center font-bold text-lg">{{ appStore.appName }}</div>
      <a-menu theme="dark" mode="inline" @click="({ key }: { key: string }) => navigateTo(key)">
        <a-menu-item key="/user-management">用户管理</a-menu-item>
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
      </a-layout-header>
      <a-layout-content class="m-4 p-4 bg-white rounded">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
