/**
 * 菜单管理模块
 */
import path from "path";
import { question, readFile, writeFile } from "./io";

export interface MenuOption {
  index: number;
  label: string;
}

/**
 * 从 menu.config.ts 提取现有菜单项
 */
export const listMenuOptions = async (): Promise<MenuOption[]> => {
  const configPath = path.join(
    process.cwd(),
    "src/modules/app/config/menu.config.ts"
  );

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
  const answer = await question(
    `请选择父级菜单 (0-${maxIndex}): `
  );
  const choice = parseInt(answer.trim());

  if (isNaN(choice) || choice < 0 || choice > maxIndex) {
    console.log("❌ 无效的选择，将作为根级菜单");
    return null;
  }

  if (choice === 0) return null;

  return options.find((opt) => opt.index === choice)?.label ?? null;
};

/**
 * 更新 menu.config.ts，添加新菜单项
 */
export const updateMenuConfig = async (
  label: string,
  routeName: string,
  parentLabel: string | null
): Promise<void> => {
  const configPath = path.join(
    process.cwd(),
    "src/modules/app/config/menu.config.ts"
  );

  try {
    let content = await readFile(configPath);

    const newMenuItem = `  {\n    label: '${label}',\n    code: '${routeName}',\n    routeName: '${routeName}',\n  }`;

    if (parentLabel === null) {
      // 根级：找到数组末尾 ];
      const arrayCloseIndex = content.lastIndexOf("];");
      if (arrayCloseIndex === -1) {
        console.warn("⚠️  无法解析 menu.config.ts 结构");
        return;
      }

      const beforeClose = content.slice(0, arrayCloseIndex).trimEnd();
      const lastChar = beforeClose.slice(-1);
      const separator =
        lastChar === "," || lastChar === "[" ? "\n" : ",\n";

      content =
        beforeClose + separator + newMenuItem + ",\n" + content.slice(arrayCloseIndex);
    } else {
      // 子级：找到父菜单项
      const parentRegex = new RegExp(
        `(label:\\s*['"]${escapeRegex(parentLabel)}['"][\\s\\S]*?{[^}]*})`,
        "g"
      );
      const parentMatch = parentRegex.exec(content);

      if (!parentMatch) {
        console.warn(`⚠️  未找到父菜单: ${parentLabel}，将作为根级菜单`);
        return updateMenuConfig(label, routeName, null);
      }

      // 检查是否已有 children
      const parentBlock = parentMatch[1];
      if (parentBlock.includes("children:")) {
        // 已有 children 数组，在其末尾追加
        const childrenCloseIndex = content.indexOf(
          "]",
          content.indexOf("children:", parentMatch.index!)
        );
        if (childrenCloseIndex === -1) {
          console.warn("⚠️  无法解析 children 数组");
          return;
        }

        const beforeChildrenClose = content
          .slice(0, childrenCloseIndex)
          .trimEnd();
        const lastChar = beforeChildrenClose.slice(-1);
        const separator =
          lastChar === "," || lastChar === "[" ? "\n" : ",\n";

        content =
          beforeChildrenClose +
          separator +
          newMenuItem +
          "\n" +
          content.slice(childrenCloseIndex);
      } else {
        // 没有 children，在父菜单项的 } 前插入 children 数组
        const parentEndIndex =
          parentMatch.index! + parentMatch[1].length;
        const insertPos = content.lastIndexOf("}", parentEndIndex);

        const childBlock = `,\n    children: [\n${newMenuItem},\n    ]`;
        content =
          content.slice(0, insertPos) +
          childBlock +
          content.slice(insertPos);
      }
    }

    await writeFile(configPath, content);
    console.log(`✅ 已更新菜单配置: ${configPath}`);
  } catch (error) {
    console.warn(
      `⚠️  更新菜单配置失败: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * 更新 mock/handlers/auth.ts 的 MOCK_MENUS
 */
export const updateMockMenus = async (
  routeName: string,
  name: string
): Promise<void> => {
  const mockPath = path.join(
    process.cwd(),
    "src/mock/handlers/auth.ts"
  );

  try {
    let content = await readFile(mockPath);

    // 找到 MOCK_MENUS 数组的 ];
    const menusStart = content.indexOf("MOCK_MENUS");
    if (menusStart === -1) {
      console.warn("⚠️  未找到 MOCK_MENUS，跳过 mock 权限更新");
      return;
    }

    const arrayCloseIndex = content.indexOf("];", menusStart);
    if (arrayCloseIndex === -1) {
      console.warn("⚠️  无法解析 MOCK_MENUS 数组");
      return;
    }

    const newEntry = `  { code: '${routeName}', name: '${name}' },`;

    const beforeClose = content.slice(0, arrayCloseIndex).trimEnd();
    const lastChar = beforeClose.slice(-1);
    const separator =
      lastChar === "," || lastChar === "[" ? "\n" : ",\n";

    content =
      beforeClose + separator + newEntry + "\n" + content.slice(arrayCloseIndex);

    await writeFile(mockPath, content);
    console.log(`✅ 已更新 mock 权限: ${mockPath}`);
  } catch (error) {
    console.warn(
      `⚠️  更新 mock 权限失败: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
