# Template 顶层清理与发布排除机制 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 清理 `template/` 内不该发布的开发期残留、合并冗余 `ARCHITECTURE.md`，并给发布链路加黑名单排除机制防止未来复发。

**Architecture:** `src/utils/fs.ts` 的 `copyDir` 增加可选 `ignore` 参数（按相对路径匹配目录前缀或精确文件），`src/generator.ts` 定义发布黑名单常量传入。测试沿用 `tests/cli.test.ts` 既有的 `mkdtempSync` + `scaffold` + `existsSync` 模式，新增 `copyDir` 单元测试隔离验证排除机制。

**Tech Stack:** Node.js `cpSync`/`node:test`/`node:assert`，TypeScript（tsx loader 运行 `.ts` 测试）。

## Global Constraints

- TypeScript strict，无隐式 any。
- `copyDir` 的 `ignore` 参数带默认值 `['node_modules']`，保持现有调用（`generator.ts:55`）在未传参时行为不变。
- 排除语义：相对 `src` 的 POSIX 相对路径，**等于条目**或**以 `条目/` 开头**即排除（目录前缀匹配其下所有内容）。
- 不改动根目录配置文件、Readme 文档查看器内容源（`README.md`/`ARCHITECTURE.md`/`design.md`/`theme.md`）、`@google/design.md` 主题源、`src/` 结构。
- 删除 `template/docs/ARCHITECTURE.md` 后必须同步 `README.md:164` 与 `AGENTS.md:177` 的引用至根 `ARCHITECTURE.md`，不得留断链。

---

### Task 1: copyDir 增加 ignore 参数（单元测试 TDD）

**Files:**
- Create: `tests/utils/fs.test.ts`
- Modify: `src/utils/fs.ts:1-14`
- Modify: `package.json`（test 脚本追加 `tests/utils/fs.test.ts`）

**Interfaces:**
- Produces: `copyDir(src: string, dest: string, ignore?: string[]): void`——`ignore` 默认 `['node_modules']`，按相对路径前缀/精确匹配排除。Task 2 依赖此签名。

- [ ] **Step 1: 写失败的单元测试**

创建 `tests/utils/fs.test.ts`：

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { copyDir } from '../../src/utils/fs.ts';

test('copyDir 排除 ignore 中的目录前缀', () => {
  const src = mkdtempSync(join(tmpdir(), 'copydir-src-'));
  const dest = mkdtempSync(join(tmpdir(), 'copydir-dest-'));
  try {
    mkdirSync(join(src, 'docs', 'superpowers'), { recursive: true });
    writeFileSync(join(src, 'docs', 'superpowers', 'plan.md'), '# plan');
    writeFileSync(join(src, 'docs', 'keep.md'), 'keep');
    writeFileSync(join(src, 'package.json'), '{}');

    copyDir(src, dest, ['docs/superpowers', 'node_modules']);

    assert.equal(existsSync(join(dest, 'docs', 'superpowers', 'plan.md')), false);
    assert.equal(existsSync(join(dest, 'docs', 'keep.md')), true);
    assert.equal(existsSync(join(dest, 'package.json')), true);
  } finally {
    rmSync(src, { recursive: true, force: true });
    rmSync(dest, { recursive: true, force: true });
  }
});

test('copyDir 排除 ignore 中的精确文件路径', () => {
  const src = mkdtempSync(join(tmpdir(), 'copydir-src-'));
  const dest = mkdtempSync(join(tmpdir(), 'copydir-dest-'));
  try {
    mkdirSync(join(src, 'docs'), { recursive: true });
    writeFileSync(join(src, 'docs', 'optimization-candidates.md'), 'todo');
    writeFileSync(join(src, 'docs', 'keep.md'), 'keep');

    copyDir(src, dest, ['docs/optimization-candidates.md']);

    assert.equal(existsSync(join(dest, 'docs', 'optimization-candidates.md')), false);
    assert.equal(existsSync(join(dest, 'docs', 'keep.md')), true);
  } finally {
    rmSync(src, { recursive: true, force: true });
    rmSync(dest, { recursive: true, force: true });
  }
});

