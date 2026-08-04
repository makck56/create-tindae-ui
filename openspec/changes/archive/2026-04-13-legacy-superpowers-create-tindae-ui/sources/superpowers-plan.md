# create-tindae-ui Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a zero-option CLI scaffolding tool that generates a complete Vue 3 enterprise project with fixed tech stack.

**Architecture:** CLI package copies a pre-built `template/` directory to the target location, replaces the project name in `package.json`, then runs `pnpm install` + `git init`. The template is a fully functional Vue 3 project with DDD architecture, user-management demo domain, and all tooling pre-configured.

**Tech Stack:** TypeScript CLI (Node 16+), template uses Vue 3 + Vite 5 + ant-design-vue 3 + vxe-table 4 + echarts 5 + Tailwind CSS 3 + Vue Router 4 + Pinia 2 + ESLint 8 + Vitest

---

## File Map

### CLI Package Files

| File | Purpose |
|:---|:---|
| `package.json` | CLI package config, bin entry, build scripts |
| `tsconfig.json` | TypeScript config for CLI compilation |
| `bin/create-tindae-ui.ts` | Shebang entry point |
| `src/cli.ts` | Argument parsing, project name prompt, directory validation |
| `src/generator.ts` | Template copy, package.json rewrite, git init, pnpm install |
| `src/utils/fs.ts` | Recursive directory copy |
| `src/utils/pkg.ts` | Read/write package.json |

### Template Root Config Files

| File | Purpose |
|:---|:---|
| `template/package.json` | Template project dependencies |
| `template/vite.config.ts` | Vite config with @ alias |
| `template/tsconfig.json` | Template TS config (strict) |
| `template/tsconfig.node.json` | TS config for Node (vite config) |
| `template/env.d.ts` | Vue/env type declarations |
| `template/index.html` | HTML entry |
| `template/tailwind.config.js` | Tailwind with preflight disabled |
| `template/postcss.config.js` | PostCSS for Tailwind |
| `template/.eslintrc.cjs` | ESLint 8 config |
| `template/.prettierrc.json` | Prettier config |
| `template/vitest.config.ts` | Vitest config |
| `template/.gitignore` | Git ignore |

### Template src/ Files

| File | Purpose |
|:---|:---|
| `template/src/main.ts` | App entry, plugin registration |
| `template/src/App.vue` | Root component with ConfigProvider + RouterView |
| `template/src/core/plugins/antd.ts` | ant-design-vue registration |
| `template/src/core/plugins/echarts.ts` | echarts theme setup |
| `template/src/core/plugins/vxeTable.ts` | vxe-table config |
| `template/src/core/types/global.d.ts` | Global type augmentations |
| `template/src/assets/styles/tailwind.css` | Tailwind directives |
| `template/src/assets/styles/variables.css` | CSS variables / design tokens |
| `template/src/assets/styles/global.css` | Global styles |
| `template/src/shared/ui-kit/styles/.gitkeep` | UI kit styles placeholder |
| `template/src/shared/ui-kit/composables/.gitkeep` | UI kit composables placeholder |
| `template/src/shared/constants/copy.ts` | Copy constants |
| `template/src/shared/utils/.gitkeep` | Shared utils placeholder |
| `template/src/modules/.gitkeep` | Modules placeholder |
| `template/src/layouts/Default.layout.vue` | Default layout with sidebar |
| `template/src/router/index.ts` | Router setup, imports demo routes |
| `template/src/stores/app.ts` | App store (sidebar state) |
| `template/src/types/index.ts` | Global type exports |

### Template Demo Domain Files

| File | Purpose |
|:---|:---|
| `template/src/pages/user-management/features/user/models/User.ts` | User entity + DTO types |
| `template/src/pages/user-management/features/user/models/index.ts` | Re-export models |
| `template/src/pages/user-management/features/user/api/user.api.ts` | User API with axios |
| `template/src/pages/user-management/features/user/composables/useUser.ts` | User list/detail logic |
| `template/src/pages/user-management/features/user/composables/useUser.spec.ts` | Vitest example test |
| `template/src/pages/user-management/features/user/components/list/UserFilter.vue` | Filter component |
| `template/src/pages/user-management/features/user/views/UserList.view.vue` | User list view (vxe-table) |
| `template/src/pages/user-management/features/user/views/UserDetail.view.vue` | User detail view (antd Descriptions) |
| `template/src/pages/user-management/pages/UserList.page.vue` | Route shell for list |
| `template/src/pages/user-management/pages/UserDetail.page.vue` | Route shell for detail |
| `template/src/pages/user-management/userManagement.routes.ts` | Route definitions |
| `template/src/pages/user-management/shared/.gitkeep` | Domain shared placeholder |

