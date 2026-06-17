/**
 * IO 与文件系统操作库
 */
import fs from "fs/promises";
import readline from "readline";

// ============ Dry-Run 模式 ============

/** dry-run 开关：开启后所有写操作只打印意图，不真正落盘 */
let DRY_RUN = false;

export const setDryRun = (value: boolean): void => {
  DRY_RUN = value;
};

export const isDryRun = (): boolean => DRY_RUN;

// ============ Readline Interface ============

// readline 惰性创建：非交互模式（无 question 调用）不创建 interface，
// 避免打开的 readline 阻止进程自然退出（测试 / CI 场景尤其重要）。
let rl: readline.Interface | null = null;

const getRl = (): readline.Interface => {
  if (!rl) {
    rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  }
  return rl;
};

export const closeRl = () => {
  if (rl) {
    rl.close();
    rl = null;
  }
};

export const question = (query: string): Promise<string> => {
  return new Promise((resolve) => getRl().question(query, resolve));
};

export const questionWithValidation = async (
  query: string,
  validator: (input: string) => { valid: boolean; error?: string },
  maxAttempts = 10
): Promise<string> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const answer = await question(query);
    const result = validator(answer.trim());

    if (result.valid) {
      return answer.trim();
    }

    console.log(`❌ ${result.error}`);
    console.log("");
  }
  throw new Error(`连续 ${maxAttempts} 次输入无效，操作已取消`);
};

// ============ File System Ops ============

export const checkDirectoryExists = async (dir: string): Promise<boolean> => {
  try {
    const stat = await fs.stat(dir);
    return stat.isDirectory();
  } catch {
    return false;
  }
};

export const confirmOverwrite = async (path: string): Promise<boolean> => {
  console.log(`⚠️  目录已存在: ${path}`);
  const answer = await question(
    "是否覆盖现有文件？这将删除该目录下的所有内容！(yes/no): "
  );
  return answer.toLowerCase() === "yes";
};

export const createDirectory = async (dir: string) => {
  if (DRY_RUN) {
    console.log(`📁 [dry-run] 将创建目录: ${dir}`);
    return;
  }
  try {
    await fs.mkdir(dir, { recursive: true });
    console.log(`✅ 创建目录: ${dir}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`创建目录失败 ${dir}: ${errorMessage}`);
  }
};

export const createFile = async (filePath: string, content: string) => {
  if (DRY_RUN) {
    console.log(`📝 [dry-run] 将创建文件: ${filePath}`);
    return;
  }
  try {
    await fs.writeFile(filePath, content, "utf-8");
    console.log(`✅ 创建文件: ${filePath}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`创建文件失败 ${filePath}: ${errorMessage}`);
  }
};

export const removeDirectory = async (dir: string) => {
  if (DRY_RUN) {
    console.log(`🗑️  [dry-run] 将删除目录: ${dir}`);
    return;
  }
  try {
    await fs.rm(dir, { recursive: true, force: true });
    console.log(`🗑️  已删除目录: ${dir}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`删除目录失败 ${dir}: ${errorMessage}`);
  }
};

export const readFile = async (filePath: string): Promise<string> => {
  return fs.readFile(filePath, "utf-8");
};

export const writeFile = async (filePath: string, content: string) => {
  if (DRY_RUN) {
    console.log(`📝 [dry-run] 将更新文件: ${filePath}`);
    return;
  }
  return fs.writeFile(filePath, content, "utf-8");
};

export const readdir = async (
  dir: string,
  options?: { withFileTypes?: boolean }
) => {
  return fs.readdir(dir, options);
};
