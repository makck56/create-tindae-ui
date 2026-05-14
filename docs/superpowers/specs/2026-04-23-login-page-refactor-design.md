# 登录页重构设计

**日期**: 2026-04-23

## 概述

重构登录页以遵循项目架构约定（Page/View 分层、composable 提取），并新增基于 Canvas 的验证码功能。同时将 auth 模块对齐命名规范。

## 需求

- 居中卡片布局（灰色背景、白色卡片带阴影）
- Canvas 生成验证码，含干扰线和噪点
- 点击验证码图片可刷新
- 验证码由服务端校验（mock API 层），前端不校验
- 密码使用 RSA 加密后传输
- 重构 auth 模块，对齐 `.api.ts` 命名约定

## 文件结构

```
src/
├── modules/auth/
│   ├── index.ts                          # 模块公共 API（保留）
│   ├── api/auth.api.ts                   # 命名已正确
│   ├── models/Auth.ts                    # 扩展 LoginParams，新增 captchaCode
│   └── stores/auth.ts                    # 无变更
│
├── pages/login/
│   ├── login.routes.ts                   # 保持不变
│   └── pages/
│       └── Login.page.vue                # 薄路由壳
│
└── pages/login/features/login/           # 新特性目录
    ├── views/
    │   └── Login.view.vue                # 业务视图
    └── composables/
        ├── useLoginForm.ts               # 表单状态 + 提交逻辑
        ├── useCaptcha.ts                 # 验证码生成 + 展示
        └── useRsaEncrypt.ts              # RSA 加密工具
```

## 组件职责

### Login.page.vue（路由壳）

- 使用 `useRoute()` 提取 `redirect` 查询参数
- 渲染 `<LoginView :redirect="redirect" />`
- 不包含其他逻辑

### Login.view.vue（业务视图）

- Props: `{ redirect: string }`
- 调用 `useCaptcha()` 获取验证码状态
- 调用 `useLoginForm()` 获取表单状态和提交逻辑
- 组合 UI：表单输入 + `<img>` 验证码 + 提交按钮
- 不直接调用路由或 API

## Composable 设计

### useCaptcha

```typescript
interface UseCaptchaReturn {
  captchaImage: Ref<string>;   // base64 data URL，用于 <img :src>
  refresh: () => void;          // 生成新验证码
}
```

内部实现：
- `generateCode()`：随机 4 位字母数字字符串
- `drawCaptcha()`：Canvas API — 彩色字符、干扰线、噪点、随机旋转
- `toDataURL()` → base64 字符串赋值给 `captchaImage` ref
- 通过 `onMounted` 自动调用 `refresh()`
- 将 `captchaAnswer` 存储在模块级变量中，供 mock API 访问

### useLoginForm

```typescript
interface UseLoginFormReturn {
  formState: Reactive<{ username: string; password: string; captchaCode: string }>;
  loading: ComputedRef<boolean>;   // 委托自 authStore.loading
  handleLogin: () => Promise<void>;
}
```

`handleLogin` 内部逻辑：
1. RSA 加密密码：`encryptPassword(formState.password)`
2. 调用 `authStore.login({ username, encryptedPassword, captchaCode })`
3. 成功：`router.push(redirect || '/')`
4. 失败：`message.error(authStore.error)` + 调用 `useCaptcha.refresh()`

此 composable 中不做验证码校验 —— 校验由 mock API 负责。

### RSA 加密

使用 `jsencrypt` 库对密码进行 RSA 加密：

```typescript
import JSEncrypt from 'jsencrypt'

function encryptPassword(password: string): string {
  const encrypt = new JSEncrypt()
  encrypt.setPublicKey(RSA_PUBLIC_KEY)
  const encrypted = encrypt.encrypt(password)
  if (!encrypted) throw new Error('密码加密失败')
  return encrypted
}
```

- 公钥硬编码在前端（mock 阶段）
- `LoginParams.password` 字段存储加密后的密文

## Auth 模块变更

### models/Auth.ts

```typescript
export interface LoginParams {
  username: string;
  password: string;
  captchaCode: string;   // 新增
}
```

### api/auth.api.ts

在 login 函数中添加 mock 验证码校验和 RSA 解密：
- 模块级变量 `let currentCaptchaAnswer = ''`
- `setCaptchaAnswer(answer: string)` 由 useCaptcha 生成时调用
- `login()` 先用 RSA 私钥解密 password
- 校验 `captchaCode` 与 `currentCaptchaAnswer`（不区分大小写）
- 不匹配 → 返回 `{ code: 40001, message: '验证码错误' }`
- 匹配 → 执行正常 mock 登录流程

### stores/auth.ts

无变更。store 已通过 `error` ref 处理错误展示。

## 数据流

```
用户点击登录
  → useLoginForm.handleLogin()
    → useRsaEncrypt.encrypt(password)
    → authStore.login({ username, encryptedPassword, captchaCode })
      → auth.api.login(params)
        → mock：RSA 私钥解密 password
        → mock：校验 captchaCode 与答案
        → 不匹配：返回错误码
        → 匹配：返回成功码
      → store 处理结果
    → 成功：router.push(redirect)
    → 失败：message.error() + captcha.refresh()
```

## UI 布局

灰色背景上的居中卡片：

```
┌─────────────────────────────────────────┐
│           (灰色背景)                     │
│                                         │
│         ┌───────────────────┐           │
│         │       登录        │           │
│         │                   │           │
│         │  [  用户名输入  ]  │           │
│         │  [  密码输入    ]  │           │
│         │  [验证码] [A3xK]  │           │
│         │                   │           │
│         │  [    登录按钮  ]  │           │
│         └───────────────────┘           │
│                                         │
└─────────────────────────────────────────┘
```

验证码图片可点击，cursor-pointer 样式。

## 约束

- 验证码答案不暴露给视图层
- composables/ 中不使用 `index.ts` 桶文件
- Login.page.vue 必须保持薄壳（不含业务逻辑）
- Mock 验证码校验在 auth.api.ts 中进行，模拟后端行为