### Template Docs

| File | Purpose |
|:---|:---|
| `template/docs/ARCHITECTURE.md` | Architecture whitepaper (from existing docs) |
| `template/docs/CODING_STANDARDS.md` | Coding standards (from existing docs) |
| `template/docs/MIGRATION.md` | Migration guide (from existing docs) |

---

### Task 1: Initialize CLI Package

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`

- [ ] **Step 1: Initialize package.json**

```bash
cd /home/code/create-tindae-ui
```

```json
{
  "name": "create-tindae-ui",
  "version": "1.0.0",
  "description": "Scaffold a Vue 3 enterprise project with tindae-ui architecture",
  "type": "module",
  "bin": {
    "create-tindae-ui": "./dist/bin/create-tindae-ui.js"
  },
  "files": [
    "dist",
    "template"
  ],
  "scripts": {
    "build": "tsc",
    "dev": "tsx bin/create-tindae-ui.ts",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "prompts": "^2.4.2"
  },
  "devDependencies": {
    "@types/node": "^18.19.0",
    "@types/prompts": "^2.4.9",
    "tsx": "^4.7.0",
    "typescript": "^5.4.0"
  },
  "engines": {
    "node": ">=16.7.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json for CLI**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": false,
    "resolveJsonModule": true
  },
  "include": ["bin/**/*", "src/**/*"],
  "exclude": ["template", "node_modules", "dist"]
}
```

- [ ] **Step 3: Create .gitignore**

```
node_modules
dist
*.tgz
```

- [ ] **Step 4: Install dependencies**

```bash
cd /home/code/create-tindae-ui && pnpm install
```

Expected: `pnpm install` completes with no errors.

- [ ] **Step 5: Init git repo and commit**

```bash
cd /home/code/create-tindae-ui && git init && git add -A && git commit -m "chore: initialize create-tindae-ui CLI package"
```

---

### Task 2: CLI Core Logic

**Files:**
- Create: `src/utils/fs.ts`
- Create: `src/utils/pkg.ts`
- Create: `src/cli.ts`
- Create: `src/generator.ts`
- Create: `bin/create-tindae-ui.ts`

- [ ] **Step 1: Create src/utils/fs.ts — recursive directory copy**

```typescript
import { cpSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Recursively copy a directory. Works on Node 16.7+.
 */
export function copyDir(src: string, dest: string): void {
  if (!existsSync(src)) {
    throw new Error(`Source directory does not exist: ${src}`);
  }
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true, filter: (srcPath) => {
    // Skip node_modules in template
    return !srcPath.includes('node_modules');
  }});
}
```

- [ ] **Step 2: Create src/utils/pkg.ts — package.json name replacement**

```typescript
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

interface PkgJson {
  name: string;
  [key: string]: unknown;
}

export function setProjectName(projectDir: string, name: string): void {
  const pkgPath = join(projectDir, 'package.json');
  const content = readFileSync(pkgPath, 'utf-8');
  const pkg: PkgJson = JSON.parse(content);
  pkg.name = name;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
}
```

- [ ] **Step 3: Create src/cli.ts — argument parsing + project name prompt**

```typescript
import prompts from 'prompts';
import { resolve } from 'node:path';
import { existsSync, readdirSync } from 'node:fs';

export interface CliArgs {
  projectName: string;
  targetDir: string;
}

