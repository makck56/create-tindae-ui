#!/usr/bin/env node
/**
 * 前端架构脚手架工具 - Domain & Feature 快速生成器
 *
 * 使用方式:
 *   pnpm scaffold:domain
 *   pnpm scaffold:feature
 *
 * 非交互参数（可选，便于脚本化 / CI）:
 *   scaffold:domain  --name=<kebab> --chinese=<名> [--feature=<名>] [--no-menu] [--dry-run]
 *   scaffold:feature --domain=<域|序号> --name=<kebab> --chinese=<名> [--type=list|overview] [--no-page] [--no-menu] [--dry-run]
 */
import { closeRl, setDryRun } from "./scaffold-core/io";
import { parseDomainArgs, parseFeatureArgs } from "./scaffold-core/args";
import { scaffoldDomain, scaffoldFeature } from "./scaffold-core/actions";

const printHelp = () => {
  console.log("\n请选择操作:\n");
  console.log("  pnpm scaffold:domain   - 创建新的业务域");
  console.log("  pnpm scaffold:feature  - 在现有域下创建新特性\n");
  console.log("非交互参数（可选，便于脚本化 / CI）:");
  console.log("  scaffold:domain  --name=<kebab> --chinese=<名> [--feature=<名>] [--no-menu] [--dry-run]");
  console.log("  scaffold:feature --domain=<域|序号> --name=<kebab> --chinese=<名> [--type=list|overview] [--no-page] [--no-menu] [--dry-run]\n");
  console.log("  --dry-run  预览将创建 / 修改的文件，不落盘\n");
};

const main = async () => {
  console.log("╔════════════════════════════════════════╗");
  console.log("║   前端架构脚手架工具 v1.0            ║");
  console.log("╚════════════════════════════════════════╝");

  const argv = process.argv.slice(2);
  const mode = argv[0];

  if (mode === "domain") {
    const args = parseDomainArgs(argv);
    if (args.dryRun) setDryRun(true);
    await scaffoldDomain(args);
  } else if (mode === "feature") {
    const args = parseFeatureArgs(argv);
    if (args.dryRun) setDryRun(true);
    await scaffoldFeature(args);
  } else {
    printHelp();
  }

  closeRl();
  process.exit(0);
};

main();