test('copyDir 默认排除 node_modules', () => {
  const src = mkdtempSync(join(tmpdir(), 'copydir-src-'));
  const dest = mkdtempSync(join(tmpdir(), 'copydir-dest-'));
  try {
    mkdirSync(join(src, 'node_modules', 'pkg'), { recursive: true });
    writeFileSync(join(src, 'node_modules', 'pkg', 'index.js'), 'module.exports = 1;');
    writeFileSync(join(src, 'package.json'), '{}');

    copyDir(src, dest);

    assert.equal(existsSync(join(dest, 'node_modules')), false);
    assert.equal(existsSync(join(dest, 'package.json')), true);
  } finally {
    rmSync(src, { recursive: true, force: true });
    rmSync(dest, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: 在 package.json 的 test 脚本中注册新测试文件**

修改根 `package.json` 的 `"test"` 脚本，在文件列表开头追加 `tests/utils/fs.test.ts`（保持其余测试文件不变）：

```diff
- "test": "node --import tsx --test tests/cli.test.ts tests/scaffold-core/patch.test.ts ...
+ "test": "node --import tsx --test tests/utils/fs.test.ts tests/cli.test.ts tests/scaffold-core/patch.test.ts ...
```

- [ ] **Step 3: 运行测试，确认前两条失败（ignore 未实现）**

Run: `node --import tsx --test tests/utils/fs.test.ts`
Expected: 前两条测试 FAIL（当前 `copyDir` 无 `ignore` 参数，开发期文件被复制）；第三条 PASS（`node_modules` 当前已排除）。

- [ ] **Step 4: 实现 copyDir 的 ignore 参数**

将 `src/utils/fs.ts` 改为：

```ts
import { cpSync, mkdirSync, existsSync } from 'node:fs';
import { relative } from 'node:path';

/** 默认排除项，保持未传 ignore 时的历史行为（仅排除 node_modules）。 */
const DEFAULT_IGNORE = ['node_modules'];

/**
 * 递归复制目录（Node 16.7+）。
 *
 * @param src    源目录
 * @param dest   目标目录
 * @param ignore 相对 src 的 POSIX 路径黑名单：精确匹配或目录前缀（条目/...）匹配。
 *               默认排除 node_modules。
 */
export function copyDir(src: string, dest: string, ignore: string[] = DEFAULT_IGNORE): void {
  if (!existsSync(src)) {
    throw new Error(`Source directory does not exist: ${src}`);
  }
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, {
    recursive: true,
    filter: (srcPath) => {
      // 统一为 POSIX 相对路径，兼容 Windows 反斜杠
      const rel = relative(src, srcPath).split('\\').join('/');
      // 根目录本身（rel === '.'）永远保留
      return rel === '.' || !ignore.some((pat) => rel === pat || rel.startsWith(`${pat}/`));
    },
  });
}
```

- [ ] **Step 5: 运行测试，确认全部通过**

Run: `node --import tsx --test tests/utils/fs.test.ts`
Expected: 3 条 PASS。

- [ ] **Step 6: 提交**

```bash
git add tests/utils/fs.test.ts src/utils/fs.ts package.json
git commit -m "feat: copyDir 增加 ignore 黑名单参数支持发布排除"
```

---

### Task 2: generator 接入发布黑名单（集成测试 TDD）

**Files:**
- Modify: `src/generator.ts:5,49-55`
- Modify: `tests/cli.test.ts`（追加集成测试）

**Interfaces:**
- Consumes: Task 1 的 `copyDir(src, dest, ignore?)`
- Produces: `PUBLISH_IGNORE` 常量（template 内不发布给用户的开发期产物模式）

- [ ] **Step 1: 写失败的集成测试**

在 `tests/cli.test.ts` 末尾追加（复用既有 scaffold 冒烟模式）：

```ts
test('scaffold 发布用户文档但排除开发期产物', () => {
  const tmpRoot = mkdtempSync(join(tmpdir(), 'create-tindae-ui-'));
  const targetDir = join(tmpRoot, 'demo-app');

  try {
    scaffold(targetDir, 'demo-app', { skipInstall: true, skipGit: true });

    // 用户文档应发布
    assert.equal(existsSync(join(targetDir, 'docs', 'MIGRATION.md')), true);
    // 开发期产物不应发布
    assert.equal(existsSync(join(targetDir, 'docs', 'superpowers')), false);
    assert.equal(existsSync(join(targetDir, 'docs', 'optimization-candidates.md')), false);
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `node --import tsx --test tests/cli.test.ts`
Expected: 新测试 FAIL——当前 `generator.ts` 未传 ignore，`docs/superpowers/` 与 `optimization-candidates.md` 仍被复制。

- [ ] **Step 3: generator 定义并传入发布黑名单**

修改 `src/generator.ts`：

在文件顶部 `import` 之后、`resolveTemplateDir` 之前，新增常量：

```ts
/**
 * 模板内不应发布给最终用户的开发期产物（相对 template 根的 POSIX 路径）。
 * - node_modules: 依赖目录
 * - docs/superpowers: superpowers 工作流产生的设计文档快照（属 create-tindae-ui 开发，不属于生成项目）
 * - docs/optimization-candidates.md: 开发期优化备忘（正式变更由 openspec 承载）
 */
const PUBLISH_IGNORE = [
  'node_modules',
  'docs/superpowers',
  'docs/optimization-candidates.md',
];
```

将 `scaffold` 内第 55 行的调用改为：

```ts
  copyDir(templateDir, targetDir, PUBLISH_IGNORE);
```

- [ ] **Step 4: 运行测试，确认通过**

Run: `node --import tsx --test tests/cli.test.ts`
Expected: 全部 PASS（含新集成测试与既有 `scaffold copies root-level template docs` 测试）。

- [ ] **Step 5: 提交**

```bash
git add src/generator.ts tests/cli.test.ts
git commit -m "feat: generator 接入发布黑名单，排除 template 开发期产物"
```

---

### Task 3: 清理残留文件 + 合并 ARCHITECTURE + 同步链接

**Files:**
- Delete: `template/docs/superpowers/specs/2026-05-20-tab-context-menu-design.md`
- Delete: `template/docs/superpowers/specs/2026-05-21-scaffold-feature-design.md`
- Delete: `template/docs/superpowers/plans/2026-05-21-tab-context-menu.md`
- Delete: `template/docs/optimization-candidates.md`
- Delete: `template/docs/ARCHITECTURE.md`（合并后）
- Modify: `template/ARCHITECTURE.md`（并入 docs 版独有内容）
- Modify: `template/README.md:164`
- Modify: `template/AGENTS.md:177`

**Interfaces:** 无代码接口；本任务为文件清理与文档合并。

- [ ] **Step 1: 删除开发期残留文件**

```bash
git rm template/docs/superpowers/specs/2026-05-20-tab-context-menu-design.md \
       template/docs/superpowers/specs/2026-05-21-scaffold-feature-design.md \
       template/docs/superpowers/plans/2026-05-21-tab-context-menu.md \
       template/docs/optimization-candidates.md
```

删除后 `template/docs/superpowers/` 应为空目录，Git 不跟踪空目录，无需额外操作。

- [ ] **Step 2: 逐节对比两份 ARCHITECTURE，识别 docs 版独有内容**

完整阅读 `template/ARCHITECTURE.md`（317 行，权威版）与 `template/docs/ARCHITECTURE.md`（80 行）。对 docs 版的每个章节（`##`/`###`）逐个判断：

- 若根版已覆盖该主题 → 跳过。
- 若 docs 版有根版缺失的要点、图示或说明 → 复制到根版最贴近的章节末尾，保持根版编号与风格。

记录合并进的具体章节（写进 commit body），确保无内容丢失。

- [ ] **Step 3: 将 docs 版独有内容并入根 ARCHITECTURE.md**

在 `template/ARCHITECTURE.md` 相应章节插入 Step 2 识别出的独有内容。保持现有标题层级与中文术语风格。

- [ ] **Step 4: 删除 docs/ARCHITECTURE.md**

```bash
git rm template/docs/ARCHITECTURE.md
```

- [ ] **Step 5: 同步 README.md 的链接**

修改 `template/README.md:164`：

```diff
-- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)：架构说明。
+- [ARCHITECTURE.md](ARCHITECTURE.md)：架构说明。
```

- [ ] **Step 6: 同步 AGENTS.md 的引用**

修改 `template/AGENTS.md:177`，将「架构总览见 `docs/ARCHITECTURE.md`」改为「架构总览见 `ARCHITECTURE.md`」：

```diff
-> 完整机制（架构图、Page/View 全例、http 高级用法、主题 SSOT、权限三道防线、对接真实后端）见 `README.md`；主题细节见 `theme.md`；架构总览见 `docs/ARCHITECTURE.md`。
+> 完整机制（架构图、Page/View 全例、http 高级用法、主题 SSOT、权限三道防线、对接真实后端）见 `README.md`；主题细节见 `theme.md`；架构总览见 `ARCHITECTURE.md`。
```

- [ ] **Step 7: 校验无断链残留**

Run: `git grep -n "docs/ARCHITECTURE" -- template/`
Expected: 仅 `template/src/shared/components/markdown/link.ts` 与 `link.spec.ts` 出现（这些是路径解析逻辑的示例输入，非功能性链接，保留）。

Run: `git grep -n "optimization-candidates\|docs/superpowers" -- template/`
Expected: 无输出（已全部删除；`generator.ts` 的 PUBLISH_IGNORE 在仓库根 `src/`，不在 template/ 范围）。

- [ ] **Step 8: 提交**

```bash
git add template/ARCHITECTURE.md template/README.md template/AGENTS.md
git commit -m "refactor: 清理 template 开发期文档并合并冗余 ARCHITECTURE"
```

commit body 注明从 docs 版并入根版的章节清单。

---

### Task 4: 全量验证与收尾

**Files:** 无新增；仅运行验证。

- [ ] **Step 1: 运行全部测试**

Run: `npm test`
Expected: 全部 PASS——含 `tests/utils/fs.test.ts`（Task 1）、`tests/cli.test.ts`（Task 2，含发布排除断言）、`tests/scaffold-core/*`（契约不应受影响）。

- [ ] **Step 2: 确认发布排除已被集成测试覆盖**

生成项目无开发期文档泄漏这一断言，已由 Task 2 的 `scaffold 发布用户文档但排除开发期产物` 测试覆盖（位于 `tests/cli.test.ts`，Step 1 的 `npm test` 已包含）。无需再手动生成临时项目，避免重复。

- [ ] **Step 3: 确认根目录配置与查看器文档源未被改动**

Run: `git diff --stat master -- template/README.md template/AGENTS.md template/ARCHITECTURE.md template/theme.md template/design.md template/package.json`
Expected: 仅 `README.md`/`AGENTS.md`/`ARCHITECTURE.md` 有改动（链接同步与内容并入），`theme.md`/`design.md`/`package.json` 无改动。

- [ ] **Step 4: 收尾提交（如有 Step 2/3 发现的遗漏修复）**

若 Step 1-3 全部通过且工作区干净，无需额外提交。否则按发现的问题补一个 `fix:` 提交。

---

## Self-Review 记录

- **Spec 覆盖**：spec 的「清理残留→Task 3 Step 1」「合并 ARCHITECTURE→Task 3 Step 2-4」「同步链接→Task 3 Step 5-6」「发布排除机制→Task 1+2」「验证→Task 4」逐项覆盖；「不动清单」由 Global Constraints 与 Task 4 Step 3 守护。
- **Placeholder 扫描**：无 TBD/TODO；ARCHITECTURE 合并给出逐节对比方法（依赖实际文档内容，非占位）。
- **类型一致性**：`copyDir(src, dest, ignore?)` 签名在 Task 1 定义、Task 2 消费，一致；`PUBLISH_IGNORE` 仅在 Task 2 定义。