export async function parseArgs(argv: string[]): Promise<CliArgs> {
  // argv[1] is the script path, first positional arg is project name
  const inputName = argv.find((a) => !a.startsWith('-') && a !== argv[0] && a !== argv[1]);

  let projectName = inputName;

  if (!projectName) {
    const response = await prompts({
      type: 'text',
      name: 'name',
      message: 'Project name:',
      initial: 'my-tindae-app',
      validate: (value: string) => {
        if (!value.trim()) return 'Project name cannot be empty';
        if (!/^[a-z0-9-]+$/.test(value.trim())) {
          return 'Project name must be lowercase letters, numbers, and hyphens only';
        }
        return true;
      },
    });
    projectName = response.name;
  }

  if (!projectName) {
    throw new Error('Project name is required');
  }

  projectName = projectName.trim();
  const targetDir = resolve(process.cwd(), projectName);

  // Check if directory exists and is non-empty
  if (existsSync(targetDir) && readdirSync(targetDir).length > 0) {
    const response = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: `Directory "${projectName}" already exists and is not empty. Overwrite?`,
      initial: false,
    });
    if (!response.overwrite) {
      throw new Error('Operation cancelled');
    }
  }

  return { projectName, targetDir };
}
```

- [ ] **Step 4: Create src/generator.ts — scaffold logic**

```typescript
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { copyDir } from './utils/fs.js';
import { setProjectName } from './utils/pkg.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function scaffold(targetDir: string, projectName: string): void {
  const templateDir = resolve(__dirname, '..', 'template');

  console.log(`\n✨ Scaffolding tindae-ui project in ${targetDir}...\n`);
  console.log('   ├── Copying template...');
  copyDir(templateDir, targetDir);

  console.log('   ├── Setting project name...');
  setProjectName(targetDir, projectName);

  console.log('   ├── Installing dependencies via pnpm...');
  try {
    execSync('pnpm install', { cwd: targetDir, stdio: 'inherit' });
  } catch {
    console.warn('   ⚠️  pnpm install failed. You can run it manually later.');
  }

  console.log('   ├── Initializing git repository...');
  try {
    execSync('git init', { cwd: targetDir, stdio: 'pipe' });
    execSync('git add -A', { cwd: targetDir, stdio: 'pipe' });
    execSync('git commit -m "chore: initialize project via create-tindae-ui"', {
      cwd: targetDir,
      stdio: 'pipe',
    });
  } catch {
    console.warn('   ⚠️  git init failed. You can initialize git manually.');
  }

  console.log(`
✅ Done! Next steps:

  cd ${projectName}
  pnpm dev
`);
}
```

- [ ] **Step 5: Create bin/create-tindae-ui.ts — CLI entry point**

```typescript
#!/usr/bin/env node
import { parseArgs } from '../src/cli.js';
import { scaffold } from '../src/generator.js';

