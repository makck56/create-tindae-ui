import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { lightTokens } from '../src/core/theme/tokens.ts';
import {
  assertThemeCssMatchesRawTokens,
  assertLightTokensMatchRawTokens,
  assertValidRawTailwindTokens,
} from './theme-token-contract.mjs';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rawTokensPath = resolve(projectRoot, 'theme.tokens.json');
const adaptedTokensPath = resolve(projectRoot, 'src', 'assets', 'styles', 'theme.tailwind.css');

if (!existsSync(rawTokensPath)) {
  throw new Error('缺少 theme.tokens.json，请先执行 pnpm run tokens:export');
}

if (!existsSync(adaptedTokensPath)) {
  throw new Error('缺少 src/assets/styles/theme.tailwind.css，请先执行 pnpm run tokens:export');
}

const rawTokens = JSON.parse(readFileSync(rawTokensPath, 'utf8'));
assertValidRawTailwindTokens(rawTokens);
assertLightTokensMatchRawTokens(rawTokens, lightTokens);

const currentAdapted = readFileSync(adaptedTokensPath, 'utf8');
assertThemeCssMatchesRawTokens(rawTokens, currentAdapted);
