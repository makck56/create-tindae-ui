<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { useAppStore } from '@/modules/app/stores/app';
import { useAuthStore } from '@/modules/auth/stores/auth';

defineOptions({ name: 'Login' });

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();
const authStore = useAuthStore();

const form = reactive({ username: '', password: '' });

async function handleLogin() {
  try {
    await authStore.login(form);
    const redirect = (route.query.redirect as string) || '/';
    router.push(redirect);
  } catch {
    message.error(authStore.error || '登录失败');
  }
}
</script>

<template>
  <div class="flex min-h-screen">
    <div class="hidden md:flex w-1/2 bg-blue-900 items-center justify-center">
      <div class="text-center text-white">
        <h1 class="text-4xl font-bold mb-4">{{ appStore.appName }}</h1>
        <p class="text-lg opacity-80">企业级管理系统</p>
      </div>
    </div>
    <div class="flex w-full md:w-1/2 items-center justify-center p-8">
      <a-form :model="form" class="w-full max-w-sm" @finish="handleLogin">
        <h2 class="text-2xl font-bold mb-8 text-center">登录</h2>
        <a-form-item name="username" :rules="[{ required: true, message: '请输入用户名' }]">
          <a-input v-model:value="form.username" placeholder="用户名" size="large" />
        </a-form-item>
        <a-form-item name="password" :rules="[{ required: true, message: '请输入密码' }]">
          <a-input-password v-model:value="form.password" placeholder="密码" size="large" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" size="large" block :loading="authStore.loading">
            登录
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>
