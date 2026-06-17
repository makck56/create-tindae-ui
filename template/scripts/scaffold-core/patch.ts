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
 * 按 routeName（菜单的 code/routeName 字段）定位其所属菜单对象的字符范围。
 *
 * 用括号深度精确匹配 `{ ... }`。供 findMenuLabelByRouteName / rebuildDomainMenu
 * 复用，避免重复实现「定位对象」逻辑。找不到返回 null。
 */
const locateMenuObject = (
  content: string,
  routeName: string
): { openIdx: number; closeIdx: number } | null => {
  const codeRegex = new RegExp(
    `(?:code|routeName):\\s*['"]${escapeRegex(routeName)}['"]`
  );
  const codeMatch = codeRegex.exec(content);
  if (!codeMatch) return null;

  const openIdx = content.lastIndexOf("{", codeMatch.index);
  if (openIdx === -1) return null;

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
  return { openIdx, closeIdx };
};

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

/**
 * 按 routeName（菜单的 code/routeName 字段）反查其所属菜单对象的 label。
 *
 * 用途：feature 脚手架定位域菜单；域菜单的 label 在创建时可能被自定义，
 * 故以稳定的 routeName 反查更可靠。找不到返回 null。
 */
export const findMenuLabelByRouteName = (
  content: string,
  routeName: string
): string | null => {
  const located = locateMenuObject(content, routeName);
  if (!located) return null;
  const block = content.slice(located.openIdx, located.closeIdx + 1);
  const labelMatch = /label:\s*['"]([^'"]+)['"]/.exec(block);
  return labelMatch ? labelMatch[1] : null;
};

// ============ 域菜单重建（以 routes.ts 为单一真相源） ============

/** routes.ts 中解析出的一条路由（name + 中文标题） */
export interface ParsedRoute {
  name: string;
  title: string;
}

/**
 * 从域 routes.ts 内容解析出全部路由的 { name, title }。
 *
 * 用于「以 routes.ts 为真相源」重建域菜单。name 来自 `name: 'X'`，
 * title 来自同对象内的 `meta.title`（找不到则回退为 name）。
 * 算法：以每个 `name:` 为锚点，取「当前 name 到下一个 name 之前」范围内的 title，
 * 保证 title 与 name 属同一路由对象。
 */
export const parseRoutes = (content: string): ParsedRoute[] => {
  const nameRegex = /name:\s*['"]([^'"]+)['"]/g;
  const positions: Array<{ name: string; index: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = nameRegex.exec(content)) !== null) {
    positions.push({ name: m[1], index: m.index });
  }

  return positions.map((pos, i) => {
    const end =
      i + 1 < positions.length ? positions[i + 1].index : content.length;
    const slice = content.slice(pos.index, end);
    const titleMatch = /title:\s*['"]([^'"]+)['"]/.exec(slice);
    return { name: pos.name, title: titleMatch ? titleMatch[1] : pos.name };
  });
};

/**
 * 构造域菜单项文本（rebuildDomainMenu 内部使用）。
 *
 * - ≤1 条路由：叶子菜单（点击直接进）。
 * - 多条路由：父级菜单（纯分组，无 routeName），children 含全部路由，
 *   第一项为默认特性，避免「过滤掉第一个」导致默认页入口丢失。
 *
 * 缩进：对象用 indent（数组项缩进），属性 indent+2，children 项 indent+4。
 */
const buildDomainMenuItem = (
  indent: string,
  label: string,
  routes: ParsedRoute[]
): string => {
  const propIndent = indent + "  ";
  const childIndent = indent + "    ";

  // 仅 1 条（或 0 条）：叶子
  if (routes.length <= 1) {
    const r = routes[0] ?? { name: label, title: label };
    return (
      `{\n` +
      `${propIndent}label: '${label}',\n` +
      `${propIndent}code: '${r.name}',\n` +
      `${propIndent}routeName: '${r.name}',\n` +
      `${indent}}`
    );
  }

  // 多条：父级 + children（每条路由一项，label = 其 title）
  const childrenLines = routes
    .map(
      (r) =>
        `${childIndent}{ label: '${r.title}', code: '${r.name}', routeName: '${r.name}' },`
    )
    .join("\n");

  return (
    `{\n` +
    `${propIndent}label: '${label}',\n` +
    `${propIndent}code: '${routes[0].name}',\n` +
    `${propIndent}children: [\n` +
    `${childrenLines}\n` +
    `${propIndent}],\n` +
    `${indent}}`
  );
};

/**
 * 以该域 routes.ts 的全部路由，重建 menu.config.ts 中的域菜单项。
 *
 * - 仅 1 条路由 → 叶子菜单（点击直接进）。
 * - 多条路由 → 父级菜单（纯分组，不保留 routeName），children 含全部路由，
 *   第一项为默认特性，避免「过滤掉第一个」导致默认页入口丢失。
 *
 * 父级 label 沿用原菜单项的 label（通常是域中文名）；children 各项 label 用其
 * routes.ts 的 meta.title。幂等：结构已正确时 changed=false，不重复写盘。
 */
export const rebuildDomainMenu = (
  content: string,
  domainRouteName: string,
  routes: ParsedRoute[]
): PatchOutcome => {
  const located = locateMenuObject(content, domainRouteName);
  if (!located) {
    return { ok: false, changed: false, reason: "未找到域菜单项，请确认创建域时已添加菜单" };
  }
  const { openIdx, closeIdx } = located;

  // 沿用原菜单项的 label（父级标题）
  const block = content.slice(openIdx, closeIdx + 1);
  const labelMatch = /label:\s*['"]([^'"]+)['"]/.exec(block);
  const label = labelMatch ? labelMatch[1] : domainRouteName;

  // 推断缩进：对象 { 所在行的前导空白
  const lineStart = content.lastIndexOf("\n", openIdx) + 1;
  const indent = content.slice(lineStart, openIdx);

  const newItem = buildDomainMenuItem(indent, label, routes);

  // 幂等：新结构若与原对象一致则跳过
  if (content.slice(openIdx, closeIdx + 1) === newItem) {
    return { ok: true, changed: false, reason: "域菜单结构已正确" };
  }

  const next = content.slice(0, openIdx) + newItem + content.slice(closeIdx + 1);
  return { ok: true, changed: true, content: next };
};
