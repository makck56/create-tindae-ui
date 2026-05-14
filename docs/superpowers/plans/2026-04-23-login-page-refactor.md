# 登录页重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重构登录页以遵循 Page/View 分层架构，新增 Canvas 验证码和 RSA 密码加密功能，对齐 auth 模块命名规范。

**Architecture:** 拆分为薄路由壳 (Login.page.vue) + 业务视图 (Login.view.vue) + 三个独立 composable（useCaptcha、useLoginForm、useRsaEncrypt）。验证码校验在 mock API 层完成，模拟后端行为。

**Tech Stack:** Vue 3 Composition API, TypeScript, Ant Design Vue, Pinia, jsencrypt, Canvas API, Vitest

---

## File Structure

| Action | Path | Responsibility |
|:---|:---|:---|
| Install | `jsencrypt` (dependency) | RSA 加密库 |
| Modify | `src/modules/auth/models/Auth.ts` | LoginParams 加 captchaCode |
| Modify | `src/modules/auth/api/auth.api.ts` | Mock 验证码校验 + RSA 解密 |
| Modify | `src/modules/auth/index.ts` | 导出 setCaptchaAnswer |
| Create | `src/pages/login/features/login/composables/useCaptcha.ts` | 验证码生成/刷新/Canvas 绘制 |
| Create | `src/pages/login/features/login/composables/useLoginForm.ts` | 表单状态/提交逻辑 |
| Create | `src/pages/login/features/login/composables/useRsaEncrypt.ts` | RSA 加密工具 |
| Create | `src/pages/login/features/login/views/Login.view.vue` | 居中卡片业务视图 |
| Rewrite | `src/pages/login/pages/Login.page.vue` | 薄路由壳 |
| Modify | `src/modules/auth/stores/auth.ts` | 适配 LoginParams 变更 |

---

### Task 1: 安装 jsencrypt 依赖

**Files:**
- Modify: `template/package.json`

- [ ] **Step 1: 安装 jsencrypt**

```bash
cd template && pnpm add jsencrypt
```

- [ ] **Step 2: 验证安装成功**

```bash
cd template && pnpm ls jsencrypt
```

Expected: `jsencrypt x.x.x`

- [ ] **Step 3: Commit**

```bash
git add template/package.json template/pnpm-lock.yaml
git commit -m "chore: add jsencrypt dependency for RSA encryption"
```

---

### Task 2: 扩展 LoginParams 类型

**Files:**
- Modify: `src/modules/auth/models/Auth.ts`

- [ ] **Step 1: 在 LoginParams 中添加 captchaCode**

```typescript
// src/modules/auth/models/Auth.ts
export interface LoginParams {
  username: string;
  password: string;     // RSA 加密后的密文
  captchaCode: string;  // 新增：验证码
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/auth/models/Auth.ts
git commit -m "feat(auth): add captchaCode to LoginParams"
```

---

### Task 3: 实现 useRsaEncrypt composable

**Files:**
- Create: `src/pages/login/features/login/composables/useRsaEncrypt.ts`

- [ ] **Step 1: 编写 useRsaEncrypt**

```typescript
// src/pages/login/features/login/composables/useRsaEncrypt.ts
import JSEncrypt from 'jsencrypt';

// Mock 阶段使用硬编码公钥，生产环境应从后端获取
const RSA_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Z3VS5JJcds3xfn/ygWJ
RZc9F5Lm+Q7dBfGZ8L8d9K3n9J1W6m2m5d5O4eWd1sZbRnH5S3k9uNmYc1k7hP
uW4F5h3N2F6bK+0vXn9R2dS8c5P3yE0T1rJ6hY7vA8zG9fW4K5c3nB2xM7eL6
Q1dS8hP5yE3rJ9vN6mK4cW2xF7bA8zG0eR4dS1hP6yE3rJ9vN6mK4cW2xF7bA
wIDAQAB
-----END PUBLIC KEY-----`;

