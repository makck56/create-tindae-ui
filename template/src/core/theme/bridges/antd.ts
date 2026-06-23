/**
 * Ant Design Vue 主题桥接层。
 *
 * 背景：项目使用 ant-design-vue@^3.2（v3 线）。v3 没有 v4/v5 的 ConfigProvider token 运行时 API，
 * 主题主色在 antd.css 编译期固化为字面色（如 #1890ff）。要在运行时跟随「统一主题」换色，
 * 最务实的方式是注入一段覆盖样式，把主色相关的高频组件改为引用我们的 CSS 变量。
 *
 * 策略：
 * - 覆盖样式全部使用 var(--color-primary) 等变量引用，因此只需注入一次 <style>，
 *   主题变化时由 applyTokensToRoot 刷新 :root 变量，本覆盖自动联动，无需重新生成字符串。
 * - 选择器与 antd 原生保持同等特异性，且本 <style> 在 antd.css 之后加载，天然覆盖；
 *   仅个别与 vxe/原生 hover 冲突的点用 !important 并注明原因。
 * - 聚焦「主色高频呈现」组件（按钮 / 选择 / 分页 / 标签页 / 菜单 / 步骤 / 进度 / Tag / Alert / 聚焦态），
 *   不追求 100% 覆盖所有组件——若某组件未跟随主题，按此模板在此追加规则即可。
 *
 * 升级路径：未来迁移到 ant-design-vue v4/v5 后，可改用 ConfigProvider :theme="{ token }{}"，
 * 届时本文件可大幅精简，甚至仅保留 token 映射即可。
 */

/**
 * antd v3 主题覆盖样式（常量字符串）。
 * 由 ThemeProvider 在挂载时注入一次，全程通过 CSS 变量自动响应主题变化。
 */
