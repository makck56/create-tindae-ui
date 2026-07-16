---
# 本文件遵循 @google/design.md 格式规范（YAML front matter 设计 token + Markdown 设计理念）。
# normative 值取「亮色模式 + 拂晓蓝默认预设」（lightTokens + DEFAULT_PRESET_KEY='blue'）。
# 暗色模式、其余 4 套主色预设见正文章格；运行时真源：src/core/theme/。
name: Tindae UI
version: alpha
description: Vue 3 企业级后台管理系统的视觉身份与设计 token，单一真相源（CSS 变量）驱动 Ant Design Vue / Tailwind / VXE Table / ECharts 四端联动。

colors:
  # —— 主色色阶（被 button-primary 引用，整阶覆盖）——
  primary: "#1890ff"           # 拂晓蓝 DEFAULT，主交互色
  primary-hover: "#40a9ff"     # 悬停态
  primary-active: "#096dd9"    # 按下态
  on-primary: "#ffffff"        # 主色背景上的文字 / 图标
  # —— 文字色（rgba 黑等效 hex，便于 agent 直消费）——
  title: "#262626"             # ≈ rgba(0,0,0,0.85) 标题
  body: "#404040"              # ≈ rgba(0,0,0,0.75) 正文
  # —— 容器 / 页面背景 ——
  container: "#ffffff"         # 卡片 / 输入 / 默认按钮底
  page: "#f0f2f5"              # 页面底色

typography:
  heading-xl:
    fontFamily: &app-sans "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: 28px
    fontWeight: 600
    lineHeight: 36px
  heading-lg:
    fontFamily: *app-sans
    fontSize: 24px
    fontWeight: 600
    lineHeight: 32px
  heading-md:
    fontFamily: *app-sans
    fontSize: 20px
    fontWeight: 600
    lineHeight: 28px
  body-lg:
    fontFamily: *app-sans
    fontSize: 18px
    fontWeight: 400
    lineHeight: 28px
  body-md:
    fontFamily: *app-sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
  body-sm:
    fontFamily: *app-sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 22px
  label:
    fontFamily: *app-sans
    fontSize: 12px
    fontWeight: 500
    lineHeight: 20px

rounded:
  sm: 2px     # 标签 / Badge
  md: 4px     # 按钮 / 输入框（默认）
  lg: 6px     # 卡片 / 下拉
  xl: 8px     # 弹框 / 大卡片
  2xl: 12px   # 特大容器

spacing:
  xs: 4px     # 基准单位（Tailwind p-1）
  sm: 8px     # p-2
  md: 16px    # p-4
  lg: 24px    # p-6
  xl: 32px    # p-8
  2xl: 48px   # p-12

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 16px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-primary-active:
    backgroundColor: "{colors.primary-active}"
  button-default:
    backgroundColor: "{colors.container}"
    textColor: "{colors.title}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 16px
  surface-card:
    backgroundColor: "{colors.container}"
    textColor: "{colors.title}"
    rounded: "{rounded.lg}"
    padding: 24px
  surface-page:
    backgroundColor: "{colors.page}"
    textColor: "{colors.body}"
  input:
    backgroundColor: "{colors.container}"
    textColor: "{colors.title}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    height: 32px
---

## Overview

**Tindae UI** 是一套面向**企业级后台管理系统**的视觉身份。它不追求花哨的视觉表达，而以「**信息密度高、长时间使用不疲劳、操作路径清晰**」为目标——这正是 B 端中后台的核心诉求。

风格关键词：

- **克制的中性底色 + 单一主色驱动**：页面以 `#f0f2f5` 浅灰为底、白色卡片为容器，主色（拂晓蓝 `#1890ff`）只用于「需要被点击」的交互元素（主按钮、链接、选中态、聚焦边框），把用户注意力精准引导到可操作处。
- **Ant Design 基因**：取值与 Ant Design 默认色板对齐，默认状态下 `ant-design-vue` 原生样式与 token 驱动的覆盖层视觉一致；切换主色 / 暗色时才显式体现差异。
- **四端联动 SSOT**：一份 TS Token → `:root` CSS 变量（单一真相源）→ Tailwind / Ant Design Vue / VXE Table / ECharts 四端同时消费，换肤只重写一次 `:root`，绝不出现「换肤后图表还是旧色」的割裂。

> **给 coding agent**：本文件 front matter 的 token 是 normative 值（亮色 + 拂晓蓝默认）。生成 UI 时，颜色直接用上面的 hex，圆角 / 间距用上面的 dimension；需要交互态时，hover/active 参照 `primary-hover` / `primary-active` 的明暗走向。多预设与暗色见下文表格，运行时改色走 `src/core/theme/presets.ts` 与 `tokens.ts`，**不要**在业务代码里写死字面色。

