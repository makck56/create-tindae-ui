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
 * 自动更新路由配置
 */
export const updateRoutes = async (
  domainKebab: string,
  featureKebab: string,
  domainPascal: string,
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

    // 检查路由是否已存在
    if (content.includes(`name: '${domainPascal}${featurePascal}List'`)) {
      console.log("⚠️  路由配置已存在，跳过更新");
      return;
    }

    // 定义新路由配置
    const newRoute = `
      {
        path: '${featureKebab}/list',
        name: '${domainPascal}${featurePascal}List',
        component: () => import('./pages/${featurePascal}List.page.vue'),
        meta: {
          title: '${featureChineseName}列表',
          keepAlive: true,
        },
      },`;

    // 查找 children 数组的插入点
    const childrenMatch = content.match(/children:\s*\[/);

    if (childrenMatch && childrenMatch.index !== undefined) {
      const startIndex = childrenMatch.index + childrenMatch[0].length;

      let balance = 1;
      let insertIndex = -1;

      for (let i = startIndex; i < content.length; i++) {
        if (content[i] === "[") balance++;
        if (content[i] === "]") balance--;

        if (balance === 0) {
          insertIndex = i;
          break;
        }
      }

      if (insertIndex !== -1) {
        const beforeClose = content.slice(startIndex, insertIndex);
        const hasContent = beforeClose.trim().length > 0;
        const lastChar = beforeClose.trim().slice(-1);

        const prefix = hasContent && lastChar !== "," ? "," : "";

        const newContent =
          content.slice(0, insertIndex) +
          `${prefix}${newRoute}` +
          content.slice(insertIndex);

        await writeFile(routesPath, newContent);
        console.log(`✅ 已更新路由配置: ${routesPath}`);
      } else {
        console.warn(
          "⚠️  无法解析路由文件结构 (未找到闭合的 children 数组)，请手动添加路由"
        );
      }
    } else {
      console.warn("⚠️  无法找到 children 数组，请手动添加路由");
    }
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
    // 1. 获取所有 Feature 目录名
    if (await checkDirectoryExists(featuresPath)) {
      const entries = (await readdir(featuresPath, {
        withFileTypes: true,
      })) as any[]; // Type assertion for simple node fs compatibility
      const featureDirs = entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);

      // 2. 读取路由文件内容
      let routesContent = "";
      try {
        routesContent = await readFile(routesPath);
      } catch (e) {
        // 路由文件可能不存在
      }

      // 3. 遍历每个 Feature，尝试查找中文名
      for (const featureDir of featureDirs) {
        let chineseName = featureDir;

        if (routesContent) {
          const regex = new RegExp(
            `path:\\s*['"]${featureDir}\\/list['"][\\s\\S]*?title:\\s*['"]([^'"]+)['"]`
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
  } catch (e) {
    // ignore
  }
  return fallbackName;
};
