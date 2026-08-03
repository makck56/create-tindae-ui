<script setup lang="ts">
import { useCaptcha } from '../composables/useCaptcha';
import { useLoginForm } from '../composables/useLoginForm';
import { COPY } from '@/shared/constants/copy';

defineOptions({ name: 'LoginView' });

const props = defineProps<{
  redirect: string;
}>();

const { captchaImage, refresh: refreshCaptcha } = useCaptcha();
const { formState, loading, handleLogin } = useLoginForm(props.redirect, refreshCaptcha);
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="p-8 bg-white rounded-lg shadow-lg">
      <h2 class="mb-8 text-2xl font-bold text-center">{{ COPY.LOGIN.TITLE }}</h2>
      <a-form :model="formState" @finish="handleLogin">
        <a-form-item
          name="username"
          :rules="[{ required: true, message: COPY.LOGIN.USERNAME_REQUIRED }]"
        >
          <a-input
            v-model:value="formState.username"
            :placeholder="COPY.LOGIN.USERNAME"
            size="large"
          />
        </a-form-item>
        <a-form-item
          name="password"
          :rules="[{ required: true, message: COPY.LOGIN.PASSWORD_REQUIRED }]"
        >
          <a-input-password
            v-model:value="formState.password"
            :placeholder="COPY.LOGIN.PASSWORD"
            size="large"
          />
        </a-form-item>
        <a-form-item
          name="captchaCode"
          :rules="[{ required: true, message: COPY.LOGIN.CAPTCHA_REQUIRED }]"
        >
          <div class="flex gap-2">
            <a-input
              v-model:value="formState.captchaCode"
              :placeholder="COPY.LOGIN.CAPTCHA"
              size="large"
              class="flex-1"
            />
            <img
              :src="captchaImage"
              :alt="COPY.LOGIN.CAPTCHA"
              class="h-10 border border-gray-200 rounded cursor-pointer"
              :title="COPY.LOGIN.CAPTCHA_REFRESH"
              @click="refreshCaptcha"
            />
          </div>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" size="large" block :loading="loading">
            {{ COPY.LOGIN.TITLE }}
          </a-button>
        </a-form-item>
      </a-form>
      <a-alert
        class="mt-2 text-left"
        type="info"
        show-icon
        message="演示账号（密码任意，需填验证码）"
        description="admin（全权限）· manager（无删除、无角色管理）· viewer（无任何权限，登录即 403）"
      />
    </div>
  </div>
</template>
