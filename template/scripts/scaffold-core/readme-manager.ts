/**
 * README 管理模块
 */
import path from "path";
import { renderTemplate } from "./template";
import { getFeatureInfoFromRoutes } from "./route-manager";
import { toPascalCase } from "./utils";
import { writeFile } from "./io";
import { PROJECT_PATHS } from "./constants";

/**
 * 更新 Domain README
 */
export const updateDomainReadme = async (
  domainKebab: string,
  domainChineseName: string,
  rootDir: string = process.cwd()
) => {
  const readmePath = path.join(
    rootDir,
    PROJECT_PATHS.pagesDir,
    domainKebab,
    "README.md"
  );
  const domainPascal = toPascalCase(domainKebab);

  try {
    const features = await getFeatureInfoFromRoutes(domainKebab, rootDir);

    const templateData = {
      domainKebab,
      domainPascal,
      chineseName: domainChineseName,
      features,
    };

    const content = await renderTemplate("domain/readme.md.hbs", templateData);
    await writeFile(readmePath, content);
    console.log(`✅ 已更新 Domain README: ${readmePath}`);
  } catch (error) {
    console.warn(
      `⚠️  更新 README 失败: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};
