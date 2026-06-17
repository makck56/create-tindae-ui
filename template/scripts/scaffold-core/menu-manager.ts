/**
 * 菜单管理模块
 */
import path from "path";
import { readFile, writeFile } from "./io";
import type { PatchResult } from "./types";
import { PROJECT_PATHS } from "./constants";
import {
  applyRootMenuPatch,
  applyMockMenuPatch,
  injectChildMenu,
  rebuildDomainMenu,
  type ParsedRoute,
} from "./patch";

/**
 * 更新 menu.config.ts，添加新菜单项。
 *
 * - 根级：复用 patch.applyRootMenuPatch（锚点注入）。
 * - 子级：复用 patch.injectChildMenu（括号深度匹配父对象）。
 *
 * 幂等；rootDir 可注入便于集成测试。返回 PatchResult 供事务回滚。
 */
export const updateMenuConfig = async (
  label: string,
  routeName: string,
  parentLabel: string | null,
  rootDir: string = process.cwd()
): Promise<PatchResult> => {
  const configPath = path.join(rootDir, PROJECT_PATHS.menuConfig);

  try {
    const originalContent = await readFile(configPath);
    let nextContent: string;

    if (parentLabel === null) {
      const outcome = applyRootMenuPatch(originalContent, label, routeName);
      if (!outcome.ok) {
        console.warn(`⚠️  更新菜单配置失败: ${outcome.reason}`);
        return { ok: false, changed: false, reason: outcome.reason };
      }
      if (!outcome.changed) {
        console.log(`⚠️  ${outcome.reason}，跳过更新`);
        return { ok: true, changed: false, reason: outcome.reason };
      }
      nextContent = outcome.content!;
    } else {
      const injected = injectChildMenu(originalContent, parentLabel, label, routeName);
      if (injected === null) {
        console.warn(`⚠️  未找到父菜单「${parentLabel}」或解析失败，将作为根级菜单`);
        return updateMenuConfig(label, routeName, null, rootDir);
      }
      nextContent = injected;
    }

    await writeFile(configPath, nextContent);
    console.log(`✅ 已更新菜单配置: ${configPath}`);
    return { ok: true, changed: true, originalContent, filePath: configPath };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`⚠️  更新菜单配置失败: ${reason}`);
    return { ok: false, changed: false, reason };
  }
};

/**
 * 更新 mock/handlers/auth.ts 的 MOCK_MENUS。
 *
 * 复用 patch.applyMockMenuPatch（锚点注入，不依赖分号）。
 * 幂等；rootDir 可注入。返回 PatchResult 供事务回滚。
 */
export const updateMockMenus = async (
  routeName: string,
  name: string,
  rootDir: string = process.cwd()
): Promise<PatchResult> => {
  const mockPath = path.join(rootDir, PROJECT_PATHS.mockAuth);

  try {
    const originalContent = await readFile(mockPath);
    const outcome = applyMockMenuPatch(originalContent, routeName, name);

    if (!outcome.ok) {
      console.warn(`⚠️  更新 mock 权限失败: ${outcome.reason}`);
      return { ok: false, changed: false, reason: outcome.reason };
    }
    if (!outcome.changed) {
      console.log(`⚠️  ${outcome.reason}，跳过更新`);
      return { ok: true, changed: false, reason: outcome.reason };
    }

    await writeFile(mockPath, outcome.content!);
    console.log(`✅ 已更新 mock 权限: ${mockPath}`);
    return { ok: true, changed: true, originalContent, filePath: mockPath };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`⚠️  更新 mock 权限失败: ${reason}`);
    return { ok: false, changed: false, reason };
  }
};

/**
 * 以该域的全部路由，重建 menu.config.ts 中的域菜单项。
 *
 * - 1 条路由 → 叶子菜单；多条 → 父级 + 全部子项（含默认特性，避免「过滤掉第一个」）。
 * - 以 routes.ts 为单一真相源，幂等；rootDir 可注入便于集成测试。
 *
 * 重建逻辑（纯函数）见 patch.rebuildDomainMenu。返回 PatchResult 供事务回滚。
 */
export const rebuildDomainMenuConfig = async (
  domainRouteName: string,
  routes: ParsedRoute[],
  rootDir: string = process.cwd()
): Promise<PatchResult> => {
  const configPath = path.join(rootDir, PROJECT_PATHS.menuConfig);

  try {
    const originalContent = await readFile(configPath);
    const outcome = rebuildDomainMenu(originalContent, domainRouteName, routes);

    if (!outcome.ok) {
      console.warn(`⚠️  重建域菜单失败: ${outcome.reason}`);
      return { ok: false, changed: false, reason: outcome.reason };
    }
    if (!outcome.changed) {
      console.log(`⚠️  ${outcome.reason}，跳过更新`);
      return { ok: true, changed: false, reason: outcome.reason };
    }

    await writeFile(configPath, outcome.content!);
    console.log(`✅ 已重建域菜单: ${configPath}`);
    return { ok: true, changed: true, originalContent, filePath: configPath };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`⚠️  重建域菜单失败: ${reason}`);
    return { ok: false, changed: false, reason };
  }
};