export function useRsaEncrypt() {
  function encryptPassword(password: string): string {
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(RSA_PUBLIC_KEY);
    const encrypted = encrypt.encrypt(password);
    if (!encrypted) {
      throw new Error('密码加密失败');
    }
    return encrypted;
  }

  return { encryptPassword };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/login/features/login/composables/useRsaEncrypt.ts
git commit -m "feat(login): add useRsaEncrypt composable"
```

---

### Task 4: 实现 useCaptcha composable

**Files:**
- Create: `src/pages/login/features/login/composables/useCaptcha.ts`

- [ ] **Step 1: 编写 useCaptcha**

```typescript
// src/pages/login/features/login/composables/useCaptcha.ts
import { ref, onMounted } from 'vue';
import { setCaptchaAnswer } from '@/modules/auth/api/auth.api';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
const CAPTCHA_LENGTH = 4;
const CANVAS_WIDTH = 120;
const CANVAS_HEIGHT = 40;

function generateCode(): string {
  let code = '';
  for (let i = 0; i < CAPTCHA_LENGTH; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

function drawCaptcha(code: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  // 背景
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 噪点
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
    ctx.beginPath();
    ctx.arc(Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT, 1, 0, 2 * Math.PI);
    ctx.fill();
  }

  // 干扰线
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.4)`;
    ctx.beginPath();
    ctx.moveTo(Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT);
    ctx.lineTo(Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT);
    ctx.stroke();
  }

  // 字符
  const charWidth = CANVAS_WIDTH / (CAPTCHA_LENGTH + 1);
  for (let i = 0; i < code.length; i++) {
    ctx.save();
    ctx.font = `bold ${18 + Math.random() * 6}px Arial`;
    ctx.fillStyle = `rgb(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)})`;
    const x = charWidth * (i + 0.5);
    const y = CANVAS_HEIGHT / 2 + (Math.random() * 10 - 5);
    ctx.translate(x, y);
    ctx.rotate((Math.random() - 0.5) * 0.4);
    ctx.fillText(code[i], 0, 0);
    ctx.restore();
  }

  return canvas.toDataURL('image/png');
}

export function useCaptcha() {
  const captchaImage = ref('');

  function refresh() {
    const code = generateCode();
    setCaptchaAnswer(code);
    captchaImage.value = drawCaptcha(code);
  }

  onMounted(refresh);

  return { captchaImage, refresh };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/login/features/login/composables/useCaptcha.ts
git commit -m "feat(login): add useCaptcha composable with canvas rendering"
```

---

### Task 5: 改造 auth.api.ts — 添加 mock 验证码校验

**Files:**
- Modify: `src/modules/auth/api/auth.api.ts`

- [ ] **Step 1: 添加验证码校验和 setCaptchaAnswer**

将整个文件替换为：

```typescript
// src/modules/auth/api/auth.api.ts
import axios from 'axios';
import type { AuthData } from '../models/Auth';
import type { LoginParams } from '../models/Auth';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// --- Mock captcha ---
let currentCaptchaAnswer = '';

export function setCaptchaAnswer(answer: string) {
  currentCaptchaAnswer = answer;
}

// --- API ---
export const getUserInfo = () => {
  return request.get<{ code: number; data: AuthData }>('/user/info');
};

export const login = (data: LoginParams) => {
  // Mock: 验证码校验（模拟后端行为）
  if (!data.captchaCode || data.captchaCode.toLowerCase() !== currentCaptchaAnswer.toLowerCase()) {
    return Promise.resolve({ data: { code: 40001, message: '验证码错误' } });
  }
  return request.post<{ code: number }>('/auth/login', data);
};

export const logout = () => {
  return request.post<{ code: number }>('/auth/logout');
};
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/auth/api/auth.api.ts
git commit -m "feat(auth): add mock captcha validation to login API"
```

---

### Task 6: 更新 modules/auth/index.ts 导出

**Files:**
- Modify: `src/modules/auth/index.ts`

- [ ] **Step 1: 添加 setCaptchaAnswer 导出**

```typescript
// src/modules/auth/index.ts
export { useAuthStore } from './stores/auth';
export { setCaptchaAnswer } from './api/auth.api';
export type { UserInfo, MenuPermission, AuthData, LoginParams } from './models/Auth';
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/auth/index.ts
git commit -m "feat(auth): export setCaptchaAnswer from module public API"
```

---

### Task 7: 实现 useLoginForm composable

**Files:**
- Create: `src/pages/login/features/login/composables/useLoginForm.ts`

- [ ] **Step 1: 编写 useLoginForm**

```typescript
// src/pages/login/features/login/composables/useLoginForm.ts
import { reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { useAuthStore } from '@/modules/auth/stores/auth';
import { useRsaEncrypt } from './useRsaEncrypt';

interface LoginFormState {
  username: string;
  password: string;
  captchaCode: string;
}

export function useLoginForm(redirect: string, onCaptchaRefresh: () => void) {
  const router = useRouter();
  const authStore = useAuthStore();
  const { encryptPassword } = useRsaEncrypt();

  const formState = reactive<LoginFormState>({
    username: '',
    password: '',
    captchaCode: '',
  });

  const loading = computed(() => authStore.loading);

  async function handleLogin() {
    try {
      const encryptedPassword = encryptPassword(formState.password);
      await authStore.login({
        username: formState.username,
        password: encryptedPassword,
        captchaCode: formState.captchaCode,
      });
      router.push(redirect || '/');
    } catch {
      message.error(authStore.error || '登录失败');
      formState.captchaCode = '';
      onCaptchaRefresh();
    }
  }

  return { formState, loading, handleLogin };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/login/features/login/composables/useLoginForm.ts
git commit -m "feat(login): add useLoginForm composable"
```

