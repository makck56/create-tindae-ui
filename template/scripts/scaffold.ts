#!/usr/bin/env node
/**
 * 前端架构脚手架工具 - Domain & Feature 快速生成器
 * 使用方式: pnpm scaffold:domain 或 pnpm scaffold:feature
 */
import { closeRl } from "./scaffold-core/io";
import { scaffoldDomain, scaffoldFeature } from "./scaffold-core/actions";

const main = async () => {
  console.log("╔════════════════════════════════════════╗");
  console.log("║   前端架构脚手架工具 v1.0            ║");
  console.log("╚════════════════════════════════════════╝");

  const mode = process.argv[2];

  if (mode === "domain") {
    await scaffoldDomain();
  } else if (mode === "feature") {
    await scaffoldFeature();
  } else {
    console.log("\n请选择操作:\n");
    console.log("  pnpm scaffold:domain   - 创建新的业务域");
    console.log("  pnpm scaffold:feature  - 在现有域下创建新特性\n");
  }

  closeRl();
  process.exit(0);
};

main();