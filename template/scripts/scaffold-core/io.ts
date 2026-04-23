/**
 * IO 与文件系统操作库
 */
import fs from "fs/promises";
import readline from "readline";

// ============ Readline Interface ============

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const closeRl = () => {
  rl.close();
};

export const question = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

export const questionWithValidation = async (
  query: string,
  validator: (input: string) => { valid: boolean; error?: string }
): Promise<string> => {
  while (true) {
    const answer = await question(query);
    const result = validator(answer.trim());

    if (result.valid) {
      return answer.trim();
    }

    console.log(`❌ ${result.error}`);
    console.log("");
  }
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
  try {
    await fs.mkdir(dir, { recursive: true });
    console.log(`✅ 创建目录: ${dir}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`创建目录失败 ${dir}: ${errorMessage}`);
  }
};

export const createFile = async (filePath: string, content: string) => {
  try {
    await fs.writeFile(filePath, content, "utf-8");
    console.log(`✅ 创建文件: ${filePath}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`创建文件失败 ${filePath}: ${errorMessage}`);
  }
};

export const removeDirectory = async (dir: string) => {
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
  return fs.writeFile(filePath, content, "utf-8");
};

export const readdir = async (dir: string, options?: any) => {
  return fs.readdir(dir, options);
};
