## Context

模板默认主题为 antd v4 早期观感，缺品牌记忆点；经多轮风格探索否决了「现代极简」（素/冷灰 AI 味）与「深色侧栏」（太重/看不清）方向，最终确定蓝色系 Bento 拼贴。见 proposal 的 Why。当前已有一份确定的高保真设计稿（`modern-style-preview-bento.html`），本 change 记录其 token 值与布局 pattern。

## Goals / Non-Goals

**Goals:**

- 记录蓝色系 token 主色阶（含亮/暗双模式）作为后续落进 `tokens.ts` / `presets.ts` 的依据
- 明确 Bento 拼贴布局 pattern 与多色 tint 点缀纪律
- 锁定对比度契约与胶囊控件语言

**Non-Goals:**

- 本 change 不实施（不落 template 代码、不 archive），仅作变更记录
- 不动 `theme-extension` 的 custom token 机制（保持向后兼容）
- 不改路由/权限/菜单数据契约

## Decisions

1. **主色 `#2e6ef0` 而非 antd `#1677ff` 或 shadcn `#2563eb`**
   用户明确「更喜欢蓝色」且要避开通用 AI 味的单蓝。`#2e6ef0` 比 antd 蓝更饱和、比 shadcn 蓝更亮，且与 violet 辅助同属蓝紫家族、渐变末端保留一抹蓝。备选 `#1677ff`/`#3b63ee` 被否（太常见 / 偏靛）。hover/active 取更深的 `#2458d4` / `#1c46b0` 以保证按钮白字对比达标。

2. **整套中性色转蓝灰，而非只改主色**
   用户反复「偏紫」的观感来自紫罗兰主色 + 紫调 neutral（页面/侧栏/输入框）叠加。因此页面底 `#eef1f9`、侧栏 `#f7f9fd`、输入框 `#eff2f9`、次要文字 `#59646f` 一并去紫。备选「只改 primary」被否——治标不治本。

3. **亮色侧栏 + 三层色差**
   用户否掉深侧栏。侧栏为 `#f7f9fd` 纸底，靠页面底/侧栏/卡片三色差分层与 1px 细线，而非深色重底。

4. **多色 tint 只作点缀**
   彩色（蓝/绿/橙/粉/青）以低饱和 tint 形式出现在 icon chip、状态块、进度条、图表系列。大面积整卡上色仅限「待办提示卡」一处场景，避免花哨。

5. **超级 tabular 数字 + 胶囊控件语言**
   数字用 `font-variant-numeric: tabular-nums` 大字重；激活菜单/tab/按钮/分段器/聚焦环共用胶囊形态，形成全站统一语言。

## Risks / Trade-offs

- [Bento 多色 tint 失控变花] → tint 仅点缀、大面积整卡上色限定一处场景（待办卡）
- [蓝色系在暗色模式偏灰] → 暗色单独调亮 `--primary: #5b8df5`、`--violet: #6d8ff7`，且按钮文字换深色，保证对比
- [1px 卡片边 vs 阴影同时存在触发检测余量提示] → 保留设计选择：1px 浅边定义边界 + 近距柔和阴影给深度
- [占位符对比度随 input 底变化] → faint 色随 input-bg 联动校验，已锁定达标值

## Migration Plan

当前为记录阶段，无部署动作。后续落进 template 时：替换 `tokens.ts` 的 light/dark 色值 → 在 `presets.ts` 增加蓝色 Bento 风格包 → 新增看板示例页。回滚即恢复原 token 值。

## Open Questions

（无——本次仅记录已确定的设计稿；实施细节留待后续 change）
