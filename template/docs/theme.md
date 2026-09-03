# 主题系统

> 统一配置 **Tailwind / VXE Table / Ant Design Vue / ECharts** 四端配色，支持 **亮 / 暗双模** + **品牌主色预设换肤**。
> 运行时主题真源：`src/core/theme/`；Tailwind/字体/间距/圆角配置：`tailwind.config.js`。

---

## 一、架构：CSS 变量为单一真相源（SSOT）

一份 TS Token 经桥接层翻译成 `:root` CSS 变量，三个 CSS 系库（Tailwind / antd / VXE）+ 命令式 ECharts 各自消费，换肤只需重写一次 `:root` 变量：

```
ThemeTokens (TS, src/core/theme/tokens.ts)
   │  bridges/cssVariables.ts 翻译
   ▼
:root CSS 变量（单一真相源，运行时写入 documentElement）
   ├── Tailwind       ← tailwind.config.js 以 var() 引用（bg-primary / text-title ...）
   ├── Ant Design v4  ← bridges/antDesignVue.ts 生成 ConfigProvider theme，直接消费项目 Token
   ├── VXE Table      ← bridges/vxeTable.ts 覆盖表头 / 行 hover / 选中行 / 分页
   └── ECharts        ← bridges/echarts.ts 生成主题 option，实例化时注入
   ▲
   │  ThemeProvider 监听 theme store，模式/预设变化 → 重写 :root → 四端联动
```

**模块结构**（`src/core/theme/`，高内聚低耦合，每文件聚焦一件事）：

| 文件 | 职责 |
| :--- | :--- |
| `types.ts` | Token 类型契约（全 `readonly`，不可变） |
| `tokens.ts` | 亮 / 暗默认 Token，`getTokensByMode(mode)` |
| `presets.ts` | 5 套品牌主色预设（蓝 / 绿 / 紫 / 橙 / 红） |
| `bridges/cssVariables.ts` | `buildCssVarMap`（纯函数）+ `applyTokensToRoot`（写 DOM） |
| `bridges/antDesignVue.ts` | Ant Design Vue v4 `ConfigProvider` theme 映射，把项目 Token 转成 Ant token |
| `bridges/vxeTable.ts` | vxe 表头/行/边框/分页覆盖 CSS |
| `bridges/echarts.ts` | `buildEChartsTheme`（纯函数）+ `registerAppEChartsTheme` |
| `bridges/injectStyle.ts` | 幂等注入仍需 CSS 变量兜底的 VXE 覆盖 `<style>`（仅一次） |
| `stores/theme.store.ts` | Pinia store：状态 + localStorage 持久化（不碰 DOM） |
| `composables/useTheme.ts` | 业务 API（状态 + 操作） |
| `composables/useEcharts.ts` | 图表封装（主题注入 + resize + 切主题重建） |
| `ThemeProvider.vue` | 承担「状态 → DOM 副作用」 |
| `index.ts` | 统一导出 + `setupTheme()`（mount 前预应用，防 FOUC） |

> 设计要点：① **store 不碰 DOM**，副作用集中在 ThemeProvider；② **mount 前预应用** `setupTheme()` 读 localStorage 直写 `:root`，避免首屏闪烁；③ **预设只覆盖 primary**，不破坏 success/warning/danger 功能色语义；④ 主题模块**不 import echarts**，由调用方传入运行时（保持轻量）。

---

## 二、快速使用：切换主题

### 方式 1：顶栏切换器（开箱即用）

`DefaultLayout` 顶栏右侧内置 `ThemeSwitcher`：
- 🎨 **调色板图标** → 弹出 5 套主色预设，点选即换主色；
- 💡 **灯泡图标** → 一键切亮 / 暗。

选择写入 `localStorage['app-theme']`，刷新后保持。

### 方式 2：代码控制（业务侧 API）

```ts
import { useTheme } from '@/core/theme';

const {
  isDark,        // 是否暗色（ref<boolean>）
  mode,          // 'light' | 'dark'
  presetKey,     // 当前预设 key
  presets,       // 可选预设清单（供 UI 渲染色板）
  toggleMode,    // 切换亮/暗
  setMode,       // (mode) 直接设置
  setPreset,     // (key) 设置主色预设
} = useTheme();
```

### 方式 3：主题预览页

