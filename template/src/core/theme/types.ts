/**
 * 主题 Token 类型定义 —— 整套主题系统的「契约层」。
 *
 * 设计目标：
 * 1. 作为 Tailwind / VXE Table / Ant Design Vue 三端的「单一真相源（SSOT）」，
 *    一份 Token 经桥接层分别映射到三个库各自的主题机制，杜绝多套配色各写一遍。
 * 2. 全部字段 readonly，配合不可变模式（immutability），运行时只能「替换」整份 Token，
 *    不能就地修改，避免多处持有引用导致的竞态。
 *
 * 命名约定：
 * - 这里的语义命名（如 colors.primary.DEFAULT、text.title）会被桥接层翻译成 CSS 变量，
 *   例如 colors.primary.DEFAULT → --color-primary，text.title → --text-title。
 *   tailwind.config.js / global.css / 各组件统一消费这些 CSS 变量。
 */

/** 单个语义色阶：覆盖默认 / 悬浮 / 激活 / 禁用 四个交互态 */
export interface ColorScale {
  /** 默认态主色 */
  readonly DEFAULT: string;
  /** hover 悬浮态（略亮） */
  readonly hover: string;
  /** active 激活态（略暗） */
  readonly active: string;
  /** disabled 禁用态（低饱和） */
  readonly disabled: string;
}

/** 文本色阶：从深到浅 */
export interface TextTokens {
  /** 标题：最深、最强 */
  readonly title: string;
  /** 正文：常规内容 */
  readonly body: string;
  /** 次要：说明、辅助文本 */
  readonly secondary: string;
  /** 禁用：占位、不可用 */
  readonly disabled: string;
  /** 反色：用于主色 / 深色背景之上的文字 */
  readonly inverse: string;
}

/** 背景色阶：从页面底层到浮层 */
export interface BgTokens {
  /** 页面底色：最外层背景 */
  readonly page: string;
  /** 容器：卡片 / 面板 */
  readonly container: string;
  /** 浮层：弹窗 / 抽屉 / 下拉 */
  readonly elevated: string;
  /** 亮语义白：亮模式下即纯白；暗模式退化为容器色（保持语义稳定） */
  readonly white: string;
  /** 次级背景：hover / 斑马纹 / 分组底色 */
  readonly subtle: string;
}

/** 边框色阶：从重到轻 */
export interface BorderTokens {
  /** 常规边框 */
  readonly base: string;
  /** 轻边框：分隔线 */
  readonly light: string;
  /** 更轻：表格内部分隔 */
  readonly lighter: string;
  /** 最轻：极弱分隔 */
  readonly extraLight: string;
}

/** 圆角阶梯（与 tailwind.config.js borderRadius 对齐） */
export interface RadiusTokens {
  readonly sm: string;
  readonly base: string;
  readonly md: string;
  readonly lg: string;
  readonly xl: string;
}

/** 布局尺寸（与 DefaultLayout 的 sider/header 尺寸对齐） */
export interface LayoutTokens {
  /** 侧边栏展开宽度 */
  readonly sidebarWidth: string;
  /** 侧边栏折叠宽度 */
  readonly sidebarCollapsedWidth: string;
  /** 顶部栏高度 */
  readonly headerHeight: string;
}

/**
 * 完整主题 Token 集合。
 * 三端桥接（bridges/*）以此结构为输入，生成各自需要的主题产物（CSS 变量、antd 覆盖样式等）。
 */
export interface ThemeTokens {
  /** 语义色系：primary 为品牌主色，其余为功能色 */
  readonly colors: {
    readonly primary: ColorScale;
    readonly success: ColorScale;
    readonly warning: ColorScale;
    readonly danger: ColorScale;
    readonly info: ColorScale;
  };
  readonly text: TextTokens;
  readonly bg: BgTokens;
  readonly border: BorderTokens;
  readonly radius: RadiusTokens;
  readonly layout: LayoutTokens;
}

/** 主题模式：亮色 / 暗色 */
export type ThemeMode = 'light' | 'dark';

/**
 * 品牌预设：定义一套可整体切换的视觉风格。
 *
 * 覆盖能力分三档（由轻到重，全部可选叠加，向后兼容）：
 *
 * 1) 换主色（最常见）：只填 `primary`，其余语义色 / 文字 / 背景 / 边框… 全部保留模式默认；
 * 2) 换语义色：按需提供 `success` / `warning` / `danger` / `info`，**整阶替换**（4 个交互态一起换）；
 * 3) 全套视觉覆盖：按需提供 `text` / `bg` / `border` / `radius` / `layout`，
 *    **字段级部分覆盖**（提供哪个字段覆盖哪个，未提供的保留 base）。
 *
 * 合并语义见 `applyPreset`：
 * - 语义色为「整阶替换」——要么整组 4 态，要么不动（避免半套色阶造成交互态断层）；
 * - 其余维度为「字段级浅合并」——`text: { title: '...' }` 只改 title，body / secondary / … 不变。
 *
 * 边界：预设**跨亮 / 暗模式生效**（同一 key 在两种模式下都覆盖 base 对应字段）；
 * 模式间的固有差异（如暗色背景更深）由 `lightTokens` / `darkTokens` 承载，预设不感知模式。
 *
 * 向后兼容：`primary` 为必填，其余全部可选，旧预设无需改动。
 */
export interface ThemePreset {
  /** 唯一标识，用于持久化 */
  readonly key: string;
  /** 展示名（中文化） */
  readonly label: string;

  // —— 语义色（整阶替换；primary 必填，其余可选）——
  /** 主色色阶（必填） */
  readonly primary: ColorScale;
  /** 可选：覆盖成功色（不提供则保留模式默认） */
  readonly success?: ColorScale;
  /** 可选：覆盖警告色 */
  readonly warning?: ColorScale;
  /** 可选：覆盖危险色 */
  readonly danger?: ColorScale;
  /** 可选：覆盖信息色 */
  readonly info?: ColorScale;

  // —— 全套视觉覆盖（字段级部分覆盖；提供哪个字段覆盖哪个）——
  /** 可选：覆盖文本色（title / body / secondary / disabled / inverse 任一） */
  readonly text?: Partial<TextTokens>;
  /** 可选：覆盖背景色（page / container / elevated / white / subtle 任一） */
  readonly bg?: Partial<BgTokens>;
  /** 可选：覆盖边框色（base / light / lighter / extraLight 任一） */
  readonly border?: Partial<BorderTokens>;
  /** 可选：覆盖圆角（sm / base / md / lg / xl 任一） */
  readonly radius?: Partial<RadiusTokens>;
  /** 可选：覆盖布局尺寸（sidebarWidth / sidebarCollapsedWidth / headerHeight 任一） */
  readonly layout?: Partial<LayoutTokens>;
}

/**
 * 运行时主题状态：Pinia store 的持久化形态。
 * mode 决定基础明暗；preset 决定主色覆盖。
 */
export interface ThemeState {
  readonly mode: ThemeMode;
  readonly presetKey: string;
}
