/**
 * VXE Table 主题桥接层。
 *
 * 背景（已核实 vxe-table@4.3.7 的真实 CSS，见 node_modules 内 es/table/style.css）：
 * - 4.3.7 的样式【不使用任何 CSS 变量】（既无 --vxe-ui-* 也无 --vxe-*），全部为编译期硬编码色；
 * - 选择器统一以 .vxe-table--render-default 为前缀（注意不是 .vxe-table）；
 * - 网格线用 background-image: linear-gradient(色, 色) 绘制（不是 border 属性），颜色硬编码 #e8eaec；
 * - 表头背景硬编码 #f8f8f9、表格主体 / 页脚 #ffffff。
 *
 * 换肤策略 —— 直接覆盖 vxe 的「真实选择器 + 真实属性」：
 * - 背景：覆盖 background-color，选择器补 .vxe-table--render-default + border--xxx 模式匹配特异性；
 * - 边框：覆盖 background-image（只换 gradient 颜色层，保留 vxe 原有的 size / position / repeat，否则网格线会错位）；
 * - 行状态（hover / current / checked）：vxe 行背景可能写在 td（.vxe-body--column）上，故 row 与 row>column 双覆盖，并用 !important 兜底 vxe 的 inline / 高优先级写入。
 *
 * 覆盖样式全部以 var(...) 引用我们的语义变量，由 ThemeProvider 注入一次，:root 刷新即自动联动，
 * 与 antd / Tailwind 三端视觉统一。
 *
 * 扩展：若某 vxe 元素未跟随（固定列 / 树表 / 弹层 / 空数据），先到 node_modules 核实其真实选择器
 * 与所用属性（背景是否 background-image、是否 border），再按「真实选择器 + 真实属性」原则在此追加。
 */

/**
 * vxe-table 主题覆盖样式（常量字符串）。
 * 由 ThemeProvider 在挂载时注入一次，全程通过 CSS 变量自动响应主题变化。
 */