async function main() {
  try {
    const { projectName, targetDir } = await parseArgs(process.argv);
    scaffold(targetDir, projectName);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\n❌ ${message}\n`);
    process.exit(1);
  }
}

main();
```

- [ ] **Step 6: Verify CLI compiles**

```bash
cd /home/code/create-tindae-ui && pnpm build
```

Expected: `tsc` compiles without errors, `dist/` directory created with JS files.

- [ ] **Step 7: Commit**

```bash
cd /home/code/create-tindae-ui && git add -A && git commit -m "feat: add CLI core logic (cli, generator, utils)"
```

---

### Task 3: Template — Root Config Files

**Files:**
- Create: `template/package.json`
- Create: `template/vite.config.ts`
- Create: `template/tsconfig.json`
- Create: `template/tsconfig.node.json`
- Create: `template/env.d.ts`
- Create: `template/index.html`
- Create: `template/tailwind.config.js`
- Create: `template/postcss.config.js`
- Create: `template/.eslintrc.cjs`
- Create: `template/.prettierrc.json`
- Create: `template/vitest.config.ts`
- Create: `template/.gitignore`

- [ ] **Step 1: Create template/package.json**

```json
{
  "name": "tindae-ui-app",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.ts,.tsx --fix && prettier --write \"src/**/*.{vue,ts,css}\"",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "vue": "^3.5.0",
    "vue-router": "^4.4.0",
    "pinia": "^2.2.0",
    "ant-design-vue": "^3.2.0",
    "vxe-table": "^4.6.0",
    "xe-utils": "^3.5.0",
    "echarts": "^5.5.0",
    "axios": "^1.7.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.1.0",
    "vite": "^5.4.0",
    "vue-tsc": "^2.1.0",
    "typescript": "^5.5.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.57.0",
    "@vue/eslint-config-typescript": "^13.0.0",
    "@vue/eslint-config-prettier": "^9.0.0",
    "eslint-plugin-vue": "^9.27.0",
    "prettier": "^3.3.0",
    "vitest": "^1.6.0",
    "@vue/test-utils": "^2.4.0",
    "@types/node": "^18.19.0"
  }
}
```

- [ ] **Step 2: Create template/vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

- [ ] **Step 3: Create template/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["vitest/globals"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.vue", "env.d.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 4: Create template/tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

- [ ] **Step 5: Create template/env.d.ts**

```typescript
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}
```

- [ ] **Step 6: Create template/index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tindae UI App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 7: Create template/tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
```

- [ ] **Step 8: Create template/postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 9: Create template/.eslintrc.cjs**

```javascript
/* eslint-env node */
module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'vue/multi-word-component-names': 'off',
  },
};
```

- [ ] **Step 10: Create template/.prettierrc.json**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "endOfLine": "lf"
}
```

- [ ] **Step 11: Create template/vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
```

- [ ] **Step 12: Create template/.gitignore**

```
node_modules
dist
*.local
.env
.env.*
!.env.example
```

- [ ] **Step 13: Commit**

```bash
cd /home/code/create-tindae-ui && git add -A && git commit -m "feat: add template root config files"
```

---

### Task 4: Template — src Infrastructure

**Files:**
- Create: `template/src/main.ts`
- Create: `template/src/App.vue`
- Create: `template/src/core/plugins/antd.ts`
- Create: `template/src/core/plugins/echarts.ts`
- Create: `template/src/core/plugins/vxeTable.ts`
- Create: `template/src/core/types/global.d.ts`
- Create: `template/src/assets/styles/tailwind.css`
- Create: `template/src/assets/styles/variables.css`
- Create: `template/src/assets/styles/global.css`
- Create: `template/src/shared/constants/copy.ts`
- Create: `template/src/layouts/Default.layout.vue`
- Create: `template/src/router/index.ts`
- Create: `template/src/stores/app.ts`
- Create: `template/src/types/index.ts`
- Create: various `.gitkeep` files

- [ ] **Step 1: Create template/src/main.ts**

```typescript
import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import { setupRouter } from './router';
import { setupAntd } from './core/plugins/antd';
import { setupEcharts } from './core/plugins/echarts';
import { setupVxeTable } from './core/plugins/vxeTable';
import './assets/styles/tailwind.css';
import './assets/styles/global.css';

const app = createApp(App);

app.use(createPinia());
setupAntd(app);
setupEcharts(app);
setupVxeTable(app);
setupRouter(app);

app.mount('#app');
```

- [ ] **Step 2: Create template/src/App.vue**

```vue
<template>
  <a-config-provider>
    <router-view />
  </a-config-provider>
</template>
```

- [ ] **Step 3: Create template/src/core/plugins/antd.ts**

```typescript
import type { App } from 'vue';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

export function setupAntd(app: App): void {
  app.use(Antd);
}
```

- [ ] **Step 4: Create template/src/core/plugins/echarts.ts**

```typescript
import type { App } from 'vue';

export function setupEcharts(_app: App): void {
  // echarts is imported on-demand in components.
  // Register global echarts theme or defaults here if needed.
}
```

- [ ] **Step 5: Create template/src/core/plugins/vxeTable.ts**

```typescript
import type { App } from 'vue';
import VxeUITable from 'vxe-table';
import 'vxe-table/lib/style.css';

export function setupVxeTable(app: App): void {
  app.use(VxeUITable);
}
```

- [ ] **Step 6: Create template/src/core/types/global.d.ts**

```typescript
export {};

declare global {
  // Global type augmentations go here
}
```

- [ ] **Step 7: Create template/src/assets/styles/tailwind.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 8: Create template/src/assets/styles/variables.css**

```css
:root {
  --color-primary: #1890ff;
  --color-success: #52c41a;
  --color-warning: #faad14;
  --color-error: #f5222d;
  --color-text: rgba(0, 0, 0, 0.85);
  --color-bg: #f0f2f5;
  --sidebar-width: 220px;
  --header-height: 48px;
}
```

- [ ] **Step 9: Create template/src/assets/styles/global.css**

```css
@import './variables.css';

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
  color: var(--color-text);
  background-color: var(--color-bg);
}
```

- [ ] **Step 10: Create template/src/shared/constants/copy.ts**

```typescript
export const COPY = {
  COMMON: {
    CONFIRM: '确认',
    CANCEL: '取消',
    CREATE: '新建',
    EDIT: '编辑',
    DELETE: '删除',
    SEARCH: '搜索',
    RESET: '重置',
    SUCCESS: '操作成功',
    FAILED: '操作失败',
  },
} as const;
```

- [ ] **Step 11: Create template/src/layouts/Default.layout.vue**

```vue
<script setup lang="ts">
import { useAppStore } from '@/stores/app';
import { useRouter } from 'vue-router';

