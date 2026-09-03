# SCSS → Tailwind CSS 样式迁移指南

## 核心策略

**三层优先级**：Tailwind 工具类 > CSS 变量（项目主题系统）> `<style scoped>`

不要试图 1:1 翻译 SCSS，而是用目标项目的样式体系重新表达相同的视觉效果。

---

## 1. SCSS 变量 → CSS 变量 / Tailwind 类

### 颜色变量

```scss
// ❌ SCSS 变量
$primary-color: #1890ff;
$success-color: #52c41a;
$text-color: rgba(0, 0, 0, 0.85);
$border-color: #d9d9d9;

.element {
  color: $primary-color;
  background: lighten($primary-color, 40%);
}
```

```html
<!-- ✅ Tailwind 工具类（使用项目主题变量对应的 Tailwind 类） -->
<div class="text-primary bg-primary-light border border-light">

<!-- 或直接使用 CSS 变量（Tailwind 无法覆盖时） -->
<div style="background: var(--color-primary-light)">
```

### 尺寸/间距变量

```scss
// ❌ SCSS
$spacing-md: 16px;
$spacing-lg: 24px;
$border-radius: 4px;

.box {
  padding: $spacing-md;
  margin-bottom: $spacing-lg;
  border-radius: $border-radius;
}
```

```html
<!-- ✅ Tailwind -->
<div class="p-4 mb-6 rounded">
```

### 字体变量

```scss
// ❌ SCSS
$font-size-lg: 16px;
$font-weight-bold: 600;
$line-height-base: 1.5;

.title {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  line-height: $line-height-base;
}
```

```html
<!-- ✅ Tailwind -->
<h2 class="text-base font-semibold leading-normal">
```

---

## 2. SCSS 嵌套 → 扁平化类名

SCSS 的嵌套语法在 Tailwind 中不需要——每个元素直接写类名即可。

```scss
// ❌ SCSS 嵌套
.page-container {
  padding: 24px;
  background: #fff;

  .page-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;

    .title {
      font-size: 20px;
      font-weight: 600;
    }

    .actions {
      display: flex;
      gap: 8px;
    }
  }

  .page-content {
    .empty-state {
      text-align: center;
      padding: 48px 0;
      color: #999;
    }
  }
}
```

```html
<!-- ✅ Tailwind 扁平化 -->
<div class="p-6 bg-white">
  <div class="flex justify-between mb-4">
    <h1 class="text-xl font-semibold">标题</h1>
    <div class="flex gap-2">
      <!-- actions -->
    </div>
  </div>
  <div>
    <div class="text-center py-12 text-secondary">
      <!-- empty state -->
    </div>
  </div>
</div>
```

**注意**：如果同一个结构在多个地方重复，考虑提取为一个子组件，而不是用 SCSS 嵌套。

---

## 3. SCSS Mixin → Tailwind 工具类 / 组合

### 布局 Mixin

```scss
// ❌ SCSS
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

```html
<!-- ✅ Tailwind -->
<div class="flex items-center justify-center">
<div class="flex items-center justify-between">
```

### 文字截断 Mixin

```scss
// ❌ SCSS
@mixin text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

```html
<!-- ✅ Tailwind -->
<span class="truncate">
```

### 响应式 Mixin

```scss
// ❌ SCSS
@mixin mobile {
  @media (max-width: 768px) {
    @content;
  }
}

.container {
  padding: 24px;
  @include mobile {
    padding: 12px;
  }
}
```

```html
<!-- ✅ Tailwind 响应式前缀 -->
<div class="p-6 md:p-3">
```

---

## 4. SCSS 函数 → CSS 函数 / JS 计算

```scss
// ❌ SCSS 颜色函数
background: darken($primary-color, 10%);
color: lighten($text-color, 20%);
border: rgba($primary-color, 0.3);
```

```html
<!-- ✅ CSS 原生函数 + CSS 变量 -->
<!-- Tailwind opacity 变体 -->
<div class="border-primary/30 bg-primary/90">

<!-- 或 inline style -->
<div :style="{ color: `color-mix(in srgb, var(--color-primary) 80%, black)` }">
```

⚠️ 复杂的颜色计算逻辑（如 `mix()`、多阶 `lighten`）应放到 JS 中处理，避免在模板中写复杂表达式。

---

## 5. SCSS 条件逻辑 → Vue 动态类 / 动态样式

```scss
// ❌ SCSS 中的条件变体
.button {
  &--primary { background: $primary-color; }
  &--danger { background: $danger-color; }
  &--large { padding: 12px 24px; font-size: 16px; }
  &--small { padding: 4px 8px; font-size: 12px; }
}
```

```html
<!-- ✅ Vue 动态类绑定 -->
<a-button
  :type="variant"           <!-- primary / danger -->
  :size="size"              <!-- large / small -->
>
<!-- AntDV 组件自带 variant 体系，不需要手写条件类 -->
```

对于非组件场景：

```html
<!-- ✅ 动态类 -->
<div :class="[
  'base-class',
  isActive ? 'bg-primary text-white' : 'bg-gray-100',
  size === 'large' ? 'px-6 py-3' : 'px-3 py-1'
]">
```

---

## 6. ::v-deep / /deep/ → :deep()

```scss
// ❌ Vue2 SCSS
.parent ::v-deep .ant-btn {
  border-radius: 8px;
}

.parent /deep/ .el-table {
  font-size: 14px;
}
```

```html
<!-- ✅ Vue3 scoped -->
<style scoped>
.parent :deep(.ant-btn) {
  border-radius: 8px;
}

.parent :deep(.vxe-grid) {
  font-size: 14px;
}
</style>
```

