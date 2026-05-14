# 主题 Design Token 参考

> 来源：`tailwind.config.js` + `src/style.css`

---

## 颜色

### 主色（Primary）

| Token | CSS 变量 | 色值 | 用途 |
|-------|----------|------|------|
| `primary` | `--color-primary` | `#409EFF` | 默认主色 |
| `primary-hover` | `--color-primary-hover` | `#66B1FF` | 悬停态 |
| `primary-active` | `--color-primary-active` | `#3A8EE6` | 按下态 |
| `primary-disabled` | `--color-primary-disabled` | `#A0CFFF` | 禁用态 |

### 成功（Success）

| Token | CSS 变量 | 色值 | 用途 |
|-------|----------|------|------|
| `success` | `--color-success` | `#67C23A` | 默认 |
| `success-hover` | `--color-success-hover` | `#85CE61` | 悬停态 |
| `success-active` | `--color-success-active` | `#5DAF34` | 按下态 |
| `success-disabled` | `--color-success-disabled` | `#B3E19D` | 禁用态 |

### 危险（Danger）

| Token | CSS 变量 | 色值 | 用途 |
|-------|----------|------|------|
| `danger` | `--color-danger` | `#F56C6C` | 默认 |
| `danger-hover` | `--color-danger-hover` | `#F78989` | 悬停态 |
| `danger-active` | `--color-danger-active` | `#DD6161` | 按下态 |
| `danger-disabled` | `--color-danger-disabled` | `#FAB6B6` | 禁用态 |

### 警告（Warning）

| Token | CSS 变量 | 色值 | 用途 |
|-------|----------|------|------|
| `warning` | `--color-warning` | `#E6A23C` | 默认 |
| `warning-hover` | `--color-warning-hover` | `#EBB563` | 悬停态 |
| `warning-active` | `--color-warning-active` | `#CF9236` | 按下态 |
| `warning-disabled` | `--color-warning-disabled` | `#F3D19E` | 禁用态 |

### 信息（Info）

| Token | CSS 变量 | 色值 | 用途 |
|-------|----------|------|------|
| `info` | `--color-info` | `#909399` | 默认 |
| `info-hover` | `--color-info-hover` | `#A6A9AD` | 悬停态 |
| `info-active` | `--color-info-active` | `#82848A` | 按下态 |
| `info-disabled` | `--color-info-disabled` | `#C0C4CC` | 禁用态 |

### 颜色使用方式

```html
<!-- 背景色 -->
<div class="bg-primary text-white" />
<div class="bg-success-hover" />

<!-- 文本色 -->
<span class="text-danger" />
<span class="text-warning-disabled" />

<!-- 边框色 -->
<div class="border border-success" />
```

---

## 文本颜色

| Tailwind 类 | CSS 变量 | 色值 | 用途 |
|-------------|----------|------|------|
| `text-title` | `--text-title` | `rgba(0,0,0,0.85)` | 标题文字 |
| `text-body` | `--text-body` | `rgba(0,0,0,0.65)` | 正文（全局默认） |
| `text-secondary` | `--text-secondary` | `rgba(0,0,0,0.45)` | 次要/辅助文字 |
| `text-disabled` | `--text-disabled` | `rgba(0,0,0,0.25)` | 禁用态文字 |

---

## 背景色

| Tailwind 类 | CSS 变量 | 色值 | 用途 |
|-------------|----------|------|------|
| `bg-white` | `--bg-white` | `#ffffff` | 卡片/面板白底 |
| `bg-page` | `--bg-page` | `#f5f7fa` | 页面底色 |

---

## 边框颜色

| Tailwind 类 | CSS 变量 | 色值 | 用途 |
|-------------|----------|------|------|
| `border-base` | `--border-base` | `rgba(0,0,0,0.15)` | 默认边框（分隔线、输入框） |
| `border-light` | `--border-light` | `rgba(0,0,0,0.06)` | 轻边框（表格内线） |
| `border-lighter` | `--border-lighter` | `rgba(0,0,0,0.04)` | 更轻边框（区块分隔） |
| `border-extra-light` | `--border-extra-light` | `rgba(0,0,0,0.02)` | 极轻边框（hover 提示） |

---

## 字体

### 字体栈

```
system-ui, 'Segoe UI', Roboto, sans-serif
```

### 字号（已覆盖 Tailwind 默认值）

| Tailwind 类 | 字号 | 行高 | 适用场景 |
|-------------|------|------|----------|
| `text-xs` | 12px | 20px | 辅助标注、标签 |
| `text-sm` | 14px | 22px | 表格文字、表单标签 |
| `text-tiny` | 16px | 24px | 正文（小） |
| `text-base` | 18px | 28px | 正文（默认） |
| `text-lg` | 20px | 28px | 小标题 |
| `text-xl` | 24px | 32px | 区块标题 |
| `text-2xl` | 28px | 36px | 页面标题 |
| `text-3xl` | 32px | 40px | 大标题 |
| `text-4xl` | 36px | 44px | — |
| `text-5xl` | 40px | 48px | — |

---

## 间距

基准单位 **4px**，间距值 = Tailwind 数字 × 4px（已覆盖 Tailwind 默认值）。

| Tailwind 类 | 实际值 | Tailwind 类 | 实际值 |
|-------------|--------|-------------|--------|
| `p-1` / `m-1` | 4px | `p-10` / `m-10` | 40px |
| `p-2` / `m-2` | 8px | `p-12` / `m-12` | 48px |
| `p-3` / `m-3` | 12px | `p-14` / `m-14` | 56px |
| `p-4` / `m-4` | 16px | `p-16` / `m-16` | 64px |
| `p-5` / `m-5` | 20px | `p-20` / `m-20` | 80px |
| `p-6` / `m-6` | 24px | `p-24` / `m-24` | 96px |
| `p-7` / `m-7` | 28px | `p-32` / `m-32` | 128px |
| `p-8` / `m-8` | 32px | `p-48` / `m-48` | 192px |
| `p-9` / `m-9` | 36px | `p-96` / `m-96` | 384px |

完整刻度：1–12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96

支持 `p` / `m` 全部变体：`p-{n}` `px-{n}` `py-{n}` `pt-{n}` `pr-{n}` `pb-{n}` `pl-{n}`（margin 同理）。

---

## 圆角

| Tailwind 类 | 值 | 适用场景 |
|-------------|----|----------|
| `rounded-sm` | 2px | 小元素（标签、Badge） |
| `rounded` | 4px | 默认（按钮、输入框） |
| `rounded-md` | 6px | 卡片、下拉框 |
| `rounded-lg` | 8px | 弹框、大卡片 |
| `rounded-xl` | 12px | 特大容器 |
