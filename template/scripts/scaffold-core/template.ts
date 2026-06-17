/**
 * 模板渲染引擎
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import { toCamelCase, toKebabCase, toPascalCase } from "./utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// 假设 templates 在 ../templates (相对于 scaffold-core)
const TEMPLATES_DIR = path.join(__dirname, "..", "templates");

/** 编译后的模板缓存：避免同一模板多次 readFile + compile */
const templateCache = new Map<string, HandlebarsTemplateDelegate>();

/** 注入到 .hbs 模板的变量集合 */
export interface TemplateData {
  domainName: string;
  domainKebab: string;
  domainPascal: string;
  domainCamel: string;
  featureName: string;
  featureKebab: string;
  featurePascal: string;
  featureCamel: string;
  chineseName: string;
  featureChineseName: string;
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
}): TemplateData => {
  const { domainName, featureName, chineseName, featureChineseName } = config;

  const domainKebab = toKebabCase(domainName);
  const domainPascal = toPascalCase(domainName);
  const domainCamel = toCamelCase(domainName);

  const featureKebab = featureName ? toKebabCase(featureName) : domainKebab;
  const featurePascal = featureName ? toPascalCase(featureName) : domainPascal;
  const featureCamel = featureName ? toCamelCase(featureName) : domainCamel;

  return {
    domainName,
    domainKebab,
    domainPascal,
    domainCamel,
    featureName: featureName || domainName,
    featureKebab,
    featurePascal,
    featureCamel,
    chineseName,
    featureChineseName: featureChineseName || chineseName,
  };
};