defineOptions({ name: 'DefaultLayout' });

const appStore = useAppStore();
const router = useRouter();

function navigateTo(path: string) {
  router.push(path);
}
</script>

<template>
  <a-layout class="min-h-screen">
    <a-layout-sider v-model:collapsed="appStore.sidebarCollapsed" collapsible :width="220">
      <div class="p-4 text-white text-center font-bold text-lg">Tindae UI</div>
      <a-menu theme="dark" mode="inline" @click="({ key }: { key: string }) => navigateTo(key)">
        <a-menu-item key="/user-management">用户管理</a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="bg-white px-4 flex items-center justify-between shadow-sm">
        <a-button type="text" @click="appStore.toggleSidebar">
          <template #icon>
            <MenuFoldOutlined v-if="!appStore.sidebarCollapsed" />
            <MenuUnfoldOutlined v-else />
          </template>
        </a-button>
      </a-layout-header>
      <a-layout-content class="m-4 p-4 bg-white rounded">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
```

Note: `MenuFoldOutlined` and `MenuUnfoldOutlined` are from `@ant-design/icons-vue`. This dependency is already listed in `template/package.json` dependencies.

- [ ] **Step 12: Update template/package.json — add @ant-design/icons-vue**

Add to `dependencies`:

```json
"@ant-design/icons-vue": "^7.0.0"
```

- [ ] **Step 13: Create template/src/router/index.ts**

```typescript
import type { App } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import DefaultLayout from '@/layouts/Default.layout.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        redirect: '/user-management',
      },
      // --- Demo Domain Routes ---
      {
        path: '/user-management',
        name: 'UserManagement',
        component: () => import('@/pages/user-management/pages/UserList.page.vue'),
      },
      {
        path: '/user-management/:id',
        name: 'UserManagementDetail',
        component: () => import('@/pages/user-management/pages/UserDetail.page.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export function setupRouter(app: App): void {
  app.use(router);
}
```

Note: For this initial version, routes are defined inline. When the auto-route-name Vite plugin is added later, routes will be auto-scanned from `*.routes.ts` files.

- [ ] **Step 14: Create template/src/stores/app.ts**

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false);

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  return { sidebarCollapsed, toggleSidebar };
});
```

- [ ] **Step 15: Create template/src/types/index.ts**

```typescript
// Global type exports
export type {};
```

- [ ] **Step 16: Create .gitkeep placeholders**

```bash
mkdir -p template/src/shared/ui-kit/styles
mkdir -p template/src/shared/ui-kit/composables
mkdir -p template/src/shared/utils
touch template/src/shared/ui-kit/styles/.gitkeep
touch template/src/shared/ui-kit/composables/.gitkeep
touch template/src/shared/utils/.gitkeep
touch template/src/modules/.gitkeep
```

- [ ] **Step 17: Commit**

```bash
cd /home/code/create-tindae-ui && git add -A && git commit -m "feat: add template src infrastructure (main, plugins, layout, router, store)"
```

---

### Task 5: Template — User Management Demo Domain (Models + API)

**Files:**
- Create: `template/src/pages/user-management/features/user/models/User.ts`
- Create: `template/src/pages/user-management/features/user/models/index.ts`
- Create: `template/src/pages/user-management/features/user/api/user.api.ts`
- Create: `template/src/pages/user-management/shared/.gitkeep`

- [ ] **Step 1: Create template/src/pages/user-management/features/user/models/User.ts**

```typescript
/** User entity */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

/** User role enum */
export const UserRoles = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];

export const UserRoleOptions = [
  { label: '管理员', value: UserRoles.ADMIN },
  { label: '普通用户', value: UserRoles.USER },
];

/** User status enum */
export const UserStatuses = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export type UserStatus = (typeof UserStatuses)[keyof typeof UserStatuses];

export const UserStatusOptions = [
  { label: '启用', value: UserStatuses.ACTIVE },
  { label: '禁用', value: UserStatuses.INACTIVE },
];

/** Request params for user list */
export interface UserListParams {
  page: number;
  pageSize: number;
  name?: string;
  status?: UserStatus;
  role?: UserRole;
}

/** Paginated list result */
export interface UserListResult {
  list: User[];
  total: number;
}
```

- [ ] **Step 2: Create template/src/pages/user-management/features/user/models/index.ts**

```typescript
export * from './User';
```

- [ ] **Step 3: Create template/src/pages/user-management/features/user/api/user.api.ts**

```typescript
import axios from 'axios';
import type { User, UserListParams, UserListResult } from '../models/User';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export const getUserList = (params: UserListParams) => {
  return request.get<{ code: number; data: UserListResult }>('/users', { params });
};

export const getUserDetail = (id: string) => {
  return request.get<{ code: number; data: User }>(`/users/${id}`);
};

export const createUser = (data: Omit<User, 'id' | 'createdAt'>) => {
  return request.post<{ code: number; data: User }>('/users', data);
};

export const updateUser = (id: string, data: Partial<User>) => {
  return request.put<{ code: number; data: User }>(`/users/${id}`, data);
};

export const deleteUser = (id: string) => {
  return request.delete<{ code: number }>(`/users/${id}`);
};
```

- [ ] **Step 4: Create shared/.gitkeep**

```bash
mkdir -p template/src/pages/user-management/shared && touch template/src/pages/user-management/shared/.gitkeep
```

- [ ] **Step 5: Commit**

```bash
cd /home/code/create-tindae-ui && git add -A && git commit -m "feat: add user-management demo domain (models + API)"
```

---

### Task 6: Template — User Management Demo Domain (Composables + Components + Views)

**Files:**
- Create: `template/src/pages/user-management/features/user/composables/useUser.ts`
- Create: `template/src/pages/user-management/features/user/composables/useUser.spec.ts`
- Create: `template/src/pages/user-management/features/user/components/list/UserFilter.vue`
- Create: `template/src/pages/user-management/features/user/views/UserList.view.vue`
- Create: `template/src/pages/user-management/features/user/views/UserDetail.view.vue`
- Create: `template/src/pages/user-management/pages/UserList.page.vue`
- Create: `template/src/pages/user-management/pages/UserDetail.page.vue`

- [ ] **Step 1: Create useUser.ts composable**

```typescript
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { getUserList, getUserDetail, deleteUser } from '../api/user.api';
import type { User, UserListParams, UserStatus, UserRole } from '../models/User';
import { COPY } from '@/shared/constants/copy';

export function useUserList() {
  const loading = ref(false);
  const users = ref<User[]>([]);
  const total = ref(0);
  const pagination = reactive({ page: 1, pageSize: 10 });

  const filters = reactive({
    name: undefined as string | undefined,
    status: undefined as UserStatus | undefined,
    role: undefined as UserRole | undefined,
  });

  async function fetchList() {
    loading.value = true;
    try {
      const params: UserListParams = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...filters,
      };
      const { data: res } = await getUserList(params);
      users.value = res.data.list;
      total.value = res.data.total;
    } catch {
      message.error(COPY.COMMON.FAILED);
    } finally {
      loading.value = false;
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteUser(id);
      message.success(COPY.COMMON.SUCCESS);
      fetchList();
    } catch {
      message.error(COPY.COMMON.FAILED);
    }
  }

  function resetFilters() {
    filters.name = undefined;
    filters.status = undefined;
    filters.role = undefined;
    pagination.page = 1;
    fetchList();
  }

  return { loading, users, total, pagination, filters, fetchList, handleDelete, resetFilters };
}

export function useUserDetail() {
  const loading = ref(false);
  const user = ref<User | null>(null);

  async function fetchDetail(id: string) {
    loading.value = true;
    try {
      const { data: res } = await getUserDetail(id);
      user.value = res.data;
    } catch {
      message.error(COPY.COMMON.FAILED);
    } finally {
      loading.value = false;
    }
  }

  return { loading, user, fetchDetail };
}
```

- [ ] **Step 2: Create useUser.spec.ts test**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUserList } from './useUser';

