#!/usr/bin/env node
/**
 * 独立 CLI 入口
 * 可以通过 npx 或 pnpm 执行
 */

import { runCli } from './plugins/vite-plugin-route-names/cli.js';

const args = process.argv.slice(2);
const exitCode = await runCli(args);
process.exit(exitCode);
