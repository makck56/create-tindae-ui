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
import type { PatchResult } from "./types";
import { PROJECT_PATHS } from "./constants";
import { applyDomainRouterPatch, parseRoutes, type ParsedRoute } from "./patch";
import type { DirEntry } from "./utils";

/**
 * 自动更新路由配置（扁平路由格式）—— 往 domain.routes.ts 追加 feature 路由。
 *
 * 注意：feature 路由 path 为 `/<featureKebab>`（无 domain 前缀），name 使用 `featureRouteName`。
 * Vue Router 要求 name 全局唯一，因此新增 feature 默认由 actions.ts 传入「域名 + 特性名」的安全名称。
 *
 * `typeSuffix`（List / Overview）决定 component 懒加载的 page 文件名，
 * 与脚手架按类型生成的 `${featurePascal}${typeSuffix}.page.vue` 对齐。默认 List 兼容历史调用。
 */
export const updateRoutes = async (
  domainKebab: string,
  featureKebab: string,
  featurePascal: string,
  featureRouteName: string,
  featureChineseName: string,
  typeSuffix: "List" | "Overview" = "List",
  rootDir: string = process.cwd()
) => {
  const routesPath = path.join(
    rootDir,
    PROJECT_PATHS.pagesDir,
    domainKebab,
    `${domainKebab}.routes.ts`
  );

  try {
    const content = await readFile(routesPath);

    if (content.includes(`name: '${featureRouteName}'`)) {
      console.log("⚠️  路由配置已存在，跳过更新");
      return;
    }

    const newRoute = `  {
    path: '/${featureKebab}',
    name: '${featureRouteName}',
    component: () => import('./pages/${featurePascal}${typeSuffix}.page.vue'),
    meta: { code: '${featureRouteName}', title: '${featureChineseName}', keepAlive: true },
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
  domainKebab: string,
  rootDir: string = process.cwd()
): Promise<Array<{ kebabCase: string; chineseName: string }>> => {
  const domainPath = path.join(rootDir, PROJECT_PATHS.pagesDir, domainKebab);
  const featuresPath = path.join(domainPath, "features");
  const routesPath = path.join(domainPath, `${domainKebab}.routes.ts`);

  const features: Array<{ kebabCase: string; chineseName: string }> = [];

  try {
    if (await checkDirectoryExists(featuresPath)) {
      const entries = (await readdir(featuresPath, {
        withFileTypes: true,
      })) as DirEntry[];
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
  fallbackName: string,
  rootDir: string = process.cwd()
): Promise<string> => {
  try {
    const routesPath = path.join(
      rootDir,
      PROJECT_PATHS.pagesDir,
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

/**
 * 把新域的路由集合注册到根路由（src/core/bootstrap/router.ts）。
 *
 * 核心注入逻辑见 patch.ts 的 applyDomainRouterPatch（纯函数，可单测）。
 * 幂等；返回 PatchResult 供事务回滚。
 */
export const registerDomainToRootRouter = async (
  domainCamel: string,
  domainKebab: string,
  rootDir: string = process.cwd()
): Promise<PatchResult> => {
  const routerPath = path.join(rootDir, PROJECT_PATHS.router);

  try {
    const originalContent = await readFile(routerPath);
    const outcome = applyDomainRouterPatch(originalContent, domainCamel, domainKebab);

    if (!outcome.ok) {
      console.warn(`⚠️  接入根路由失败: ${outcome.reason}`);
      return { ok: false, changed: false, reason: outcome.reason };
    }

    if (!outcome.changed) {
      console.log(`⚠️  ${outcome.reason}，跳过接入`);
      return { ok: true, changed: false, reason: outcome.reason };
    }

    await writeFile(routerPath, outcome.content!);
    console.log(`✅ 已接入根路由: ${routerPath}`);
    return { ok: true, changed: true, originalContent, filePath: routerPath };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`⚠️  接入根路由失败: ${reason}`);
    return { ok: false, changed: false, reason };
  }
};

/**
 * 读取某域 routes.ts 的全部路由（name + 中文标题）。
 *
 * 供「以 routes.ts 为单一真相源」重建域菜单使用：1 条路由→叶子，多条→父级+全部子项。
 * 解析逻辑（纯函数）见 patch.parseRoutes。文件不存在 / 解析失败返回空数组。
 */
export const readDomainRoutes = async (
  domainKebab: string,
  rootDir: string = process.cwd()
): Promise<ParsedRoute[]> => {
  const routesPath = path.join(
    rootDir,
    PROJECT_PATHS.pagesDir,
    domainKebab,
    `${domainKebab}.routes.ts`
  );
  try {
    const content = await readFile(routesPath);
    return parseRoutes(content);
  } catch {
    return [];
  }
};
