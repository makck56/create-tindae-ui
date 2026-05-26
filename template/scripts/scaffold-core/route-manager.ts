/**
 * 路由管理模块
 */
import path from "path";
import {
  checkDirectoryExists,
  readFile,
  readdir,
  writeFile,
} from "./io";

/**
 * 自动更新路由配置（扁平路由格式）
 */
export const updateRoutes = async (
  domainKebab: string,
  featureKebab: string,
  featurePascal: string,
  featureChineseName: string
) => {
  const routesPath = path.join(
    process.cwd(),
    "src/pages",
    domainKebab,
    `${domainKebab}.routes.ts`
  );

  try {
    let content = await readFile(routesPath);

    if (content.includes(`name: '${featurePascal}'`)) {
      console.log("⚠️  路由配置已存在，跳过更新");
      return;
    }

    const newRoute = `  {
    path: '/${featureKebab}',
    name: '${featurePascal}',
    component: () => import('./pages/${featurePascal}List.page.vue'),
    meta: { code: '${featurePascal}', title: '${featureChineseName}', keepAlive: true },
  },`;

    // 找到 RouteRecordRaw[] 数组的末尾 ];
    const arrayCloseIndex = content.lastIndexOf("];");
    if (arrayCloseIndex === -1) {
      console.warn("⚠️  无法找到路由数组末尾，请手动添加路由");
      return;
    }

    // 确保前面有逗号或换行
    const beforeClose = content.slice(0, arrayCloseIndex);
    const trimmed = beforeClose.trimEnd();
    const lastChar = trimmed.slice(-1);
    const separator = lastChar === "," || lastChar === "[" ? "\n" : ",\n";

    const newContent =
      trimmed + separator + newRoute + "\n" + content.slice(arrayCloseIndex);

    await writeFile(routesPath, newContent);
    console.log(`✅ 已更新路由配置: ${routesPath}`);
  } catch (error) {
    console.warn(
      `⚠️  更新路由失败: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * 从路由文件和文件系统中获取特性信息
 */
export const getFeatureInfoFromRoutes = async (
  domainKebab: string
): Promise<Array<{ kebabCase: string; chineseName: string }>> => {
  const domainPath = path.join(process.cwd(), "src/pages", domainKebab);
  const featuresPath = path.join(domainPath, "features");
  const routesPath = path.join(domainPath, `${domainKebab}.routes.ts`);

  const features: Array<{ kebabCase: string; chineseName: string }> = [];

  try {
    if (await checkDirectoryExists(featuresPath)) {
      const entries = (await readdir(featuresPath, {
        withFileTypes: true,
      })) as any[];
      const featureDirs = entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);

      let routesContent = "";
      try {
        routesContent = await readFile(routesPath);
      } catch {
        // 路由文件可能不存在
      }

      for (const featureDir of featureDirs) {
        let chineseName = featureDir;

        if (routesContent) {
          const regex = new RegExp(
            `path:\\s*['"]\\/${featureDir}['"][\\s\\S]*?title:\\s*['"]([^'"]+)['"]`
          );
          const match = routesContent.match(regex);

          if (match && match[1]) {
            chineseName = match[1];
          }
        }

        features.push({
          kebabCase: featureDir,
          chineseName,
        });
      }
    }
  } catch (error) {
    console.warn("⚠️  读取特性信息失败:", error);
  }

  return features;
};

/**
 * 获取 Domain 的中文名（从路由文件）
 */
export const getDomainChineseName = async (
  domainKebab: string,
  fallbackName: string
): Promise<string> => {
  try {
    const routesPath = path.join(
      process.cwd(),
      "src/pages",
      domainKebab,
      `${domainKebab}.routes.ts`
    );
    const routesContent = await readFile(routesPath);
    const match = routesContent.match(/title:\s*['"]([^'"`]+)['"]/);
    if (match && match[1]) {
      return match[1];
    }
  } catch {
    // ignore
  }
  return fallbackName;
};