登录后访问侧边栏「**主题预览**」（路由 `/theme-preview`，admin 角色可见）。该页集中展示色板 / antd 全组件 / VXE 表格 / ECharts 图表 / 业务卡片五大区块，配合顶栏切换器可**肉眼验证四端联动**。

---

## 三、开发者扩展手册

主题系统按「改哪里」分四层，从轻到重。先判断需求属于哪层，再按下表操作：

| 需求 | 层次 | 改哪里 | 难度 |
|---|---|---|---|
| 加一套换肤预设（主色 / 语义色 / 全套视觉） | ① 预设 | `presets.ts` 加一项 | ⭐ |
| 调整亮/暗整体配色 | ② Token | `tokens.ts` + `variables.css` | ⭐⭐ |
| 新增业务专属变量 | ③ 扩展 Token | `tokens.ts` 的 `custom` | ⭐⭐ |
| 新增核心语义色 / 尺寸变量 | ④ 核心 Token | 4 文件联动 | ⭐⭐⭐ |
| 让新的第三方库跟随主题 | ⑤ 新桥接 | 新增 `bridges/xxx.ts` | ⭐⭐⭐ |

### ① 加一套预设（换肤）

在 `src/core/theme/presets.ts` 的 `THEME_PRESETS` 追加一项，`ThemeSwitcher` 与预览页**自动**渲染：

```ts
// 最简：只换主色（success/warning/danger/info 保持模式默认）
{
  key: 'cyan',
  label: '青碧',
  primary: { DEFAULT: '#13c2c2', hover: '#36cfc9', active: '#08979c', disabled: '#87e8de' },
},
```

**整套换色**（品牌定制常见）：预设可选覆盖功能色，由 `applyPreset(base, preset)` 合并——提供哪个覆盖哪个，没提供的保留模式默认：

```ts
{
  key: 'forest',
  label: '森林',
  primary: { DEFAULT: '#00a870', hover: '#1ec488', active: '#008a5c', disabled: '#7ee2b8' },
  success: { DEFAULT: '#389e0d', hover: '#5cb21b', active: '#2f850a', disabled: '#a8d88e' },
  warning: { DEFAULT: '#d4b106', hover: '#ead311', active: '#bfa014', disabled: '#e6d48e' },
  danger:  { DEFAULT: '#c0392b', hover: '#d6554a', active: '#a33024', disabled: '#e8a59f' },
  info:    { DEFAULT: '#3a8fb7', hover: '#5ba6c8', active: '#2e7a9e', disabled: '#9ec3d8' },
},
```

> `applyPreset` 是纯函数，store 的 `currentTokens` 与 `setupTheme` 首屏预应用共用它，保证运行时与 mount 前合并逻辑一致；业务里也可直接调用拿到「某预设下的完整 Token」。

**全套视觉覆盖**（深度品牌定制）：预设还支持覆盖 `text` / `bg` / `border` / `radius` / `layout`，**字段级部分覆盖**——提供哪个字段改哪个，未提供的保留模式默认。因 SSOT 架构，产出仍是完整 Token，Tailwind / antd / VXE / ECharts 四端**自动**消费覆盖值，无需改桥接层：

```ts
{
  key: 'brand-2026',
  label: '品牌定制',
  primary: { DEFAULT: '#7c3aed', hover: '#9061f9', active: '#6d28d9', disabled: '#c4b5fd' },
  // 文字 / 背景 / 边框按需微调（只给要改的字段）
  text:   { title: '#1e1b2e', secondary: '#6b7280' },
  bg:     { page: '#f8f7fc', subtle: '#f1eef9' },
  border: { base: '#e5e0f5' },
  // 连圆角也能调（如全站更圆润）
  radius: { base: '8px', lg: '14px' },
},
```

> **合并语义差异**：语义色（primary / success / …）是**整阶替换**（4 个交互态一起换）；其余维度（text / bg / border / radius / layout）是**字段级浅合并**（`text:{title:'#xx'}` 只改 title）。
> **边界**：预设**跨亮 / 暗模式生效**（同一 key 在两种模式都覆盖 base 对应字段）；模式间固有差异（暗色背景更深）由 `lightTokens` / `darkTokens` 承载，预设不感知模式。

### ② 调整亮 / 暗配色

改 `tokens.ts` 的 `lightTokens` / `darkTokens`（如亮色背景换米白）。

