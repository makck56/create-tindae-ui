/**
 * 纯函数 patch 逻辑：对配置文件「内容字符串」做注入 / 修改，不碰任何 IO。
 *
 * 抽成纯函数有两个好处：
 *   1. 便于单测——这几轮暴露的 bug（import 方向、mock 解析、子级注入）全是纯逻辑错误；
 *   2. 让 registerDomainToRootRouter / updateMenuConfig 等 IO 函数变薄，只负责读写。
 */
import {
  DOMAIN_IMPORT_ANCHOR,
  DOMAIN_ROUTE_ANCHOR,
  MENU_ROOT_ANCHOR,
  MOCK_MENU_ANCHOR,
} from "./constants";

/** patch 结果：changed=false 表示无需写盘（幂等跳过 或 失败） */
export interface PatchOutcome {
  ok: boolean;
  changed: boolean;
  reason?: string;
  /** 改后的完整内容；changed=true 时必有 */
  content?: string;
}

/** 转义正则元字符 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 把新域路由注入根路由内容：import 加在 import 锚点【上方】，
 * `...xRoutes` 加在 route 锚点【上方】。两个锚点行均保持完整。
 * 幂等：若内容已含该域 import 名则跳过。
 */
export const applyDomainRouterPatch = (
  content: string,
  domainCamel: string,
  domainKebab: string
): PatchOutcome => {
  const importName = `${domainCamel}Routes`;

  if (content.includes(importName)) {
    return { ok: true, changed: false, reason: "根路由已包含该域" };
  }
  if (!content.includes(DOMAIN_IMPORT_ANCHOR)) {
    return { ok: false, changed: false, reason: "未找到 import 锚点，请确认 router.ts 未被手动改动" };
  }
  if (!content.includes(DOMAIN_ROUTE_ANCHOR)) {
    return { ok: false, changed: false, reason: "未找到 route 锚点，请确认 router.ts 未被手动改动" };
  }

  const importLine = `import { ${importName} } from '@/pages/${domainKebab}/${domainKebab}.routes';`;
  const routeLine = `      ...${importName},`;

  let next = content.replace(
    DOMAIN_IMPORT_ANCHOR,
    `${importLine}\n${DOMAIN_IMPORT_ANCHOR}`
  );
  next = next.replace(
    DOMAIN_ROUTE_ANCHOR,
    `${routeLine}\n${DOMAIN_ROUTE_ANCHOR}`
  );

  return { ok: true, changed: true, content: next };
};

/**
 * 注入根级菜单项到 menu.config.ts 内容（锚点【上方】）。幂等。
 */
export const applyRootMenuPatch = (
  content: string,
  label: string,
  routeName: string
): PatchOutcome => {
  if (content.includes(`code: '${routeName}'`)) {
    return { ok: true, changed: false, reason: "菜单项已存在" };
  }
  if (!content.includes(MENU_ROOT_ANCHOR)) {
    return { ok: false, changed: false, reason: "未找到根级菜单锚点，请确认 menu.config.ts 未被手动改动" };
  }
  const newMenuItem = `  {\n    label: '${label}',\n    code: '${routeName}',\n    routeName: '${routeName}',\n  },`;
  const next = content.replace(
    MENU_ROOT_ANCHOR,
    `${newMenuItem}\n${MENU_ROOT_ANCHOR}`
  );
  return { ok: true, changed: true, content: next };
};

/**
 * 注入 mock 菜单项到 auth.ts 的 MOCK_MENUS（锚点【上方】，不依赖分号）。幂等。
 */
export const applyMockMenuPatch = (
  content: string,
  routeName: string,
  name: string
): PatchOutcome => {
  if (content.includes(`code: '${routeName}'`)) {
    return { ok: true, changed: false, reason: "mock 权限已存在" };
  }
  if (!content.includes(MOCK_MENU_ANCHOR)) {
    return { ok: false, changed: false, reason: "未找到 mock 菜单锚点，请确认 auth.ts 未被手动改动" };
  }
  const newEntry = `  { code: '${routeName}', name: '${name}' },`;
  const next = content.replace(
    MOCK_MENU_ANCHOR,
    `${newEntry}\n${MOCK_MENU_ANCHOR}`
  );
  return { ok: true, changed: true, content: next };
};

/**
 * 在指定父菜单对象下注入一个子菜单项（自动创建 children 数组）。
 *
 * 用括号深度精确匹配父对象 `{ ... }` 范围，缩进根据父对象首属性自适应。
 * 返回注入后的新内容；父菜单不存在或解析失败返回 null。
 */
export const injectChildMenu = (
  content: string,
  parentLabel: string,
  label: string,
  routeName: string
): string | null => {
  // 1) 定位父菜单的 label
  const labelMatch = new RegExp(
    `label:\\s*['"]${escapeRegex(parentLabel)}['"]`
  ).exec(content);
  if (!labelMatch) return null;

  // 2) 往前找父对象的开头 {
  const openIdx = content.lastIndexOf("{", labelMatch.index);
  if (openIdx === -1) return null;

  // 3) 从 openIdx 按括号深度找配对的 }
  let depth = 0;
  let closeIdx = -1;
  for (let i = openIdx; i < content.length; i++) {
    const ch = content[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        closeIdx = i;
        break;
      }
    }
  }
  if (closeIdx === -1) return null;

  // 4) 推断缩进：父对象首属性的缩进（{ 后换行 + 缩进 + 非空白字符）
  const indentMatch = content.slice(openIdx).match(/^\{\n([ \t]*)\S/);
  const propIndent = indentMatch ? indentMatch[1] : "    ";
  const childIndent = propIndent + "  ";

  // 5) 构造子菜单项
  const childItem =
    `${childIndent}{\n` +
    `${childIndent}  label: '${label}',\n` +
    `${childIndent}  code: '${routeName}',\n` +
    `${childIndent}  routeName: '${routeName}',\n` +
    `${childIndent}},`;

  const parentBlock = content.slice(openIdx, closeIdx + 1);

  // 6) 已有 children：在 children 数组闭合 ] 前插入
  if (parentBlock.includes("children:")) {
    const childrenKwIdx = content.indexOf("children:", openIdx);
    if (childrenKwIdx === -1 || childrenKwIdx > closeIdx) return null;
    const arrOpen = content.indexOf("[", childrenKwIdx);
    if (arrOpen === -1 || arrOpen > closeIdx) return null;

    let d = 0;
    let arrClose = -1;
    for (let i = arrOpen; i <= closeIdx; i++) {
      const ch = content[i];
      if (ch === "[") d++;
      else if (ch === "]") {
        d--;
        if (d === 0) {
          arrClose = i;
          break;
        }
      }
    }
    if (arrClose === -1) return null;

    const before = content.slice(0, arrClose).replace(/[ \t\n]+$/, "");
    const lastChar = before.slice(-1);
    const sep = lastChar === "[" || lastChar === "," ? "\n" : ",\n";
    return before + sep + childItem + "\n" + propIndent + content.slice(arrClose);
  }

  // 7) 无 children：在父对象闭合 } 前注入 children 数组
  const beforeClose = content.slice(0, closeIdx).replace(/[ \t]+$/, "");
  const lastChar = beforeClose.trim().slice(-1);
  const needComma = lastChar !== "{" && lastChar !== ",";
  const commaPrefix = needComma ? "," : "";

  return (
    beforeClose +
    commaPrefix +
    `${propIndent}children: [\n${childItem}\n${propIndent}],\n${propIndent}` +
    content.slice(closeIdx)
  );
};