export const VXE_THEME_CSS = `
/* ============ 文字 ============ */
/* 单元格正文 */
.vxe-table--render-default {
  color: var(--text-body);
}
/* 表头标题 */
.vxe-table--render-default .vxe-header--column .vxe-cell--title {
  color: var(--text-title);
  font-weight: 600;
}

/* ============ 背景色（vxe 硬编码：表头 #f8f8f9 / 主体 #ffffff）============ */
/* 表头底色：所有 border 模式均为 #f8f8f9，逐一覆盖以匹配真实特异性 */
.vxe-table--render-default.border--default .vxe-table--header-wrapper,
.vxe-table--render-default.border--full .vxe-table--header-wrapper,
.vxe-table--render-default.border--outer .vxe-table--header-wrapper,
.vxe-table--render-default.border--inner .vxe-table--header-wrapper,
.vxe-table--render-default.border--none .vxe-table--header-wrapper {
  background-color: var(--bg-subtle);
}
/* 表格主体 / 页脚：#ffffff */
.vxe-table--render-default .vxe-table--body-wrapper,
.vxe-table--render-default .vxe-table--footer-wrapper {
  background-color: var(--bg-container);
}

/* ============ 边框（vxe 用 background-image:linear-gradient 画网格线，非 border 属性）============ */
/* default / inner 模式：行底边（单个 gradient）。仅覆盖 image，保留 vxe 的 size/position/repeat */
.vxe-table--render-default.border--default .vxe-header--column,
.vxe-table--render-default.border--default .vxe-body--column,
.vxe-table--render-default.border--default .vxe-footer--column,
.vxe-table--render-default.border--inner .vxe-header--column,
.vxe-table--render-default.border--inner .vxe-body--column,
.vxe-table--render-default.border--inner .vxe-footer--column {
  background-image: linear-gradient(var(--border-lighter), var(--border-lighter));
}
/* full 模式：网格线（行底 + 列右，两个 gradient，与 vxe 的双 background-size 对应） */
.vxe-table--render-default.border--full .vxe-header--column,
.vxe-table--render-default.border--full .vxe-body--column,
.vxe-table--render-default.border--full .vxe-footer--column {
  background-image: linear-gradient(var(--border-lighter), var(--border-lighter)),
                    linear-gradient(var(--border-lighter), var(--border-lighter));
}
/* 表头末尾 gutter 的底边（vxe 用单个 gradient） */
.vxe-table--render-default.border--default .vxe-table--header-wrapper .vxe-header--row:last-child .vxe-header--gutter,
.vxe-table--render-default.border--full .vxe-table--header-wrapper .vxe-header--row:last-child .vxe-header--gutter,
.vxe-table--render-default.border--outer .vxe-table--header-wrapper .vxe-header--row:last-child .vxe-header--gutter,
.vxe-table--render-default.border--inner .vxe-table--header-wrapper .vxe-header--row:last-child .vxe-header--gutter {
  background-image: linear-gradient(var(--border-lighter), var(--border-lighter));
}
/* 真正用 border 属性处：footer 顶边、固定列右边、外框线 */
.vxe-table--render-default .vxe-table--footer-wrapper {
  border-top-color: var(--border-lighter);
}
.vxe-table--render-default.border--full .vxe-table--fixed-left-wrapper .vxe-body--column {
  border-right-color: var(--border-lighter);
}
.vxe-table--render-default .vxe-table--border-line {
  border-color: var(--border-lighter);
}

/* ============ 行状态（vxe 行背景可能写在 td 上，row 与 row>column 双覆盖 + !important 兜底）============ */
/* hover 行 */
.vxe-table--render-default .vxe-body--row.row--hover,
.vxe-table--render-default .vxe-body--row.row--hover .vxe-body--column,
.vxe-table--render-default .vxe-body--row:hover,
.vxe-table--render-default .vxe-body--row:hover .vxe-body--column {
  background-color: var(--bg-subtle) !important; /* !important：vxe 对 hover 用 inline / 高优先级写入 */
}
/* 当前行（点击聚焦） */
.vxe-table--render-default .vxe-body--row.row--current,
.vxe-table--render-default .vxe-body--row.row--current .vxe-body--column {
  background-color: color-mix(in srgb, var(--color-primary) 10%, transparent) !important;
}
/* 选中行（勾选） */
.vxe-table--render-default .vxe-body--row.row--checked,
.vxe-table--render-default .vxe-body--row.row--checked .vxe-body--column,
.vxe-table--render-default .vxe-body--row.row--checked.row--hover,
.vxe-table--render-default .vxe-body--row.row--checked.row--hover .vxe-body--column {
  background-color: color-mix(in srgb, var(--color-primary) 14%, transparent) !important;
}

/* ============ 分页 Pager ============ */
/* 激活页码 */
.vxe-pager .vxe-pager--num-btn.is--active {
  background-color: var(--color-primary);
  color: var(--text-inverse);
}
.vxe-pager .vxe-pager--num-btn:not(.is--disabled):hover {
  color: var(--color-primary);
}
/* 跳转 / 前后翻页等按钮 hover */
.vxe-pager .vxe-pager--jump-prev:not(.is--disabled):hover,
.vxe-pager .vxe-pager--jump-next:not(.is--disabled):hover,
.vxe-pager .vxe-pager--prev-btn:not(.is--disabled):hover,
.vxe-pager .vxe-pager--next-btn:not(.is--disabled):hover {
  color: var(--color-primary);
}

/* ============ 排序图标 / 勾选 checkbox ============ */
/* 排序激活态 */
.vxe-table--render-default .vxe-header--column .vxe-cell--sort .vxe-sort--asc-btn.sort--active,
.vxe-table--render-default .vxe-header--column .vxe-cell--sort .vxe-sort--desc-btn.sort--active {
  color: var(--color-primary);
}
/* 勾选 checkbox（复用主色） */
.vxe-table--render-default .vxe-checkbox--icon,
.vxe-table--render-default .vxe-checkbox.checked .vxe-checkbox--icon {
  color: var(--color-primary);
}
`;
