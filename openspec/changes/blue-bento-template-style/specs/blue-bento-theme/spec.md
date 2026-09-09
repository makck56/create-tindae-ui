## Purpose

规定模板后台界面的蓝色系 Bento 拼贴视觉规范：以品牌蓝 `#2e6ef0` 为主色、亮色侧栏 + 卡片拼贴布局、多色协调 tint 点缀，保证对比度达标且不在亮/暗模式下失去辨识度。

## ADDED Requirements

### Requirement: 蓝色系 token 色阶

模板主题 SHALL 采用蓝色系主色阶，主色为 `#2e6ef0`；页面底、侧栏纸底、输入框底、次要文字等中性色 MUST 为蓝灰色调（非紫调）；violet 辅助色与 logo/渐变 MUST 转蓝系。

#### Scenario: 亮色模式主色

- **WHEN** 主题处于亮色模式
- **THEN** 主色为 `#2e6ef0`，hover/active 分别为 `#2458d4` / `#1c46b0`

#### Scenario: 中性色不偏紫

- **WHEN** 渲染页面底/侧栏/输入框/次要文字
- **THEN** 其色相为蓝灰而非紫（正常视觉下不应出现紫调观感）

### Requirement: 亮色侧栏与三层色差

侧边栏 SHALL 为亮色（非深色），与内容区以背景色差分层（页面底 > 侧栏纸底 > 卡片画布三层），MUST NOT 使菜单文字对比度低于 WCAG AA。

#### Scenario: 侧栏可读性

- **WHEN** 侧栏处于亮色主题
- **THEN** 菜单文字/分组标签/用户信息的对比度均 ≥4.5:1，无文字模糊难辨

### Requirement: Bento 卡片拼贴布局

主看板 SHALL 用大小错落的卡片网格（KPI 小卡 → hero 图表 + 待办侧卡 → 信息卡行 → 全宽表格），卡片之间用间距与尺寸差异形成节奏，MUST NOT 退化为等宽均质卡片阵。

#### Scenario: 看板构图

- **WHEN** 渲染看板首页
- **THEN** 存在至少两种不同跨度的卡片（如 hero 大图跨多列、KPI 小卡），形成非对称拼贴节奏

#### Scenario: 多色 tint 仅点缀

- **WHEN** 页面并置多张卡片
- **THEN** 色彩 tint 只出现在 icon chip、状态块、进度条、图表系列，不得大面积覆盖整个卡片背景造成花哨

### Requirement: 对比度契约束

正文、占位符、语义状态文字、头像文字 MUST 满足 WCAG AA（≥4.5:1），亮暗双模式均须达标。

#### Scenario: 亮暗两模式对比度

- **WHEN** 分别渲染亮色与暗色主题
- **THEN** 逐项抽检正文/占位符/语义文字/头像文字的对比度均 ≥4.5:1

### Requirement: 胶囊控件语言

激活菜单项、tab、按钮、分段器、聚焦环、搜索框 SHALL 共用胶囊（大圆角/全圆）形态，形成统一的控件语言。

#### Scenario: 控件形态一致

- **WHEN** 查看激活菜单、选中的 tab、主按钮与聚焦态
- **THEN** 它们呈现同源的胶囊形态而非各不相同的圆角

## REMOVED Requirements

（无）

## MODIFIED Requirements

（无）
