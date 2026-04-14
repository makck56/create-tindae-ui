# 登录功能设计规范

**版本**: 1.0
**日期**: 2026-04-14
**状态**: 待评审

---

## 1. 概述

在现有 auth 模块上扩展登录/登出能力。账密登录，后端通过 httpOnly Cookie 管理认证状态。登录页采用左右分栏布局。路由守卫改造：未登录跳登录页，登录后跳回原页面。登出清除状态并跳回登录页。

---

## 2. 文件结构

```
src/
├── modules/auth/
│   ├── api/
│   │   └── auth.api.ts          # 增加 login(), logout()
│   ├── models/
│   │   └── Auth.ts              # 增加 LoginParams, LoginResult
│   ├── stores/
│   │   └── auth.ts              # 增加 login(), logout(), isLoggedIn
│   └── index.ts
├── pages/login/
│   └── pages/
│       └── Login.page.vue       # 左右分栏登录页
└── router/
    └── index.ts                 # 改造：/login 路由 + 白名单 + 重定向逻辑
```

---

## 3. 类型扩展 — `modules/auth/models/Auth.ts`

在现有类型基础上新增：

```typescript
export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  // httpOnly Cookie 由后端 Set-Cookie 设置，前端不需要返回值
}
```

---

## 4. API 扩展 — `modules/auth/api/auth.api.ts`

在现有 `getUserInfo` 基础上新增：

```typescript
import type { AuthData, LoginParams, LoginResult } from '../models/Auth';

export const login = (data: LoginParams) => {
  return request.post<{ code: number; data: LoginResult }>('/auth/login', data);
};

export const logout = () => {
  return request.post<{ code: number }>('/auth/logout');
};
```

---

## 5. Store 扩展 — `modules/auth/stores/auth.ts`

在现有 store 基础上新增：

### 新增 state/computed

```typescript
const isLoggedIn = computed(() => user.value !== null);
```

### login action

```typescript
async function login(params: LoginParams) {
  loading.value = true;
  error.value = null;
  try {
    const { data: res } = await loginApi(params);
    if (res.code !== 0) {
      throw new Error(`登录失败: ${res.code}`);
    }
    initialized.value = false;
    await fetchUser();
  } catch (e: any) {
    error.value = e.message || '登录失败';
    throw e;
  } finally {
    loading.value = false;
  }
}
```

### logout action

```typescript
async function logout() {
  try {
    await logoutApi();
  } catch {
    // 忽略登出接口失败
  }
  user.value = null;
  permissionCodes.value = new Set();
  initialized.value = false;
  error.value = null;
}
```

### return 新增

```typescript
return { ..., isLoggedIn, login, logout };
```

---

## 6. 路由守卫改造 — `router/index.ts`

```typescript
const WHITE_LIST = ['/login', '/403'];

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/login/pages/Login.page.vue'),
  },
  {
    path: '/',
    component: DefaultLayout,
    children: [
      // ... 现有子路由不变
    ],
  },
];

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (WHITE_LIST.includes(to.path)) return true;

  if (!authStore.initialized) {
    await authStore.fetchUser();
  }

  // 未登录 → 跳登录页，记录原目标路径
  if (!authStore.user) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }

  // 没有 meta.code 的路由放行
  if (!to.meta.code) return true;

  // 权限不足 → 跳 403
  if (!authStore.hasPermission(to.meta.code)) {
    return '/403';
  }
});
```

关键变化：
- `/login` 加入白名单
- `/login` 路由为顶层路由，不在 DefaultLayout 内
- 未登录跳 `/login?redirect=xxx`，不再跳 403
- 已登录但权限不足才跳 403

---

## 7. 登录页 — `pages/login/pages/Login.page.vue`

左右分栏布局：
- 左侧：深色品牌展示区（隐藏 logo + 应用名 + 标语），移动端隐藏
- 右侧：登录表单（用户名 + 密码 + 登录按钮）

```vue
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
```

---

## 8. 数据流

```
用户访问任意页面
  │
  ▼
路由守卫
  │
  ├─ 白名单（/login, /403）→ 放行
  │
  ├─ 未初始化 → fetchUser()
  │                │
  │                ├─ 成功（有 user）→ 继续
  │                └─ 失败（无 user）→ 跳 /login?redirect=xxx
  │
  ├─ 已登录但无 meta.code → 放行
  │
  └─ 已登录但权限不足 → 跳 /403

用户在登录页提交
  │
  ▼
login(username, password)
  ├─ POST /api/auth/login（后端设置 httpOnly Cookie）
  ├─ 成功 → fetchUser() 获取权限
  └─ 跳转 redirect 参数指向的页面

用户点击登出
  │
  ▼
logout()
  ├─ POST /api/auth/logout
  ├─ 清空 user / permissionCodes / initialized
  └─ 跳转 /login
```
