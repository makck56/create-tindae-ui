import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const tokensPath = resolve(process.cwd(), 'theme.tailwind.json');

function loadThemeTokens() {
  if (!existsSync(tokensPath)) {
    return {};
  }

  const raw = readFileSync(tokensPath, 'utf8');
  const parsed = JSON.parse(raw);

  return parsed.theme?.extend ?? {};
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: loadThemeTokens(),
  },
  plugins: [],
};