// Mock ant-design-vue message
vi.mock('ant-design-vue', () => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock API
vi.mock('../api/user.api', () => ({
  getUserList: vi.fn().mockResolvedValue({
    data: {
      code: 200,
      data: {
        list: [
          { id: '1', name: '张三', email: 'zhangsan@test.com', role: 'admin', status: 'active', createdAt: '2024-01-01' },
        ],
        total: 1,
      },
    },
  }),
  deleteUser: vi.fn().mockResolvedValue({ data: { code: 200 } }),
}));

describe('useUserList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch user list successfully', async () => {
    const { users, total, fetchList } = useUserList();

    await fetchList();

    expect(users.value).toHaveLength(1);
    expect(users.value[0].name).toBe('张三');
    expect(total.value).toBe(1);
  });
});
```

- [ ] **Step 3: Create UserFilter.vue component**

```vue
<script setup lang="ts">
import type { UserStatus, UserRole } from '../models/User';
import { UserStatusOptions, UserRoleOptions } from '../models/User';

defineProps<{
  name?: string;
  status?: UserStatus;
  role?: UserRole;
}>();

const emit = defineEmits<{
  (e: 'search'): void;
  (e: 'update:name', value: string | undefined): void;
  (e: 'update:status', value: UserStatus | undefined): void;
  (e: 'update:role', value: UserRole | undefined): void;
  (e: 'reset'): void;
}>();
</script>

