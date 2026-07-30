/**
 * VXE Table 主题桥接层。
 *
 * 背景（已核实 vxe-table@4.20.7 的真实 CSS，见 node_modules 内 es/table/style.css）：
 * - 4.6+ 起表格样式【全面 CSS 变量化】：es/table/style.css 中 var(--vxe-ui-*) 引用约 395 处；
 * - 边框仍用 background-image:linear-gradient 绘制，但颜色已由 --vxe-ui-table-border-color 驱动
 *   （不再是 4.3.7 时代的编译期硬编码色）；
 * - 表头 / 主体 / hover 行背景、正文文字、主色均已暴露为 --vxe-ui-* 语义变量。
 *
 * 换肤策略（随版本升级为「变量映射」）：
 * - 在 :root 把 --vxe-ui-* 链式引用到模板语义 token（--color-primary / --bg-subtle / --border-lighter 等）；
 * - 主题切换时 ThemeProvider 重写 :root 的模板 token，CSS 变量实时级联，VXE 全表自动联动；
 * - 无需逐选择器重画 gradient、无需 !important 兜底（变量覆盖不惧选择器特异性）。
 *
 * 例外（保留选择器覆盖）：
 * - current / checked 行背景：vxe 未暴露对应变量，且背景写在 .vxe-body--column 上，仍需 !important；
 * - pager 激活态：需同时设「背景主色 + 文字反色」双属性，单一变量无法表达；
 * - 表头标题 / 排序激活 / 勾选 checkbox：主色应用，font-primary-color 变量已覆盖，此处选择器作保险。
 *
 * 扩展：若某 vxe 元素仍未跟随，先到 node_modules 核实其是否已有 --vxe-ui-* 变量
 * （有则补到 :root 映射），确实无变量再按「真实选择器 + 真实属性」原则在此追加。
 */

/**
 * vxe-table 主题覆盖样式（常量字符串）。
 * 由 ThemeProvider 在挂载时注入一次，全程通过 CSS 变量自动响应主题变化。
 */
export const VXE_THEME_CSS = `
/* ============ :root 变量映射（替代逐选择器覆盖，全表联动）============ */
:root {
  /* 文字：正文 / 主色（排序激活、勾选 checkbox、pager hover、链接等所有主色场景） */
  --vxe-ui-font-color: var(--text-body);
  --vxe-ui-font-primary-color: var(--color-primary);
  /* 背景：表头 / 主体 / 页脚 / 弹层与自定义列等容器 */
  --vxe-ui-table-header-background-color: var(--bg-subtle);
  --vxe-ui-layout-background-color: var(--bg-container);
  /* 边框：表格全部网格线 / 外框 / 固定列分隔线 / 弹层 / 输入框
     （4.20.7 用此变量驱动 background-image gradient，覆盖变量即换全部网格线颜色） */
  --vxe-ui-table-border-color: var(--border-lighter);
  --vxe-ui-base-popup-border-color: var(--border-lighter);
  --vxe-ui-input-border-color: var(--border-base);
  /* hover 行背景 */
  --vxe-ui-table-row-hover-background-color: var(--bg-subtle);
}

/* ============ 表头标题（深色 + 加粗，区分于正文）============ */
.vxe-table--render-default .vxe-header--column .vxe-cell--title {
  color: var(--text-title);
  font-weight: 600;
}

/* ============ 排序激活 / 勾选 checkbox（主色；font-primary-color 变量已覆盖，此为保险）============ */
.vxe-table--render-default .vxe-header--column .vxe-cell--sort .vxe-sort--asc-btn.sort--active,
.vxe-table--render-default .vxe-header--column .vxe-cell--sort .vxe-sort--desc-btn.sort--active {
  color: var(--color-primary);
}
.vxe-table--render-default .vxe-checkbox--icon,
.vxe-table--render-default .vxe-checkbox.checked .vxe-checkbox--icon {
  color: var(--color-primary);
}

/* ============ 行状态：current / checked（vxe 未暴露背景变量，保留选择器 + !important）============ */
/* 4.20.7 行状态背景写在 .vxe-body--column 上，故用子代选择器定位列单元格 */
.vxe-table--render-default .vxe-body--row.row--current > .vxe-body--column,
.vxe-table--render-default .vxe-body--row.row--hover.row--current > .vxe-body--column {
  background-color: color-mix(in srgb, var(--color-primary) 10%, transparent) !important;
}
.vxe-table--render-default .vxe-body--row.row--checked > .vxe-body--column,
.vxe-table--render-default .vxe-body--row.row--hover.row--checked > .vxe-body--column {
  background-color: color-mix(in srgb, var(--color-primary) 14%, transparent) !important;
}

/* ============ 分页 Pager（vxe-pc-ui：激活态需 背景主色 + 文字反色 双属性，保留选择器）============ */
.vxe-pager .vxe-pager--num-btn.is--active {
  background-color: var(--color-primary);
  color: var(--text-inverse);
}
.vxe-pager .vxe-pager--num-btn:not(.is--disabled):hover {
  color: var(--color-primary);
}
.vxe-pager .vxe-pager--jump-prev:not(.is--disabled):hover,
.vxe-pager .vxe-pager--jump-next:not(.is--disabled):hover,
.vxe-pager .vxe-pager--prev-btn:not(.is--disabled):hover,
.vxe-pager .vxe-pager--next-btn:not(.is--disabled):hover {
  color: var(--color-primary);
}
`;