## Colors

调色板由「**品牌主色 + 功能语义色 + 中性灰阶**」三组构成。主色是唯一的交互驱动色；功能色承载固定的状态语义（成功 / 警告 / 危险 / 信息），**预设换肤不破坏功能色语义**——只换 primary，success/warning/danger 保持默认。

### 主色与交互态（默认拂晓蓝）

| Token | hex | 用途 |
|:------|:----|:-----|
| `primary` | `#1890ff` | 主色：主按钮、链接、选中、聚焦 |
| `primary-hover` | `#40a9ff` | 悬停（更亮） |
| `primary-active` | `#096dd9` | 按下（更暗） |
| `primary-disabled` | `#91d5ff` | 禁用（极浅） |
| `on-primary` | `#ffffff` | 主色背景上的文字 / 图标 |

### 功能语义色（每色四态，亮色默认）

| Token | DEFAULT | hover | active | disabled | 语义 |
|:------|:--------|:------|:-------|:---------|:-----|
| `success` | `#52c41a` | `#73d13d` | `#389e0d` | `#b7eb8f` | 成功 / 正向 |
| `warning` | `#faad14` | `#ffc53d` | `#d48806` | `#ffe58f` | 警告 / 待处理 |
| `danger`  | `#f5222d` | `#ff4d4f` | `#cf1322` | `#ffa39e` | 危险 / 删除 / 错误 |
| `info`    | `#1890ff` | `#40a9ff` | `#096dd9` | `#91d5ff` | 信息（默认与主色一致） |

### 中性色（文字 / 背景 / 边框）

| 分组 | Token | 亮色值 | 用途 |
|:-----|:------|:-------|:-----|
| 文字 | `title` | `rgba(0,0,0,0.85)` ≈ `#262626` | 标题 |
| 文字 | `body` | `rgba(0,0,0,0.75)` ≈ `#404040` | 正文（全局默认） |
| 文字 | `secondary` | `rgba(0,0,0,0.45)` ≈ `#8c8c8c` | 次要 / 辅助 |
| 文字 | `disabled` | `rgba(0,0,0,0.25)` ≈ `#bfbfbf` | 禁用 |
| 文字 | `inverse` | `rgba(255,255,255,0.85)` | 主色 / 深色背景上的反色文字 |
| 背景 | `page` | `#f0f2f5` | 页面底色 |
| 背景 | `container` / `white` | `#ffffff` | 卡片 / 亮容器 |
| 背景 | `elevated` | `#ffffff` | 浮层 / 弹层 |
| 背景 | `subtle` | `#fafafa` | 次级背景 / hover / 斑马纹 |
| 边框 | `base` | `#d9d9d9` | 默认边框 |
| 边框 | `light` | `#e8e8e8` | 轻边框 / 分隔线 |
| 边框 | `lighter` | `#f0f0f0` | 表格内线 |
| 边框 | `extra-light` | `#f5f5f5` | 极轻分隔 |

> Tailwind 工具类：`bg-primary` / `bg-primary-hover` / `text-title` / `text-secondary` / `bg-page` / `border-base` 等均以 `var()` 引用上述变量，详见 `tailwind.config.js`。

### 5 套主色预设（换肤）

切换主色时，仅 `primary` 色阶整体替换，其余保持默认。`ThemeSwitcher` 顶栏切换器与「主题预览」页（`/theme-preview`）开箱即用。

| key | 标签 | DEFAULT | hover | active | disabled |
|:----|:-----|:--------|:------|:-------|:---------|
| `blue`（默认） | 拂晓蓝 | `#1890ff` | `#40a9ff` | `#096dd9` | `#91d5ff` |
| `green` | 极光绿 | `#00a870` | `#1ec488` | `#008a5c` | `#7ee2b8` |
| `purple` | 酱紫 | `#722ed1` | `#9254de` | `#531dab` | `#d3adf7` |
| `orange` | 日暮 | `#fa8c16` | `#ffa940` | `#d46b08` | `#ffd591` |
| `red` | 炽热红 | `#f5222d` | `#ff4d4f` | `#cf1322` | `#ffa39e` |

### 暗色模式

参考 Ant Design 暗色色板取值，主要差异：背景下沉为深灰（`page #141414` / `container #1f1f1f`），文字反转为白系（`title rgba(255,255,255,0.85)`），主色微调为 `#177ddc` 以保证暗底对比度。`bg.white` 在暗色下**语义退化为容器色 `#1f1f1f`**——业务里 `bg-white` 区块不会刺眼地泛白。完整取值见 `src/core/theme/tokens.ts` 的 `darkTokens`。

## Typography