<template>
  <a-form layout="inline" class="mb-4">
    <a-form-item label="用户名">
      <a-input
        :value="name"
        placeholder="请输入用户名"
        allow-clear
        @update:value="emit('update:name', $event)"
      />
    </a-form-item>
    <a-form-item label="状态">
      <a-select
        :value="status"
        placeholder="请选择状态"
        allow-clear
        style="width: 120px"
        :options="UserStatusOptions"
        @update:value="emit('update:status', $event)"
      />
    </a-form-item>
    <a-form-item label="角色">
      <a-select
        :value="role"
        placeholder="请选择角色"
        allow-clear
        style="width: 120px"
        :options="UserRoleOptions"
        @update:value="emit('update:role', $event)"
      />
    </a-form-item>
    <a-form-item>
      <a-button type="primary" @click="emit('search')">查询</a-button>
      <a-button class="ml-2" @click="emit('reset')">重置</a-button>
    </a-form-item>
  </a-form>
</template>
```

- [ ] **Step 4: Create UserList.view.vue**

```vue
<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserList } from '../composables/useUser';
import UserFilter from '../components/list/UserFilter.vue';
import { COPY } from '@/shared/constants/copy';

defineOptions({ name: 'UserList' });

const { loading, users, total, pagination, filters, fetchList, handleDelete, resetFilters } =
  useUserList();

onMounted(() => {
  fetchList();
});
</script>

<template>
  <div>
    <UserFilter
      v-model:name="filters.name"
      v-model:status="filters.status"
      v-model:role="filters.role"
      @search="fetchList"
      @reset="resetFilters"
    />

    <vxe-table :data="users" :loading="loading" border>
      <vxe-column field="name" title="用户名" />
      <vxe-column field="email" title="邮箱" />
      <vxe-column field="role" title="角色" />
      <vxe-column field="status" title="状态">
        <template #default="{ row }">
          <a-tag :color="row.status === 'active' ? 'green' : 'red'">
            {{ row.status === 'active' ? '启用' : '禁用' }}
          </a-tag>
        </template>
      </vxe-column>
      <vxe-column field="createdAt" title="创建时间" />
      <vxe-column title="操作" width="200">
        <template #default="{ row }">
          <a-button type="link" size="small" @click="$router.push(`/user-management/${row.id}`)">
            {{ COPY.COMMON.EDIT }}
          </a-button>
          <a-popconfirm title="确定删除？" @confirm="handleDelete(row.id)">
            <a-button type="link" danger size="small">{{ COPY.COMMON.DELETE }}</a-button>
          </a-popconfirm>
        </template>
      </vxe-column>
    </vxe-table>

    <div class="mt-4 flex justify-end">
      <a-pagination
        v-model:current="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="total"
        show-size-changer
        @change="fetchList"
      />
    </div>
  </div>
</template>
```

- [ ] **Step 5: Create UserDetail.view.vue**

```vue
<script setup lang="ts">
import { COPY } from '@/shared/constants/copy';
import type { User } from '../models/User';

defineOptions({ name: 'UserDetail' });

defineProps<{
  user: User | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'back'): void;
}>();
</script>

