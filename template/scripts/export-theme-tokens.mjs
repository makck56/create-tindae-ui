import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assertValidRawTailwindTokens,
  buildProjectTailwindTheme,
  stringifyJson,
} from './theme-token-contract.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, '..');
const cliEntry = resolve(projectRoot, 'node_modules', '@google', 'design.md', 'dist', 'index.js');

const stdout = execFileSync(
  process.execPath,
  [cliEntry, 'export', '--format', 'json-tailwind', 'design.md'],
  {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  },
);

const rawTokens = JSON.parse(stdout);
assertValidRawTailwindTokens(rawTokens);

writeFileSync(resolve(projectRoot, 'theme.tokens.json'), stringifyJson(rawTokens), 'utf8');
writeFileSync(
  resolve(projectRoot, 'theme.tailwind.json'),
  stringifyJson(buildProjectTailwindTheme(rawTokens)),
  'utf8',
);
