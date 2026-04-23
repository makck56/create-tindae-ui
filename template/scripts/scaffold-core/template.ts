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

export const loadTemplate = async (
  templatePath: string
): Promise<HandlebarsTemplateDelegate> => {
  const fullPath = path.join(TEMPLATES_DIR, templatePath);
  try {
    const templateContent = await fs.readFile(fullPath, "utf-8");
    return Handlebars.compile(templateContent);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`加载模板失败 ${templatePath}: ${errorMessage}`);
  }
};

export const renderTemplate = async (
  templatePath: string,
  data: Record<string, any>
): Promise<string> => {
  const template = await loadTemplate(templatePath);
  return template(data);
};

export const prepareTemplateData = (config: {
  domainName: string;
  featureName?: string;
  chineseName: string;
  featureChineseName?: string;
}) => {
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
