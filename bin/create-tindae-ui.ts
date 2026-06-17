#!/usr/bin/env node
import { parseArgs } from '../src/cli.js';
import { scaffold } from '../src/generator.js';

async function main() {
  try {
    const { projectName, targetDir, packageManager, skipInstall, skipGit } = await parseArgs(process.argv);
    scaffold(targetDir, projectName, { packageManager, skipInstall, skipGit });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\n❌ ${message}\n`);
    process.exit(1);
  }
}

main();