⚠️ **优先使用组件的 props 和主题系统**而非深度选择器。`:deep()` 是最后手段。

---

## 7. 全局样式 → CSS 变量 / 组件 props

```scss
// ❌ Vue2：在组件 SCSS 中覆写全局样式
// styles/global.scss
.el-table {
  --el-table-border-color: #eee;
}

.el-button--primary {
  background: #1890ff !important;
}
```

```html
<!-- ✅ Vue3：通过主题系统或 ConfigProvider 解决 -->
<!-- 项目已通过 ConfigProvider + CSS 变量系统统一管理组件样式 -->
<!-- 组件级别的覆写应通过 AntDV 的 ConfigProvider 或直接使用 a-* props -->
```

---

## 8. 常用 Tailwind 对照表

### 布局

| SCSS | Tailwind |
|------|----------|
| `display: flex` | `flex` |
| `display: grid` | `grid` |
| `flex-direction: column` | `flex-col` |
| `justify-content: space-between` | `justify-between` |
| `justify-content: center` | `justify-center` |
| `align-items: center` | `items-center` |
| `gap: 8px` | `gap-2` |
| `gap: 16px` | `gap-4` |
| `gap: 24px` | `gap-6` |

### 间距

| SCSS | Tailwind |
|------|----------|
| `padding: 4px` | `p-1` |
| `padding: 8px` | `p-2` |
| `padding: 12px` | `p-3` |
| `padding: 16px` | `p-4` |
| `padding: 20px` | `p-5` |
| `padding: 24px` | `p-6` |
| `padding: 32px` | `p-8` |
| `margin` | 同理 `m-*` |
| 单方向 | `pt-*`, `pr-*`, `pb-*`, `pl-*` 等 |

### 文字

| SCSS | Tailwind |
|------|----------|
| `font-size: 12px` | `text-xs` |
| `font-size: 14px` | `text-sm` |
| `font-size: 16px` | `text-base` |
| `font-size: 18px` | `text-lg` |
| `font-size: 20px` | `text-xl` |
| `font-size: 24px` | `text-2xl` |
| `font-weight: 500` | `font-medium` |
| `font-weight: 600` | `font-semibold` |
| `font-weight: 700` | `font-bold` |
| `text-align: center` | `text-center` |
| `text-align: right` | `text-right` |
| `color: #999` | `text-secondary`（项目主题变量） |
| `white-space: nowrap` | `whitespace-nowrap` |
| `overflow: hidden; text-overflow: ellipsis` | `truncate` |

### 边框 / 圆角

| SCSS | Tailwind |
|------|----------|
| `border: 1px solid #d9d9d9` | `border border-light` |
| `border-radius: 4px` | `rounded` |
| `border-radius: 6px` | `rounded-md` |
| `border-radius: 8px` | `rounded-lg` |
| `border-radius: 50%` | `rounded-full` |
| `box-shadow: 0 2px 8px rgba(0,0,0,0.15)` | `shadow-md` |

### 宽度 / 高度

| SCSS | Tailwind |
|------|----------|
| `width: 100%` | `w-full` |
| `width: 50%` | `w-1/2` |
| `height: 100%` | `h-full` |
| `min-height: 100vh` | `min-h-screen` |
| `max-width: 1200px` | `max-w-6xl`（或自定义值） |

---

## 9. 主题颜色映射（项目 CSS 变量 → Tailwind 类）

本项目的 `theme.tailwind.css` 已将 CSS 变量映射为 Tailwind 类：

| 项目语义 Token | CSS 变量 | Tailwind 类示例 |
|---------------|----------|-----------------|
| 主色 | `--color-primary` | `text-primary`, `bg-primary` |
| 主色-浅 | `--color-primary-light` | `bg-primary-light` |
| 标题文字 | `--text-title` | `text-title` |
| 正文文字 | `--text-body` | `text-body` |
| 次要文字 | `--text-secondary` | `text-secondary` |
| 页面背景 | `--bg-page` | `bg-page` |
| 容器背景 | `--bg-container` | `bg-container` |
| 卡片背景 | `--bg-elevated` | `bg-elevated` |
| 边框基础色 | `--border-base` | `border-base` |
| 浅色边框 | `--border-light` | `border-light` |

**使用这些语义类而非具体颜色值**，这样可以自动适配暗色模式。

---

## 10. 响应式设计

```scss
// ❌ SCSS 媒体查询
.container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 768px) {
    grid-template-columns: repeat(1, 1fr);
  }
}
```

```html
<!-- ✅ Tailwind 响应式前缀 -->
<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
```

**Tailwind 断点**：
- `sm:` ≥640px
- `md:` ≥768px
- `lg:` ≥1024px
- `xl:` ≥1280px
- `2xl:` ≥1536px

---

## 11. 反模式：不要做的事

1. **不要用 `@apply` 大量组合类** — Tailwind v4 推荐直接在 HTML 中使用工具类
2. **不要动态拼接类名** — `class="text-${color}-500"` 不会生效（Tailwind 静态分析），用完整类名或 `style`
3. **不要混用 SCSS 和 Tailwind** — 迁移完成后删除所有 SCSS 语法
4. **不要在 scoped 样式中复制 Tailwind 的功能** — 选择 Tailwind 类或 scoped CSS，不要同时存在
5. **不要硬编码颜色值** — 项目的 AGENTS.md 明确禁止，必须使用 CSS 变量或 Tailwind 语义类
