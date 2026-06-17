/**
 * 前置环境校验：确保脚手架在正确的项目根目录运行，
 * 避免在错误目录下乱建文件 / 改坏无关配置。
 */
import path from "path";
import { existsSync } from "fs";
import { PROJECT_PATHS } from "./constants";

/**
 * 校验 rootDir 是有效的 tindae-ui 项目根。
 * @returns 错误信息数组；空数组表示通过。
 */
export const validateProjectRoot = (rootDir: string = process.cwd()): string[] => {
  const errors: string[] = [];

  if (!existsSync(path.join(rootDir, "package.json"))) {
    errors.push("当前目录缺少 package.json，请在项目根目录运行脚手架");
  }

  if (!existsSync(path.join(rootDir, PROJECT_PATHS.pagesDir))) {
    errors.push(
      `当前目录缺少 ${PROJECT_PATHS.pagesDir}/，请确认是 tindae-ui 项目根目录`
    );
  }

  return errors;
};

/**
 * 断言当前目录是项目根；不通过则打印错误并退出进程。
 */
export const assertProjectRoot = (rootDir: string = process.cwd()): void => {
  const errors = validateProjectRoot(rootDir);
  if (errors.length > 0) {
    console.error("❌ 环境校验失败：");
    errors.forEach((e) => console.error(`   - ${e}`));
    process.exit(1);
  }
};
