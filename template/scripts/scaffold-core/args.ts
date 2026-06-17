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

export interface FeatureArgs {
  /** 域名或序号（选择已存在的域），提供则跳过域选择 */
  domain?: string;
  /** 特性名（kebab-case） */
  name?: string;
  /** 特性中文名 */
  chinese?: string;
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

/** 解析 scaffold:feature 的参数 */
export const parseFeatureArgs = (argv: string[]): FeatureArgs => ({
  domain: getOption(argv, "domain"),
  name: getOption(argv, "name"),
  chinese: getOption(argv, "chinese"),
  noPage: argv.includes("--no-page"),
  noMenu: argv.includes("--no-menu"),
  dryRun: argv.includes("--dry-run"),
});
