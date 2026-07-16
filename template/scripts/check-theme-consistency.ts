import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { lightTokens } from '../src/core/theme/tokens.ts';
import {
  assertLightTokensMatchRawTokens,
  assertValidRawTailwindTokens,
  buildProjectTailwindTheme,
  stringifyJson,
} from './theme-token-contract.mjs';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rawTokensPath = resolve(projectRoot, 'theme.tokens.json');
const adaptedTokensPath = resolve(projectRoot, 'theme.tailwind.json');

if (!existsSync(rawTokensPath)) {
  throw new Error('缺少 theme.tokens.json，请先执行 pnpm run tokens:export');
}

if (!existsSync(adaptedTokensPath)) {
  throw new Error('缺少 theme.tailwind.json，请先执行 pnpm run tokens:export');
}

const rawTokens = JSON.parse(readFileSync(rawTokensPath, 'utf8'));
assertValidRawTailwindTokens(rawTokens);
assertLightTokensMatchRawTokens(rawTokens, lightTokens);

const expectedAdapted = stringifyJson(buildProjectTailwindTheme(rawTokens));
const currentAdapted = readFileSync(adaptedTokensPath, 'utf8');

if (currentAdapted !== expectedAdapted) {
  throw new Error('theme.tailwind.json 与 theme.tokens.json 不一致，请重新执行 pnpm run tokens:export');
}