⚠️ **必须同步** `assets/styles/variables.css`——它是无 JS 时的兜底默认值，两处需一致（当前唯一的双源；后续可用构建脚本从 `tokens.ts` 自动生成来消除）。

### ③ 新增业务扩展 Token（推荐）

业务专属变量优先放入 `ThemeTokens.custom`，桥接层会自动展开为 `--custom-*` CSS 变量，不需要再修改 `bridges/cssVariables.ts`。

```ts
// src/core/theme/tokens.ts
export const lightTokens: ThemeTokens = {
  // ...核心 Token
  custom: {
    chart: {
      referenceLine: '#ccd6e0',
      axisLabel: 'rgba(0, 0, 0, 0.65)',
    },
    workflowState: {
      pendingBg: '#fff7e6',
    },
  },
};
```

运行时自动输出：

| custom 路径 | CSS 变量 |
|---|---|
| `custom.chart.referenceLine` | `--custom-chart-reference-line` |
| `custom.chart.axisLabel` | `--custom-chart-axis-label` |
| `custom.workflowState.pendingBg` | `--custom-workflow-state-pending-bg` |

使用方式：

```vue
<template>
  <div style="border-color: var(--custom-chart-reference-line)">
    图表辅助线示例
  </div>
</template>
```

预设也可以覆盖扩展 Token，且是递归深合并：

```ts
{
  key: 'brand-2026',
  label: '品牌定制',
  primary: { DEFAULT: '#7c3aed', hover: '#9061f9', active: '#6d28d9', disabled: '#c4b5fd' },
  custom: {
    chart: {
      referenceLine: '#b9a8ff', // 只覆盖这一项，同组 axisLabel 会保留基础 Token
    },
  },
}
```

命名建议：

- 按业务域分组，如 `chart`、`workflowState`、`dashboard`。
- 变量名自动 camelCase 转 kebab-case，并加 `--custom-` 前缀，避免和核心 Token 冲突。
- 高频、跨业务、可沉淀为设计系统规范的变量，再升级为核心 Token。

### ④ 新增核心语义 Token（如 `--color-brand2`）

核心 Token 适合全项目通用、需要 Tailwind 类或第三方桥接直接消费的设计系统变量。新增核心 Token 仍需四步，**漏一步不报错但部分场景失效**：

| 步 | 文件 | 作用 | 漏了会怎样 |
|---|---|---|---|
| 1 | `types.ts` | 加 `readonly` 字段 | TS 类型缺失 |
| 2 | `tokens.ts` | 亮 / 暗各加值 | 运行时无值 |
| 3 | `bridges/cssVariables.ts` | `buildCssVarMap` 加 `--xxx` 映射 | 运行时不生效 |
| 4 | `tailwind.config.js` + `variables.css` | 加工具类 + 兜底值 | Tailwind 类不可用 |
### ⑤ 接入新的第三方库

仿 `bridges/echarts.ts` 新建 `bridges/xxx.ts`，把 `ThemeTokens` 翻译成该库的主题机制：

- **CSS 变量型库** → 覆盖其 `--xxx` 变量（参考 `bridges/antd.ts`、`vxeTable.ts`）；
- **命令式库**（如 ECharts）→ 生成主题配置并注册（参考 `echarts.ts`）。

然后在该库初始化处或 `ThemeProvider.vue` 调用你的桥接。**主题模块不 import 该库**，由调用方传入运行时——保持模块零重依赖、可被任意业务复用。

### 当前边界（规划扩展时知悉）

- ✅ 预设可整套换色（语义色整阶替换，见 ①）；
- ✅ 预设可全套视觉覆盖（text / bg / border / radius / layout 字段级覆盖，见 ①）；
- ⚠️ 无「运行时任意主色」：用户不能用取色器实时选色，`setPreset` 只接受已注册 key（需要时可加 `setCustomPrimary(hex)` + 色阶生成算法）；
- ⚠️ 预设不感知亮 / 暗模式（同一 key 跨模式覆盖 base 对应字段；模式固有差异由 base 承载）；
- ⚠️ `tokens.ts` ↔ `variables.css` 双源需手动同步（见 ②）；
- ✅ 业务扩展 Token 可放入 `custom` 并自动输出 `--custom-*` CSS 变量；
- ⚠️ 核心 Token 四步靠流程约束，无自动校验。