<template>
  <div>
    <a-page-header :title="user?.name ?? '用户详情'" @back="emit('back')" />

    <a-spin :spinning="loading">
      <a-descriptions bordered :column="2" class="mt-4" v-if="user">
        <a-descriptions-item label="用户名">{{ user.name }}</a-descriptions-item>
        <a-descriptions-item label="邮箱">{{ user.email }}</a-descriptions-item>
        <a-descriptions-item label="角色">{{ user.role }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="user.status === 'active' ? 'green' : 'red'">
            {{ user.status === 'active' ? '启用' : '禁用' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ user.createdAt }}</a-descriptions-item>
      </a-descriptions>
    </a-spin>
  </div>
</template>
```

- [ ] **Step 6: Create UserList.page.vue (route shell)**

```vue
<script setup lang="ts">
/**
 * 用户列表 - 路由页 (Page Shell)
 */
defineOptions({ name: 'UserManagement' });
</script>

<template>
  <UserList.view />
</template>

<script lang="ts">
import UserListView from '../features/user/views/UserList.view.vue';

export default {
  components: { 'UserList.view': UserListView },
};
</script>
```

- [ ] **Step 7: Create UserDetail.page.vue (route shell)**

```vue
<script setup lang="ts">
/**
 * 用户详情 - 路由页 (Page Shell)
 */
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserDetail } from '../features/user/composables/useUser';
import UserDetailView from '../features/user/views/UserDetail.view.vue';

defineOptions({ name: 'UserManagementDetail' });

const route = useRoute();
const router = useRouter();
const { loading, user, fetchDetail } = useUserDetail();

function goBack() {
  router.push('/user-management');
}

onMounted(() => {
  const id = route.params.id as string;
  fetchDetail(id);
});
</script>

<template>
  <UserDetailView :user="user" :loading="loading" @back="goBack" />
</template>
```

- [ ] **Step 8: Commit**

```bash
cd /home/code/create-tindae-ui && git add -A && git commit -m "feat: add user-management demo domain (composables, components, views, pages)"
```

---

### Task 7: Template — Docs

**Files:**
- Create: `template/docs/ARCHITECTURE.md`
- Create: `template/docs/CODING_STANDARDS.md`
- Create: `template/docs/MIGRATION.md`

- [ ] **Step 1: Copy existing docs to template**

The existing docs at `/home/code/create-tindae-ui/docs/ARCHITECTURE.md`, `CODING_STANDARDS.md`, and `MIGRATION.md` are the source of truth. Copy them into `template/docs/`.

```bash
cp /home/code/create-tindae-ui/docs/ARCHITECTURE.md /home/code/create-tindae-ui/template/docs/ARCHITECTURE.md
cp /home/code/create-tindae-ui/docs/CODING_STANDARDS.md /home/code/create-tindae-ui/template/docs/CODING_STANDARDS.md
cp /home/code/create-tindae-ui/docs/MIGRATION.md /home/code/create-tindae-ui/template/docs/MIGRATION.md
```

- [ ] **Step 2: Commit**

```bash
cd /home/code/create-tindae-ui && git add -A && git commit -m "feat: add architecture docs to template"
```

---

### Task 8: End-to-End Verification

- [ ] **Step 1: Build the CLI**

```bash
cd /home/code/create-tindae-ui && pnpm build
```

Expected: TypeScript compiles without errors.

- [ ] **Step 2: Run the CLI to scaffold a test project**

```bash
cd /tmp && node /home/code/create-tindae-ui/dist/bin/create-tindae-ui.js test-tindae-app
```

Expected:
- Template copied to `/tmp/test-tindae-app`
- `pnpm install` runs
- `git init` + initial commit
- "Done! Next steps:" message printed

- [ ] **Step 3: Verify the scaffolded project runs**

```bash
cd /tmp/test-tindae-app && pnpm dev &
sleep 5
curl -s http://localhost:3000 | head -20
kill %1
```

Expected: HTML with `<div id="app">` returned, Vite dev server starts.

- [ ] **Step 4: Verify lint works**

```bash
cd /tmp/test-tindae-app && pnpm lint
```

Expected: ESLint + Prettier run without errors.

- [ ] **Step 5: Verify test runs**

```bash
cd /tmp/test-tindae-app && pnpm test
```

Expected: Vitest runs, `useUserList` test passes.

- [ ] **Step 6: Clean up test project**

```bash
rm -rf /tmp/test-tindae-app
```

- [ ] **Step 7: Final commit (if any fixes needed)**

If any issues were found and fixed during verification, commit the fixes.

```bash
cd /home/code/create-tindae-ui && git add -A && git commit -m "fix: address issues found during e2e verification"
```