export const ANTD_THEME_CSS = `
/* ============ 全局 body 文字 / 背景（必须放最前，优先级兜底）============ */
/* 覆盖 antd 全局 reset（es/style/index.css 第 36-44 行）硬编码的
   color: rgba(0,0,0,0.85) / background-color: #fff ——
   否则继承 body 的所有元素（含 antd 图标的 currentColor）在暗色下仍是深色，「图标全黑」即此引起。
   本 <style> 由 ThemeProvider 最后注入 head，同特异性下后加载胜，保证盖过 antd 原生 body 规则。 */
body {
  color: var(--text-body);
  background-color: var(--bg-page);
}

/* ============ 按钮 Button ============ */
/* 主按钮：四态（默认 / hover / active / disabled）跟随品牌主色 */
.ant-btn-primary {
  color: var(--text-inverse);
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  text-shadow: none;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045);
}
.ant-btn-primary:not(:disabled):hover,
.ant-btn-primary:not(:disabled):focus {
  color: var(--text-inverse);
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}
.ant-btn-primary:not(:disabled):active {
  color: var(--text-inverse);
  background-color: var(--color-primary-active);
  border-color: var(--color-primary-active);
}
.ant-btn-primary:disabled {
  color: var(--text-inverse);
  background-color: var(--color-primary-disabled);
  border-color: var(--color-primary-disabled);
}
/* 链接按钮 */
.ant-btn-link {
  color: var(--color-primary);
}
.ant-btn-link:not(:disabled):hover,
.ant-btn-link:not(:disabled):focus {
  color: var(--color-primary-hover);
}
/* 默认 / 文本 / 虚线按钮：文字与图标（currentColor）跟随正文色 ——
   否则 antd 编译期深色字面色在暗色深底（如顶栏）上不可见 */
.ant-btn:not(.ant-btn-primary):not(.ant-btn-link):not(.ant-btn-dangerous) {
  color: var(--text-body);
}
.ant-btn:not(.ant-btn-primary):not(.ant-btn-link):not(.ant-btn-dangerous):hover,
.ant-btn:not(.ant-btn-primary):not(.ant-btn-link):not(.ant-btn-dangerous):focus {
  color: var(--color-primary);
}
/* default / dashed（有边框）：边框跟随主题边框色，hover 主色；text 按钮无边框不在此列 */
.ant-btn:not(.ant-btn-primary):not(.ant-btn-link):not(.ant-btn-text):not(.ant-btn-dangerous) {
  border-color: var(--border-base);
}
.ant-btn:not(.ant-btn-primary):not(.ant-btn-link):not(.ant-btn-text):not(.ant-btn-dangerous):hover,
.ant-btn:not(.ant-btn-primary):not(.ant-btn-link):not(.ant-btn-text):not(.ant-btn-dangerous):focus {
  border-color: var(--color-primary);
}

/* ============ 选择控件 ============ */
/* Checkbox 勾选态 */
.ant-checkbox-checked .ant-checkbox-inner {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}
.ant-checkbox-indeterminate .ant-checkbox-inner::after {
  background-color: var(--color-primary);
}
/* Radio */
.ant-radio-checked .ant-radio-inner {
  border-color: var(--color-primary);
}
.ant-radio-inner::after {
  background-color: var(--color-primary);
}
.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
  color: var(--color-primary);
  background-color: transparent;
  border-color: var(--color-primary);
}
.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled)::before {
  background-color: var(--color-primary);
}
/* Switch 开关 */
.ant-switch-checked {
  background-color: var(--color-primary);
}

/* ============ 分页 Pagination ============ */
.ant-pagination-item-active {
  color: var(--color-primary);
  border-color: var(--color-primary);
}
.ant-pagination-item-active a {
  color: var(--color-primary);
}
.ant-pagination-item:hover,
.ant-pagination-item:hover a,
.ant-pagination-jump-prev:hover::after,
.ant-pagination-jump-next:hover::after {
  color: var(--color-primary);
}

/* ============ 标签页 Tabs ============ */
.ant-tabs-tab:hover .ant-tabs-tab-btn,
.ant-tabs-tab-btn:focus {
  color: var(--color-primary-hover);
}
.ant-tabs-tab-active .ant-tabs-tab-btn {
  color: var(--color-primary) !important; /* !important：antd 内联对此项有较高优先级，需强提 */
  font-weight: 500;
}
.ant-tabs-ink-bar {
  background-color: var(--color-primary);
}
.ant-tabs-top > .ant-tabs-nav::before,
.ant-tabs-bottom > .ant-tabs-nav::before,
.ant-tabs-top > div > .ant-tabs-nav::before,
.ant-tabs-bottom > div > .ant-tabs-nav::before {
  border-bottom-color: var(--border-light);
}

/* ============ 菜单 Menu（inline 选中态：亮 / 暗均跟随主色）============ */
.ant-menu-light .ant-menu-item-selected,
.ant-menu-light .ant-menu-submenu-selected {
  color: var(--color-primary);
}
.ant-menu-light .ant-menu-item-selected::after {
  border-right-color: var(--color-primary);
}
/* 暗色菜单选中态（侧边栏暗色模式下，菜单选中项跟随主色） */
.ant-menu-dark .ant-menu-item-selected,
.ant-menu-dark .ant-menu-submenu-selected,
.ant-menu-dark .ant-menu-item-selected > a {
  color: var(--color-primary);
}

/* ============ 聚焦态 Focus（输入框 / 选择器 / 日期选择器统一主色描边）============ */
.ant-input:focus,
.ant-input:focus-within,
.ant-input-affix-wrapper-focused,
.ant-input-affix-wrapper:focus,
.ant-picker-focused,
.ant-select-focused:not(.ant-select-disabled) .ant-select-selector,
.ant-cascader:focus .ant-cascader-input,
.ant-tree-select:focus .ant-select-selector {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 20%, transparent);
}

/* ============ 其他高频主色呈现 ============ */
/* 加载条 Spin */
.ant-spin-dot-item {
  background-color: var(--color-primary);
}
/* ============ 进度条 Progress ============ */
/* 线型填充条：正常态跟随主色；success / exception 态由 antd 状态类（更高特异性）保护，仍为绿 / 红 */
.ant-progress-bg {
  background-color: var(--color-primary);
}
/* 环形进度弧线（同上，状态类保护 success / exception） */
.ant-progress-circle .ant-progress-circle-path {
  stroke: var(--color-primary);
}

/* ============ 步骤条 Steps ============ */
/* 进行中步骤：图标主色填充、数字 / 图标反色（Steps 最显眼的主色呈现） */
.ant-steps-item-process .ant-steps-item-icon {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}
.ant-steps-item-process .ant-steps-item-icon .ant-steps-icon {
  color: var(--text-inverse);
}
/* 已完成步骤：图标边框 + 勾主色 */
.ant-steps-item-finish .ant-steps-item-icon {
  border-color: var(--color-primary);
}
.ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon {
  color: var(--color-primary);
}
/* 已完成步骤之后的连接线主色（选择器特异性对齐 antd 原生，确保覆盖） */
.ant-steps-item-finish > .ant-steps-item-container > .ant-steps-item-tail::after {
  background-color: var(--color-primary);
}
/* ============ 标签 Tag（状态色：processing 跟主色，其余跟功能色）============ */
/* antd 状态 Tag = 白底 + 色边框 + 色文字；只改边框与文字色，背景保持 antd 默认 */
.ant-tag-status-processing {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.ant-tag-status-success {
  border-color: var(--color-success);
  color: var(--color-success);
}
.ant-tag-status-warning {
  border-color: var(--color-warning);
  color: var(--color-warning);
}
.ant-tag-status-error {
  border-color: var(--color-danger);
  color: var(--color-danger);
}

/* ============ 警告提示 Alert（info 跟主色，其余跟功能色）============ */
/* antd Alert = 浅 tint 背景 + 色边框 + 色图标；背景 tint 由 color-mix 现场混合，亮 / 暗皆协调 */
.ant-alert-info {
  background-color: color-mix(in srgb, var(--color-primary) 8%, var(--bg-container));
  border-color: color-mix(in srgb, var(--color-primary) 30%, var(--bg-container));
}
.ant-alert-info .ant-alert-icon {
  color: var(--color-primary);
}
.ant-alert-success {
  background-color: color-mix(in srgb, var(--color-success) 8%, var(--bg-container));
  border-color: color-mix(in srgb, var(--color-success) 30%, var(--bg-container));
}
.ant-alert-success .ant-alert-icon {
  color: var(--color-success);
}
.ant-alert-warning {
  background-color: color-mix(in srgb, var(--color-warning) 8%, var(--bg-container));
  border-color: color-mix(in srgb, var(--color-warning) 30%, var(--bg-container));
}
.ant-alert-warning .ant-alert-icon {
  color: var(--color-warning);
}
.ant-alert-error {
  background-color: color-mix(in srgb, var(--color-danger) 8%, var(--bg-container));
  border-color: color-mix(in srgb, var(--color-danger) 30%, var(--bg-container));
}
.ant-alert-error .ant-alert-icon {
  color: var(--color-danger);
}

/* Badge 计数色 */
.ant-badge-status-processing::after {
  border-color: var(--color-primary);
}
/* 选中行/树选中态 */
.ant-tree .ant-tree-node-selected {
  background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
}

/* ============ 容器 / 表面：跟随亮暗与 bg/border/text 变量 ============ */
/* 设计动机：antd 把 Layout / Card / Collapse / Modal 等的背景编译为字面色，
   既不跟主色也不跟亮暗，导致切暗色时白底刺眼、切全套预设时不联动。
   这里统一改为引用主题变量，让「容器类」组件随主题。 */

/* Layout 布局骨架：最外层 .ant-layout 默认硬编码 #f0f2f5（页面底色），切暗色不变 ——「ant-layout 没变化」的根因 */
.ant-layout {
  background: var(--bg-page);
}
.ant-layout-footer {
  background: var(--bg-page);
  color: var(--text-body);
}
/* 顶栏默认文字色跟随主题（antd 编译期硬编码 rgba(0,0,0,0.85)，暗色深底上不可见） */
.ant-layout-header {
  color: var(--text-title);
}
/* Sider 侧边栏：跟随全局亮暗联动（由 Default.layout 的 app-sider--light / --dark class 驱动）。
   覆盖 antd 硬编码 .ant-layout-sider(#001529) / .ant-layout-sider-trigger(#002140)。
   - 亮色：浅色侧边栏（容器色 + 右边框分隔）+ light 菜单（菜单 theme 由业务切到 light）
   - 暗色：深色侧边栏（页面底色）+ dark 菜单 */
.ant-layout-sider.app-sider--light {
  background: var(--bg-container) !important;
  border-right: 1px solid var(--border-light);
}
.ant-layout-sider.app-sider--light .ant-layout-sider-trigger {
  background: var(--bg-container) !important;
  color: var(--text-title) !important;
  border-top: 1px solid var(--border-light);
}
.ant-layout-sider.app-sider--dark {
  background: var(--bg-page) !important;
}
.ant-layout-sider.app-sider--dark .ant-layout-sider-trigger {
  background: var(--bg-page) !important;
  color: var(--text-inverse) !important;
}
/* header / content 由业务用 Tailwind bg-white 接管（见 tailwind.config 的 white 映射）。 */

/* Card 卡片（切亮暗 / 全套预设均跟随） */
.ant-card {
  background-color: var(--bg-container);
  border-color: var(--border-light);
  color: var(--text-body);
}
.ant-card-head {
  color: var(--text-title);
  border-bottom-color: var(--border-light);
}
.ant-card-head-title {
  color: var(--text-title);
}
.ant-card-body {
  color: var(--text-body);
}

/* Collapse 折叠面板 */
.ant-collapse {
  background-color: var(--bg-container);
  border-color: var(--border-light);
  color: var(--text-body);
}
.ant-collapse > .ant-collapse-item {
  border-bottom-color: var(--border-light);
}
.ant-collapse-header {
  color: var(--text-title);
}
.ant-collapse-content {
  background-color: var(--bg-container);
  color: var(--text-body);
  border-top-color: var(--border-light);
}
.ant-collapse-arrow {
  color: var(--text-secondary);
}

/* Modal 弹窗 */
.ant-modal-content {
  background-color: var(--bg-elevated);
}
.ant-modal-header {
  background-color: transparent;
  border-bottom-color: var(--border-light);
}
.ant-modal-title {
  color: var(--text-title);
}
.ant-modal-close-icon {
  color: var(--text-secondary);
}
.ant-modal-footer {
  border-top-color: var(--border-light);
}

/* Drawer 抽屉 */
.ant-drawer-content {
  background-color: var(--bg-elevated);
}
.ant-drawer-header {
  border-bottom-color: var(--border-light);
}
.ant-drawer-title {
  color: var(--text-title);
}
.ant-drawer-close-icon {
  color: var(--text-secondary);
}

/* Popover 气泡（Tooltip 保持 antd 默认深色气泡，不覆盖） */
.ant-popover-inner {
  background-color: var(--bg-elevated);
}
.ant-popover-title {
  color: var(--text-title);
  border-bottom-color: var(--border-light);
}
.ant-popover-inner-content {
  color: var(--text-body);
}
.ant-popover-arrow-content {
  background-color: var(--bg-elevated);
}

/* 表单输入默认态：背景 / 边框 / 文字 / 占位符（聚焦主色描边已在上方覆盖） */
.ant-input,
.ant-input-affix-wrapper,
.ant-input-number,
.ant-picker {
  background-color: var(--bg-container);
  border-color: var(--border-base);
  color: var(--text-body);
}
.ant-input::placeholder,
.ant-picker input::placeholder {
  color: var(--text-disabled);
}
.ant-select:not(.ant-select-customize-input) .ant-select-selector {
  background-color: var(--bg-container) !important; /* !important：antd 对 selector 背景优先级较高 */
  border-color: var(--border-base) !important;
  color: var(--text-body) !important;
}
/* Select 下拉项 hover / 选中 */
.ant-select-item-option-active:not(.ant-select-item-option-disabled) {
  background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
}
.ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
  background-color: var(--color-primary);
  color: var(--text-inverse);
  font-weight: 600;
}

/* antd 原生 Table（项目主力为 VXE，此处兜底；VXE 主题见 bridges/vxeTable.ts） */
.ant-table {
  background-color: var(--bg-container);
  color: var(--text-body);
}
.ant-table-thead > tr > th {
  background-color: var(--bg-subtle);
  color: var(--text-title);
  border-bottom-color: var(--border-light);
}
.ant-table-tbody > tr > td {
  border-bottom-color: var(--border-lighter);
}
.ant-table-tbody > tr.ant-table-row-hover > td,
.ant-table-tbody > tr:hover > td {
  background-color: var(--bg-subtle);
}
.ant-table-tbody > tr.ant-table-row-selected > td {
  background-color: color-mix(in srgb, var(--color-primary) 8%, transparent);
}

/* ============ 主色呈现补全 ============ */

/* Slider 滑动条：轨道 + 手柄（预览页可见；disabled 态由 antd 自身保护） */
.ant-slider-track {
  background-color: var(--color-primary);
}
.ant-slider:hover .ant-slider-track {
  background-color: var(--color-primary-hover);
}
.ant-slider-handle {
  border-color: var(--color-primary);
}
.ant-slider-handle:hover,
.ant-slider-handle:focus {
  border-color: var(--color-primary-hover);
  box-shadow: 0 0 0 5px color-mix(in srgb, var(--color-primary) 18%, transparent);
}

/* Timeline 时间轴：默认蓝点 → 主色 */
.ant-timeline-item-head-blue {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

/* DatePicker / Calendar 选中日 / 今日 */
.ant-picker-cell-selected .ant-picker-cell-inner {
  background-color: var(--color-primary);
  color: var(--text-inverse);
}
.ant-calendar-selected-day .ant-calendar-date {
  background-color: var(--color-primary);
  color: var(--text-inverse);
}
.ant-calendar-today .ant-calendar-date,
.ant-picker-cell-today .ant-picker-cell-inner::before {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Dropdown / Menu 项 hover（主色淡底） */
.ant-dropdown-menu-item-active,
.ant-dropdown-menu-item:hover:not(.ant-dropdown-menu-item-disabled),
.ant-menu-item-active:not(.ant-menu-item-selected) {
  background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
}

/* Anchor 锚点激活 */
.ant-anchor-link-active > .ant-anchor-link-title {
  color: var(--color-primary);
}

/* 暂不覆盖：Rate（保持金色评分语义）、Tooltip（保持默认深色气泡）、Tag 色板色（blue/green 等为固定语义）。 */
`;