---

## 四、ECharts：自动跟随主题

ECharts 是命令式 canvas 渲染、无 CSS 变量可用，故通过 vue-echarts 的 `<VChart>` + 项目封装的 `BaseChart` 接入主题：`BaseChart` 内部把 `core/theme` 的 `buildEChartsTheme(tokens)` 产物作为 `:theme` 注入；切主题时 vue-echarts（配合 echarts 6+）走**实例级 `setTheme` 热更新**，不重建实例、不丢事件/状态。业务侧声明式使用，无需关心主题：

```vue
<script setup lang="ts">
import BaseChart from '@/shared/components/BaseChart/index.vue';
import type { EChartsOption } from 'echarts';

const option: EChartsOption = {
  xAxis: { type: 'category', data: ['周一', '周二'] },
  yAxis: { type: 'value' },
  series: [{ type: 'bar', data: [120, 200] }],
};
</script>

<template>
  <!-- 主题自动跟随；autoresize 默认开启；容器需给高度 -->
  <BaseChart :option="option" class="h-80 w-full" />
</template>
```

切换亮暗 / 主色时，图表经实例级 `setTheme` 热更新配色，不重建实例、不丢数据。容器尺寸变化由 `autoresize`（默认开启）自适应，无需手动 resize。

> 设计约束：
> - `buildEChartsTheme(tokens)` 是纯函数（不 import echarts 运行时），由 `BaseChart` 消费，主题模块保持轻量、不进首屏主包；
> - echarts / vue-echarts 由 `BaseChart`（被懒加载路由引用）按需引入，首屏 0 echarts；
> - **版本锁定**：vue-echarts 8 的 peerDep 为 echarts ^6，项目锁定 echarts 6（实例级 `setTheme` 热更新依赖此版本）；
> - **联动图表**：`<BaseChart :option group="dashboard" />` + 一次性 `echarts.connect('dashboard')`（`group` 经 `$attrs` 透传给 VChart，主题重建后自动归回同名组）。

---

## 五、Ant Design Vue v4 主题说明

项目使用 `ant-design-vue@^4.2.6`（v4 线）。v4 已提供 `ConfigProvider` 运行时 theme token 能力，因此 Ant 主题不再依赖 `antd.css` 编译期主色，也不再维护旧版 Ant 选择器覆盖目录。

- **主题入口**：`App.vue` 在根级 `<a-config-provider>` 上传入 `:theme="antDesignTheme"`，并保留 `:locale="zhCN"` 中文化。
- **Token 映射**：`src/core/theme/bridges/antDesignVue.ts` 把项目 `ThemeTokens` 转成 Ant v4 `ThemeConfig`，覆盖主色、状态色、文本色、边框、背景、圆角、字号以及 Layout / Menu / Button 的关键组件 token。
- **运行时联动**：`ThemeProvider` 继续负责写入 `:root` CSS 变量，供 Tailwind、VXE Table、ECharts 和业务 CSS 使用；Ant 组件则通过 ConfigProvider 直接消费同一份项目 Token 生成的 theme 对象。
- **如何调整**：优先修改 `bridges/antDesignVue.ts` 的 token 映射；只有浏览器验证证明 v4 token 覆盖不了具体组件缺口时，才在对应组件或布局本地增加明确注释的 fallback CSS。
- **日期组件**：DatePicker / TimePicker / Calendar 依赖 dayjs，中文 locale 已在 `core/plugins/antd.ts` 统一注入（dayjs 需作为运行时依赖显式声明，pnpm 不会 hoist）。

---

## 六、Design Token 速查表（亮色默认值）

> 以下为**亮色模式默认值**（`lightTokens`）。暗色模式取值见 `src/core/theme/tokens.ts` 的 `darkTokens`。运行时这些值由 `:root` CSS 变量承载，Tailwind 工具类与覆盖样式均以 `var()` 引用。

### 品牌色 / 功能色（每色四态）

