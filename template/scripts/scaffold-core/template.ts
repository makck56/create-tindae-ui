/**
 * 模板渲染引擎
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import { toCamelCase, toKebabCase, toPascalCase } from "./utils";
import type { FeatureType } from "./args";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// 假设 templates 在 ../templates (相对于 scaffold-core)
const TEMPLATES_DIR = path.join(__dirname, "..", "templates");

/** 编译后的模板缓存：避免同一模板多次 readFile + compile */
const templateCache = new Map<string, HandlebarsTemplateDelegate>();

/**
 * 注入到 .hbs 模板的变量集合。
 *
 * `typeSuffix`（"List" / "Overview"）由 `featureType` 派生，供模板拼接出
 * 与类型匹配的文件名 / 组件名（如 `{{featurePascal}}{{typeSuffix}}View`），
 * 使同一套 page 模板对「表格型 / 概览型」通用。
 */
export interface TemplateData {
  domainName: string;
  domainKebab: string;
  domainPascal: string;
  domainCamel: string;
  featureName: string;
  featureKebab: string;
  featurePascal: string;
  featureCamel: string;
  /** 路由 name / 菜单 code / 权限 code 的统一名称，新增 feature 默认带 domain 前缀 */
  featureRouteName: string;
  /** Page Shell 组件名，跟随路由名派生，避免跨域同名 feature 的 keep-alive 名称冲突 */
  pageComponentName: string;
  chineseName: string;
  featureChineseName: string;
  /** 页面类型（list 表格型 / overview 概览型） */
  featureType: FeatureType;
  /** 类型对应的 PascalCase 后缀，用于文件名 / 组件名拼接 */
  typeSuffix: "List" | "Overview";
}

export const loadTemplate = async (
  templatePath: string
): Promise<HandlebarsTemplateDelegate> => {
  const cached = templateCache.get(templatePath);
  if (cached) return cached;

  const fullPath = path.join(TEMPLATES_DIR, templatePath);
  try {
    const templateContent = await fs.readFile(fullPath, "utf-8");
    const compiled = Handlebars.compile(templateContent);
    templateCache.set(templatePath, compiled);
    return compiled;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`加载模板失败 ${templatePath}: ${errorMessage}`);
  }
};

export const renderTemplate = async (
  templatePath: string,
  data: Record<string, unknown>
): Promise<string> => {
  const template = await loadTemplate(templatePath);
  return template(data);
};

export const prepareTemplateData = (config: {
  domainName: string;
  featureName?: string;
  chineseName: string;
  featureChineseName?: string;
  /** 页面类型，缺省按 list（表格型）处理，保证向后兼容 */
  featureType?: FeatureType;
  /** 外部可指定路由名；不指定时保持历史兼容，用 featurePascal */
  featureRouteName?: string;
}): TemplateData => {
  const { domainName, featureName, chineseName, featureChineseName } = config;
  // featureType 归一化：未显式传入时默认表格型（与历史行为一致）
  const featureType: FeatureType = config.featureType ?? "list";
  // 派生 PascalCase 后缀，模板据此拼接文件名 / 组件名
  const typeSuffix: "List" | "Overview" =
    featureType === "overview" ? "Overview" : "List";

  const domainKebab = toKebabCase(domainName);
  const domainPascal = toPascalCase(domainName);
  const domainCamel = toCamelCase(domainName);

  const featureKebab = featureName ? toKebabCase(featureName) : domainKebab;
  const featurePascal = featureName ? toPascalCase(featureName) : domainPascal;
  const featureCamel = featureName ? toCamelCase(featureName) : domainCamel;
  const featureRouteName = config.featureRouteName ?? featurePascal;

  return {
    domainName,
    domainKebab,
    domainPascal,
    domainCamel,
    featureName: featureName || domainName,
    featureKebab,
    featurePascal,
    featureCamel,
    featureRouteName,
    pageComponentName: `${featureRouteName}${typeSuffix}Page`,
    chineseName,
    featureChineseName: featureChineseName || chineseName,
    featureType,
    typeSuffix,
  };
};
