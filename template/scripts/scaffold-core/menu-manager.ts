/**
 * 菜单管理模块
 */
import path from "path";
import { question, readFile, writeFile } from "./io";
import type { PatchResult } from "./types";
import { PROJECT_PATHS } from "./constants";
import {
  applyRootMenuPatch,
  applyMockMenuPatch,
  injectChildMenu,
} from "./patch";

export interface MenuOption {
  index: number;
  label: string;
}

/**
 * 从 menu.config.ts 提取现有菜单项
 */
export const listMenuOptions = async (
  rootDir: string = process.cwd()
): Promise<MenuOption[]> => {
  const configPath = path.join(rootDir, PROJECT_PATHS.menuConfig);

  try {
    const content = await readFile(configPath);
    const labels: string[] = [];
    const regex = /label:\s*['"]([^'"]+)['"]/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      labels.push(match[1]);
    }

    return labels.map((label, i) => ({ index: i + 1, label }));
  } catch {
    return [];
  }
};

/**
 * 交互式询问菜单父级选择
 * 返回 null 表示根级，否则返回父菜单的 label
 */
export const askMenuParent = async (
  options: MenuOption[]
): Promise<string | null> => {
  console.log("\n  0. 作为根级菜单");
  options.forEach((opt) => {
    console.log(`  ${opt.index}. ${opt.label}`);
  });

  const maxIndex = options.length;
  const answer = await question(`请选择父级菜单 (0-${maxIndex}): `);
  const choice = parseInt(answer.trim());

  if (isNaN(choice) || choice < 0 || choice > maxIndex) {
    console.log("❌ 无效的选择，将作为根级菜单");
    return null;
  }

  if (choice === 0) return null;

  return options.find((opt) => opt.index === choice)?.label ?? null;
};

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
