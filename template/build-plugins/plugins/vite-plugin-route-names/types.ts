/**
 * 类型定义文件
 * 定义路由名称检查和修复功能的所有类型
 */

// ==================== 插件配置 ====================

export interface RouteNamesPluginOptions {
  /** 输出文件路径 */
  outputFile?: string;
  /** 是否启用一致性检查 */
  enableCheck?: boolean;
  /** 检查失败时是否抛出错误 */
  strict?: boolean;
}

export interface CheckOptions extends RouteNamesPluginOptions {
  /** 输出格式 */
  format?: 'text' | 'json';
}

export interface FixOptions extends RouteNamesPluginOptions {
  /** 预览模式 (不实际修改文件) */
  dryRun?: boolean;
}

// ==================== 检查结果 ====================

export interface ComponentCheckResult {
  /** 页面文件路径 */
  pagePath: string;
  /** 路由名称 */
  routeName: string;
  /** 组件名称 */
  componentName: string | null;
  /** 是否有 defineOptions */
  hasDefineOptions: boolean;
  /** 是否匹配 */
  isMatch: boolean;
}

export interface ConsistencyCheckReport {
  /** 总数 */
  total: number;
  /** 匹配数量 */
  matched: number;
  /** 不匹配数量 */
  unmatched: number;
  /** 详细结果 */
  details: ComponentCheckResult[];
}

// ==================== 修复结果 ====================

export interface FixResult {
  /** 文件路径 */
  filePath: string;
  /** 路由名称 */
  routeName: string;
  /** 操作类型 */
  action: 'inject' | 'replace' | 'skip';
  /** 修改前内容 (片段) */
  before?: string;
  /** 修改后内容 (片段) */
  after?: string;
}

export interface FixReport {
  /** 总数 */
  total: number;
  /** 已修复数量 */
  fixed: number;
  /** 跳过数量 */
  skipped: number;
  /** 详细结果 */
  results: FixResult[];
}

// ==================== Vue 文件解析 ====================

export interface ParsedScriptSetup {
  /** 是否有 defineOptions */
  hasDefineOptions: boolean;
  /** 组件名称 */
  componentName: string | null;
  /** script 内容 */
  scriptContent: string;
  /** import 语句结束位置 */
  importEndPosition: number;
  /** defineOptions 位置范围 */
  defineOptionsRange?: { start: number; end: number };
}

// ==================== 路由信息 ====================

export interface RouteInfo {
  /** 路由名称 */
  name: string;
  /** 组件路径 */
  componentPath: string;
  /** 绝对页面路径 */
  absolutePagePath: string;
  /** 页面内容 */
  pageContent: string;
}

// ==================== 路由常量生成 ====================

export interface RouteNameEntry {
  /** 路由名称 */
  name: string;
  /** 标题 */
  title?: string;
}

export interface DomainRouteMap {
  [domainName: string]: {
    [key: string]: RouteNameEntry;
  };
}
