/**
 * 字符串与校验工具库
 */

/** fs.readdir(withFileTypes) 返回的目录项结构（收敛 any 断言） */
export interface DirEntry {
  name: string;
  isDirectory: () => boolean;
}

export const toPascalCase = (str: string): string => {
  return str
    .split(/[-_\s]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
};

export const toCamelCase = (str: string): string => {
  // 按分隔符拆分：首词小写开头，其余词首字母大写。
  // 不复用 toPascalCase——它会对非首字母 toLowerCase，
  // 导致 PascalCase 输入（如 OrderManagement）丢失中间大写变成 ordermanagement。
  const parts = str.split(/[-_\s]/).filter(Boolean);
  return parts
    .map((word, i) => {
      const head = word.charAt(0);
      const rest = word.slice(1);
      return i === 0 ? head.toLowerCase() + rest : head.toUpperCase() + rest;
    })
    .join("");
};

export const toKebabCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
};

// ============ 验证器 ============ 

export const validateName = (
  name: string,
  type: "domain" | "feature"
): { valid: boolean; error?: string } => {
  if (!name || name.trim() === "") {
    return {
      valid: false,
      error: `${type === "domain" ? "域名" : "特性名"}不能为空`,
    };
  }

  const trimmedName = name.trim();

  if (trimmedName.length > 50) {
    return { valid: false, error: "名称过长（最多50个字符）" };
  }

  const kebabCaseRegex = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
  if (!kebabCaseRegex.test(trimmedName)) {
    return {
      valid: false,
      error:
        "格式错误：只允许小写字母、数字和中划线，且必须以字母开头，不能以中划线结尾（如: data-source）",
    };
  }

  const reservedWords = [
    "node_modules",
    "dist",
    "build",
    ".git",
    ".vscode",
    "src",
    "public",
    "assets",
    "components",
    "utils",
    "test",
    "tests",
    "__tests__",
    "coverage",
    "pages",
    "features",
    "shared",
  ];
  if (reservedWords.includes(trimmedName)) {
    return { valid: false, error: `"${trimmedName}" 是保留字，请使用其他名称` };
  }

  if (
    trimmedName.includes(".." ) ||
    trimmedName.includes("/") ||
    trimmedName.includes("\\")
  ) {
    return { valid: false, error: "名称包含非法字符（不允许 .. / \\）" };
  }

  return { valid: true };
};

export const validateChineseName = (
  name: string
): { valid: boolean; error?: string } => {
  if (!name || name.trim() === "") {
    return { valid: false, error: "中文名不能为空" };
  }

  const trimmedName = name.trim();

  if (trimmedName.length > 20) {
    return { valid: false, error: "中文名过长（最多20个字符）" };
  }

  if (/<|>|&|'|"|`/.test(trimmedName)) {
    return { valid: false, error: "中文名包含非法字符" };
  }

  return { valid: true };
};
