/**
 * scaffold.ts 的命令行参数解析。
 *
 * 支持非交互模式（--name/--chinese/--feature）与标志（--dry-run/--no-menu），
 * 便于脚本化 / CI。任一必填项缺失时回退到交互式 prompt。
 */

export interface DomainArgs {
  /** 域名（kebab-case），提供则跳过域名交互 */
  name?: string;
  /** 中文名，提供则跳过中文名交互 */
  chinese?: string;
  /** 默认特性名，提供则跳过特性名交互 */
  feature?: string;
  /** 跳过侧边栏菜单 / mock 权限配置 */
  noMenu?: boolean;
  /** 预览将创建 / 修改的文件，不落盘 */
  dryRun?: boolean;
}

/**
 * Feature 的「页面类型」——决定渲染哪一套模板。
 *
 * - `list`：表格型（默认），vxe-grid 分页表格 + 增删改查（CRUD）。
 * - `overview`：概览型，KPI 统计卡片 + 近期数据列表（Dashboard 风格，无 CRUD）。
 *
 * 保持为字符串字面量联合，方便 `--type=list|overview` 直接映射，且杜绝非法值。
 */
export type FeatureType = "list" | "overview";

/** 合法类型取值集合（解析 --type 时用于校验） */
export const FEATURE_TYPES: readonly FeatureType[] = ["list", "overview"] as const;

export interface FeatureArgs {
  /** 域名或序号（选择已存在的域），提供则跳过域选择 */
  domain?: string;
  /** 特性名（kebab-case） */
  name?: string;
  /** 特性中文名 */
  chinese?: string;
  /**
   * 页面类型（list 表格型 / overview 概览型）。
   * 提供（非交互模式）则跳过类型选择交互；缺省按 list 处理。
   */
  type?: FeatureType;
  /** 跳过页面创建 */
  noPage?: boolean;
  /** 跳过侧边栏菜单 */
  noMenu?: boolean;
  /** 预览不落盘 */
  dryRun?: boolean;
}

/** 从 argv 取 `--key=value` 或 `--key value` 形式的值 */
const getOption = (argv: string[], key: string): string | undefined => {
  const equals = argv.find((a) => a.startsWith(`--${key}=`));
  if (equals) return equals.split("=")[1];
  const idx = argv.indexOf(`--${key}`);
  if (idx >= 0 && idx + 1 < argv.length && !argv[idx + 1].startsWith("--")) {
    return argv[idx + 1];
  }
  return undefined;
};

/** 解析 scaffold:domain 的参数（argv[0] 是 "domain"） */
export const parseDomainArgs = (argv: string[]): DomainArgs => ({
  name: getOption(argv, "name"),
  chinese: getOption(argv, "chinese"),
  feature: getOption(argv, "feature"),
  noMenu: argv.includes("--no-menu"),
  dryRun: argv.includes("--dry-run"),
});

/**
 * 解析 `--type` 为合法 FeatureType。
 *
 * - 未传 → undefined（交由调用方按默认 list 处理，保留「未显式指定」的语义）。
 * - 传入但非法（如 `--type=form`）→ 同样返回 undefined 并告警，避免静默落盘成错误模板。
 */
const parseFeatureType = (raw: string | undefined): FeatureType | undefined => {
  if (raw === undefined) return undefined;
  if ((FEATURE_TYPES as readonly string[]).includes(raw)) {
    return raw as FeatureType;
  }
  console.warn(
    `⚠️  无效的 --type 值: "${raw}"（可选: ${FEATURE_TYPES.join(", ")}），将使用默认类型 list`
  );
  return undefined;
};

/** 解析 scaffold:feature 的参数 */
export const parseFeatureArgs = (argv: string[]): FeatureArgs => ({
  domain: getOption(argv, "domain"),
  name: getOption(argv, "name"),
  chinese: getOption(argv, "chinese"),
  type: parseFeatureType(getOption(argv, "type")),
  noPage: argv.includes("--no-page"),
  noMenu: argv.includes("--no-menu"),
  dryRun: argv.includes("--dry-run"),
});
