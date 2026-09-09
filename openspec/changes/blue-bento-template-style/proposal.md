## Why

模板默认风格为早期 Ant Design v4 观感（灰蓝背景 + 边框卡片 + 系统字体），通用、无品牌记忆点。用户对「现代极简」（zinc 灰 + 单蓝点缀的 shadcn 默认味）与「深色侧栏」（太重 / 文字看不清）均不满意，最终在 Backend 流行风格对照中选定 **蓝色系 Bento 拼贴**：亮色侧栏 + 卡片拼贴 + 多色协调 tint，既保留卡片舒适区、又不素、不冷灰 AI 味。本轮已完成高保真设计稿并确定 token 值。

## What Changes

- 整套 token 从「紫罗兰 + 紫调中性」迁到 **蓝色系**：主色 `#2e6ef0`，页面/侧栏纸底/输入框/次要文字全部转蓝灰，violet 辅助与 logo/chip 渐变同步转蓝
- **亮色侧栏**（采纳「深侧栏太重/看不清」反馈），与内容区三层色差分层
- **卡片拼贴（Bento）布局**：KPI 小卡行 → hero 大图 + 待办侧卡 → 信息卡三行 → 全宽表格，大小错落有节奏
- **多色协调 tint 点缀**（蓝/绿/橙/粉/青，低饱和）只在 chip、待办卡、进度条、图表出现，不刺眼
- 协调低饱和色阶、超大 tabular 数字、胶囊控件语言
- WCAG AA 对比度全达标（正文/占位/头像/hover 全部 ≥4.5:1）

## Capabilities

### New Capabilities

- `blue-bento-theme`: 蓝色系 Bento 拼贴后台视觉规范——蓝色 token 色阶、Bento 布局 pattern、多色 tint 点缀、对比度契约、亮暗双模式

### Modified Capabilities

（无——既有 capability 需求不变；`theme-extension` 的 custom token 机制未被改动）

## Impact

- `template/src/core/theme/tokens.ts` / `presets.ts`（蓝色 token 色阶落地）
- `template/src/core/theme/types.ts`（如需 shadow token 组）
- 布局与看板示例组件（Bento grid pattern）
- `pen/design.pen`（设计稿实现，后续任务）
- 高保真参照：`modern-style-preview-bento.html`