字体栈为跨平台系统字体无衬线栈（`-apple-system` 起手），**不引入外部 Web 字体**，保证零网络等待与各操作系统原生观感。字号体系覆盖了 Tailwind 默认（项目把 `base` 上调到 18px 以提升中文正文可读性）：

| Token | 字号 | 字重 | 行高 | 对应 Tailwind 类 | 适用 |
|:------|:-----|:-----|:-----|:-----------------|:-----|
| `heading-xl` | 28px | 600 | 36px | `text-2xl` | 页面标题 |
| `heading-lg` | 24px | 600 | 32px | `text-xl` | 区块标题 |
| `heading-md` | 20px | 600 | 28px | `text-lg` | 小标题 / 卡片标题 |
| `body-lg` | 18px | 400 | 28px | `text-base` | 正文（默认） |
| `body-md` | 16px | 400 | 24px | `text-tiny` | 正文（紧凑） |
| `body-sm` | 14px | 400 | 22px | `text-sm` | 表格 / 表单 / 按钮 |
| `label` | 12px | 500 | 20px | `text-xs` | 辅助标注 / 标签 / Badge |

> 中文字体在 macOS 走 `苹方`、Windows 走 `微软雅黑`（由系统字体栈自动解析），无需额外声明。

## Layout

后台典型布局：**左侧边栏 + 顶部 Header + 多页签 TabBar + 主内容区（keep-alive）**，主内容区独立滚动。

| Token | 值 | 说明 |
|:------|:---|:-----|
| `sidebarWidth` | `220px` | 侧边栏展开宽度 |
| `sidebarCollapsedWidth` | `80px` | 侧边栏收起宽度 |
| `headerHeight` | `48px` | 顶栏高度 |

**间距体系**以 **4px 为基准单位**（Tailwind 数字 × 4px），完整刻度覆盖 `1–12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96`。常用档位：

| Token | 值 | 典型用途 |
|:------|:---|:---------|
| `xs` | 4px | 紧凑内边距、图标与文字间距 |
| `sm` | 8px | 表单项间距、Badge 内边距 |
| `md` | 16px | 卡片内常规间距、按钮组间距 |
| `lg` | 24px | 卡片内边距（`PageWrapper` 默认） |
| `xl` | 32px | 区块间距 |
| `2xl` | 48px | 大区块间距 |

> 业务页统一用 `PageWrapper`（搜索头 + 内容区 + 页脚）骨架，间距由其内部 flex 布局兜底，避免手写魔法数字。

## Elevation & Depth

本项目**未自定义阴影 token**，elevation 全部沿用 `ant-design-vue` 默认阴影体系（卡片、Dropdown、Drawer、Modal、Popover 各自的默认层级），保证与 antd 原生组件视觉一致。亮 / 暗模式均如此。

层级约定（antd 默认，供 agent 理解深度语义）：

| 层级 | 承载组件 | 视觉 |
|:-----|:---------|:-----|
| 0（无阴影） | 卡片 `surface-card` / 页面容器 | 平铺于 `page` 底色之上，靠 `container` 与 `page` 的明度差区分 |
| 1 | Dropdown / Select 弹层 | 轻投影 |
| 2 | Drawer / Popover | 中投影 |
| 3 | Modal | 重投影 |

> 如需自定义阴影（如大屏可视化），建议在 `src/core/theme/types.ts` + `tokens.ts` 新增 `elevation` token，经 CSS 变量桥接，遵循「单一真相源」原则（见 `theme.md` 第三节「新增 Token 四步」）。

## Shapes

圆角体系分 5 档，从紧凑到圆润渐进：

| Token | 值 | Tailwind 类 | 适用 |
|:------|:---|:------------|:-----|
| `sm` | 2px | `rounded-sm` | 标签 / Badge / Tag |
| `md` | 4px | `rounded` | 按钮 / 输入框（默认） |
| `lg` | 6px | `rounded-md` | 卡片 / 下拉面板 |
| `xl` | 8px | `rounded-lg` | 弹框 / 大卡片 |
| `2xl` | 12px | `rounded-xl` | 特大容器 / 大屏区块 |

> 圆角在亮 / 暗模式间共用（不随模式变化）。预设可字段级覆盖（如 `radius: { base: '8px', lg: '14px' }` 让全站更圆润），见 `theme.md` ①。

## Components

下述组件 token 是 normative 值（亮色默认）。业务侧优先使用 `ant-design-vue` 组件 + Tailwind 工具类，主题系统会通过 CSS 变量覆盖层让它们自动跟随换肤。