| Token | CSS 变量 | 亮色值 | 用途 |
|-------|----------|--------|------|
| `primary` | `--color-primary` | `#1890ff` | 主色（默认） |
| | `--color-primary-hover` | `#40a9ff` | 悬停 |
| | `--color-primary-active` | `#096dd9` | 按下 |
| | `--color-primary-disabled` | `#91d5ff` | 禁用 |
| `success` | `--color-success` | `#52c41a` | 成功 |
| | `--color-success-hover` | `#73d13d` | 悬停 |
| | `--color-success-active` | `#389e0d` | 按下 |
| | `--color-success-disabled` | `#b7eb8f` | 禁用 |
| `warning` | `--color-warning` | `#faad14` | 警告 |
| | `--color-warning-hover` | `#ffc53d` | 悬停 |
| | `--color-warning-active` | `#d48806` | 按下 |
| | `--color-warning-disabled` | `#ffe58f` | 禁用 |
| `danger` | `--color-danger` | `#f5222d` | 危险 |
| | `--color-danger-hover` | `#ff4d4f` | 悬停 |
| | `--color-danger-active` | `#cf1322` | 按下 |
| | `--color-danger-disabled` | `#ffa39e` | 禁用 |
| `info` | `--color-info` | `#1890ff` | 信息（默认与主色一致） |

```html
<!-- 用法（Tailwind 工具类） -->
<div class="bg-primary text-white" />
<div class="bg-success-hover" />
<span class="text-danger" />
<div class="border border-success" />
```

### 文本色

| Tailwind 类 | CSS 变量 | 亮色值 | 用途 |
|-------------|----------|--------|------|
| `text-title` | `--text-title` | `rgba(0,0,0,0.85)` | 标题 |
| `text-body` | `--text-body` | `rgba(0,0,0,0.75)` | 正文（全局默认） |
| `text-secondary` | `--text-secondary` | `rgba(0,0,0,0.45)` | 次要 / 辅助 |
| `text-disabled` | `--text-disabled` | `rgba(0,0,0,0.25)` | 禁用 |
| — | `--text-inverse` | `rgba(255,255,255,0.85)` | 反色（主色/深色背景上） |

### 背景色

| Tailwind 类 / 用法 | CSS 变量 | 亮色值 | 用途 |
|-------------|----------|--------|------|
| `bg-page` | `--bg-page` | `#f0f2f5` | 页面底色 |
| `bg-white` | `--bg-white` | `#ffffff` | 卡片 / 亮容器（暗色退化为容器色） |
| — | `--bg-container` | `#ffffff` | 容器 / 卡片 |
| — | `--bg-elevated` | `#ffffff` | 浮层 / 弹层 |
| — | `--bg-subtle` | `#fafafa` | 次级背景 / hover / 斑马纹 |

> `bg-container` / `bg-elevated` / `bg-subtle` 暂未注册为 Tailwind 工具类，直接用 `style="background: var(--bg-container)"` 即可。

### 边框色

| Tailwind 类 | CSS 变量 | 亮色值 | 用途 |
|-------------|----------|--------|------|
| `border-base` | `--border-base` | `#d9d9d9` | 默认边框 |
| `border-light` | `--border-light` | `#e8e8e8` | 轻边框 / 分隔线 |
| `border-lighter` | `--border-lighter` | `#f0f0f0` | 表格内线 |
| `border-extra-light` | `--border-extra-light` | `#f5f5f5` | 极轻分隔 |

### 圆角

| Tailwind 类 | CSS 变量 | 值 | 适用 |
|-------------|----------|----|------|
| `rounded-sm` | `--radius-sm` | 2px | 标签 / Badge |
| `rounded` | `--radius-base` | 4px | 按钮 / 输入框（默认） |
| `rounded-md` | `--radius-md` | 6px | 卡片 / 下拉 |
| `rounded-lg` | `--radius-lg` | 8px | 弹框 / 大卡片 |
| `rounded-xl` | `--radius-xl` | 12px | 特大容器 |

---

## 七、字体 / 字号 / 间距（Tailwind 覆盖默认）

> 以下取自 `tailwind.config.js`，与主题模式无关（亮暗共用）。

### 字体栈

```
-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif
```

### 字号（已覆盖 Tailwind 默认）

| Tailwind 类 | 字号 | 行高 | 适用 |
|-------------|------|------|------|
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

### 间距

基准单位 **4px**，间距值 = Tailwind 数字 × 4px（已覆盖 Tailwind 默认）。

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

完整刻度：1–12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96。支持 `p` / `m` 全部变体（`px-` / `py-` / `pt-` / `pr-` / `pb-` / `pl-`，margin 同理）。