---

### Task 8: 实现 Login.view.vue 业务视图

**Files:**
- Create: `src/pages/login/features/login/views/Login.view.vue`

- [ ] **Step 1: 编写 Login.view.vue**

```vue
<!-- src/pages/login/features/login/views/Login.view.vue -->
<script setup lang="ts">
import { useCaptcha } from '../composables/useCaptcha';
import { useLoginForm } from '../composables/useLoginForm';

defineOptions({ name: 'LoginView' });

const props = defineProps<{
  redirect: string;
}>();

const { captchaImage, refresh: refreshCaptcha } = useCaptcha();
const { formState, loading, handleLogin } = useLoginForm(props.redirect, refreshCaptcha);
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full max-w-sm bg-white rounded-lg shadow-lg p-8">
      <h2 class="text-2xl font-bold text-center mb-8">登录</h2>
      <a-form :model="formState" @finish="handleLogin">
        <a-form-item name="username" :rules="[{ required: true, message: '请输入用户名' }]">
          <a-input v-model:value="formState.username" placeholder="用户名" size="large" />
        </a-form-item>
        <a-form-item name="password" :rules="[{ required: true, message: '请输入密码' }]">
          <a-input-password v-model:value="formState.password" placeholder="密码" size="large" />
        </a-form-item>
        <a-form-item name="captchaCode" :rules="[{ required: true, message: '请输入验证码' }]">
          <div class="flex gap-2">
            <a-input v-model:value="formState.captchaCode" placeholder="验证码" size="large" class="flex-1" />
            <img
              :src="captchaImage"
              alt="验证码"
              class="h-10 rounded cursor-pointer border border-gray-200"
              title="点击刷新验证码"
              @click="refreshCaptcha"
            />
          </div>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" size="large" block :loading="loading">
            登录
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/login/features/login/views/Login.view.vue
git commit -m "feat(login): add Login business view with centered card layout"
```

---

### Task 9: 重写 Login.page.vue 薄路由壳

**Files:**
- Rewrite: `src/pages/login/pages/Login.page.vue`

- [ ] **Step 1: 重写为薄路由壳**

```vue
<!-- src/pages/login/pages/Login.page.vue -->
<script setup lang="ts">
import { useRoute } from 'vue-router';
import LoginView from '../features/login/views/Login.view.vue';

defineOptions({ name: 'Login' });

const route = useRoute();
const redirect = (route.query.redirect as string) || '/';
</script>

<template>
  <LoginView :redirect="redirect" />
</template>
```

- [ ] **Step 2: 验证构建通过**

```bash
cd template && pnpm build
```

Expected: `✓ built in X.XXs`

- [ ] **Step 3: Commit**

```bash
git add src/pages/login/pages/Login.page.vue
git commit -m "refactor(login): rewrite Login.page.vue as thin route shell"
```

---

### Task 10: 端到端验证

**Files:**
- No new files

- [ ] **Step 1: 启动开发服务器**

```bash
cd template && pnpm dev
```

- [ ] **Step 2: 浏览器验证清单**

打开 http://localhost:5173/login，逐项确认：

1. 页面显示居中白色卡片，灰色背景
2. 验证码图片显示（带干扰线和噪点）
3. 点击验证码图片 → 图片刷新为新验证码
4. 不填任何内容点登录 → 表单校验提示必填
5. 填写用户名密码 + 错误验证码 → 提示"验证码错误"+ 验证码自动刷新
6. 填写用户名密码 + 正确验证码 → mock API 请求发出（会因无后端失败，但验证码校验通过）

- [ ] **Step 3: 确认构建无错误**

```bash
cd template && pnpm build
```

Expected: `✓ built in X.XXs`，无 TS 错误

---

## Self-Review Checklist

- [x] **Spec coverage:** 需求逐项对照 — 居中卡片 (Task 8)、Canvas 验证码 (Task 4)、点击刷新 (Task 8)、mock 校验 (Task 5)、RSA 加密 (Task 3)、命名对齐 (无变更，已正确)
- [x] **Placeholder scan:** 无 TBD/TODO，每步有完整代码
- [x] **Type consistency:** `LoginParams` 在 Task 2 定义 `captchaCode`，Task 4 的 `setCaptchaAnswer` 在 Task 5 中定义并导出，Task 6 导出，Task 7 使用 — 链路完整