- **button-primary**：主按钮。`primary` 底 + `on-primary` 白字 + `body-sm` + `rounded md`。交互态：hover → `primary-hover`，active → `primary-active`，disabled → `primary-disabled` + `disabled` 文字色。
- **button-default**：次按钮。`container` 白底 + `title` 深字 + `base` 边框（边框走 prose，非组件属性）。
- **surface-card**：内容卡片。`container` 白底 + `title` 标题 + `rounded lg` + `lg(24px)` 内边距，叠于 `page` 底色之上。
- **surface-page**：页面外层。`page` 底色 + `body` 正文。
- **input**：输入控件。`container` 白底 + `title` 字 + `body-sm` + `rounded md` + 32px 高度；聚焦态边框转 `primary`。

### 复合组件（消费上述 token，无单独 token entry）

| 组件 | 底层 | 主题联动点 |
|:-----|:-----|:-----------|
| 表格 | `vxe-grid` | 表头 / 行 hover / 选中行 / 分页 → `bridges/vxeTable.ts` 覆盖为 `var(--color-primary)` 等 |
| 图表 | ECharts | `bridges/echarts.ts` 把 token 注入为 `app-theme` 主题，切肤自动 `dispose→init→回放` |
| 导航 | 侧边栏 / Header / TabBar | 选中项、hover、聚焦均引主色变量 |
| 反馈 | `message` / `Tag` / `Badge` | success/warning/danger/info 走语义色变量 |

## Do's and Don'ts

### ✅ Do

- **换肤走预设**：新增主色在 `src/core/theme/presets.ts` 的 `THEME_PRESETS` 追加一项，`ThemeSwitcher` 与预览页**自动**渲染，无需改业务代码。
- **颜色用 CSS 变量 / Tailwind 类**：`bg-primary` / `text-title` / `var(--color-primary)`，让四端自动联动。
- **保持 token 不可变**：`types.ts` 全 `readonly`，改色经 `applyPreset()` 返回新对象（immutability），不要原地 mutation。
- **暗色双源同步**：调整暗色配色时，`tokens.ts` 与 `assets/styles/variables.css`（无 JS 兜底默认值）**必须同步**，否则首屏闪烁。
- **功能色语义稳定**：预设只覆盖 primary；success/warning/danger 承载固定状态语义，不要用主色去表达「危险」，也不要用 danger 表达「主操作」。

### ❌ Don't

- **不要在业务代码写死字面色**（`style="color:#1890ff"`）——换肤后不会联动，破坏 SSOT。
- **不要跨亮 / 暗模式硬编码**：暗色下 `bg-white` 已退化为 `#1f1f1f`，相信变量语义，不要手动「在暗色把白改成灰」。
- **不要在前端做权限边界**：`v-permission` 隐藏仅为 UX，真正鉴权必须在后端。

### ♿ 无障碍 / 对比度（诚实说明）

本设计系统的主色 `#1890ff` 与白字组合对比度约 **3.3:1**——这是 Ant Design 色板的客观取值（行业通行），**未达 WCAG AA 正文 4.5:1，但满足 WCAG AA 大字（≥18.66px 或 ≥14pt 粗体）3:1 与非文本组件 3:1**。因此：

- 主按钮（`button-primary`）文字建议用于 14px 及以上场景；若需严格 AA 4.5:1，给主按钮文字加 `font-weight: 600`（`@google/design.md lint` 会对该组件报一条 `contrast-ratio` warning，属已知且被接受的客观项）。
- 链接（主色文字 on 白底）同理；正文长段落避免使用主色，统一用 `body` / `title`。

## 校验（lint）

本文件可由 `@google/design.md` 工具校验 / 导出 / 对比：

```bash
# 结构校验 + WCAG 对比度检查（输出 JSON）
pnpm exec design.md lint design.md

# 导出 raw tokens，并同步生成项目内 Tailwind 适配层
pnpm run tokens:export

# 校验 raw tokens 与适配结果是否仍满足项目契约
pnpm run tokens:check

# 导出为 W3C Design Tokens Format（tokens.json）
pnpm exec design.md export --format dtcg design.md > tokens.json
```

**预期 lint 结果**：`errors: 0`；`warnings: 1`（`button-primary` 的 `contrast-ratio`，原因见上文「无障碍」一节，已知且被接受）；若干 `info`（token 统计）。若调整了 token，请重新跑 `lint` 确保无 `broken-ref`（error）与无新增不可解释的 warning。

---

> 本文件描述「视觉身份」。主题系统的**运行时架构**（SSOT 数据流、桥接层、扩展手册、antd v3 局限与升级路径）见 [`theme.md`](./theme.md)；**项目架构**（四层分层、Page/View 分离、权限、请求层）见 [`ARCHITECTURE.md`](./ARCHITECTURE.md) 与 [`README.md`](./README.md)。
