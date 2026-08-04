# Template 顶层清理与发布排除机制 设计

## 背景

`create-tindae-ui` 通过 `src/generator.ts` 的 `copyDir` 将 `template/` 目录复制给用户作为新项目骨架。当前 `copyDir`（`src/utils/fs.ts`）使用 Node `cpSync` 全量递归复制，**仅排除 `node_modules`**：

```ts
cpSync(src, dest, { recursive: true, filter: (srcPath) => !srcPath.includes('node_modules') });
```

这导致 `template/` 内的**开发期产物**（superpowers 设计文档、优化候选备忘）会被原样发布给最终用户，污染生成项目。

## 目标

1. **移除残留**：删除 `template/` 内不属于发布模板的开发期产物。
2. **合并冗余**：将两份职责重叠的 `ARCHITECTURE.md` 合并为一份权威版。
3. **防复发**：在发布链路建立轻量排除机制，防止未来 superpowers/openspec 产物再次泄漏。

## 非目标（明确不动）

- **不重组 `src/` 结构**（pages/core/shared 等保持原状）。
- **不归类根目录配置与文档**：经核查，根目录的 `README.md` / `ARCHITECTURE.md` / `design.md` / `theme.md` 是内置 Readme 文档查看器的内容源（`src/pages/readme/features/readme/views/Readme.view.vue` 的 `ROOT_DOC_PRIORITY` 硬编码引用），`design.md` 是 `@google/design.md` 主题定义源，配置文件必须位于根目录。强行归类会破坏查看器路径假设与项目惯例。

## 现状分析

### 发布机制
`generator.ts` → `copyDir(templateDir, targetDir)` → `cpSync` 全量复制，filter 仅排除 `node_modules`。发布范围 = `template/` 全部内容。

### 根目录文档的架构意义
| 文件 | 作用 | 能否移动 |
|---|---|---|
| `README.md` / `ARCHITECTURE.md` / `design.md` / `theme.md` | Readme 文档查看器内容源（`ROOT_DOC_PRIORITY`） | 否，查看器从根读取 |
| `design.md` | `@google/design.md` 主题定义源，`export-theme-tokens.mjs` 输入 | 否 |
| `theme.tokens.json` | 主题 token 导出产物 | 否（与 design.md 配套） |
| `package.json` / `tsconfig*` / `vite.config.ts` 等 | 标准项目配置 | 否，工具链约定在根 |

结论：根目录"散"是项目模板的正常且必要的状态，归类空间极小。

### 真正的残留（会发布但不该）
| 路径 | 性质 | 处理 |
|---|---|---|
| `template/docs/superpowers/`（3 文件） | template 开发期的 superpowers 设计快照 | 删除（git 历史留存） |
| `template/docs/optimization-candidates.md` | "临时备忘，尚未立项"，正式变更已由 openspec 接管 | 删除 |
| `template/docs/ARCHITECTURE.md`（80 行） | "架构设计白皮书"，与根 `ARCHITECTURE.md`（317 行）职责重叠 | 合并后删除 |

### 删除安全性
`tests/` 目录对 `superpowers` / `optimization-candidates` / `docs/ARCHITECTURE` / fileList 契约均**零引用**，删除不破坏现有测试。

## 设计

### 1. 清理开发期残留

删除以下文件（纯开发产物，git 历史已留存，openspec archive 承载正式变更记录）：
- `template/docs/superpowers/specs/2026-05-20-tab-context-menu-design.md`
- `template/docs/superpowers/specs/2026-05-21-scaffold-feature-design.md`
- `template/docs/superpowers/plans/2026-05-21-tab-context-menu.md`
- `template/docs/optimization-candidates.md`

删除后若 `template/docs/superpowers/` 目录为空，移除空目录。

### 2. 合并冗余 ARCHITECTURE

- 以**根 `ARCHITECTURE.md`（317 行）为权威版**（Readme 查看器 `ROOT_DOC_PRIORITY` 直接引用 `/ARCHITECTURE.md`）。
- 逐节对比 `docs/ARCHITECTURE.md`（80 行），将其独有章节/要点并入根版。
- 合并完成后删除 `docs/ARCHITECTURE.md`。
- **同步更新引用**（删除 docs 版会断链，必须改指根版）：
  - `README.md:164` 的链接 `[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)` → 改指 `ARCHITECTURE.md`
  - `AGENTS.md:177` 的引用「架构总览见 `docs/ARCHITECTURE.md`」→ 改指 `ARCHITECTURE.md`
  - `src/shared/components/markdown/link.ts` / `link.spec.ts` 中的 `docs/ARCHITECTURE.md` 是路径解析逻辑的示例输入，非功能性依赖，保留即可（如需严谨可同步替换为存在的文档路径）。

### 3. 发布排除机制（防复发）

**形式**：代码内黑名单常量（决策记录：不采用 `.publishignore` 文件，避免引入解析逻辑，符合 YAGNI）。

**改动点**：

`src/utils/fs.ts` — `copyDir` 增加可选 `ignore` 参数：
```ts
// 默认仍排除 node_modules；调用方可传入额外黑名单
export function copyDir(src: string, dest: string, ignore: string[] = ['node_modules']): void {
  // filter 按「相对 src 的路径」匹配 ignore 条目：
  //   - 目录前缀（如 'docs/superpowers'）匹配其下所有文件
  //   - 完整相对路径（如 'docs/optimization-candidates.md'）精确匹配
}
```

`src/generator.ts` — 定义发布排除清单并传入：
```ts
// template 内不该发布给用户的开发期产物模式
const PUBLISH_IGNORE = [
  'node_modules',
  'docs/superpowers',
  'docs/optimization-candidates.md',
];
copyDir(templateDir, targetDir, PUBLISH_IGNORE);
```

**匹配语义**：对每个待复制路径计算相对 `templateDir` 的 POSIX 相对路径，若以任一 ignore 条目作为目录前缀（`startsWith(pat + '/')`）或完全相等，则排除。

**双重保险**：即使未来误将 superpowers 文档放回 `template/`，发布链路也会排除，不再泄漏。

### 4. 验证

- **现有测试保持绿色**：仓库根 `tests/`（`cli.test.ts`、`scaffold-core/*` 等）不因删除/合并而失败；template 内随模板发布的 `.spec.ts`（如 `useSpin.spec.ts`）同样保持绿色。
- **新增断言**：在 `tests/cli.test.ts`（或新增发布契约测试）中验证——生成产物中 `docs/superpowers/` 不存在、`optimization-candidates.md` 不存在。
- **手动核验**：dry-run 生成一个临时项目，确认无开发期文档泄漏。

## 不动清单

- 根目录全部配置文件（`package.json` / `tsconfig*` / `vite.config.ts` / `vitest.config.ts` / `eslint.config.mjs` / `.prettierrc.json` / `.gitignore` / `env.d.ts` / `index.html` / `pnpm-lock.yaml` / `.env.development.example`）
- Readme 查看器文档源（`README.md` / `ARCHITECTURE.md` / `design.md` / `theme.md`）
- `@google/design.md` 主题源（`design.md`）与导出产物（`theme.tokens.json`）
- `AGENTS.md`（根目录 AI 协作指引）
- `src/` 全部结构
- `template/docs/` 下保留的用户文档（`MIGRATION.md` / `CODING_STANDARDS.md`）

## 风险与缓解

| 风险 | 缓解 |
|---|---|
| ARCHITECTURE 合并遗漏独有内容 | 逐节对比 + git 历史可追溯 |
| 黑名单需手动维护，可能漏配 | 低频场景；新增断言兜底，发布产物不含开发期文件即测试失败 |
| copyDir ignore 语义误判（如误排同名合法文件） | 仅匹配明确的开发产物路径前缀，范围窄 |

## 决策记录

| 决策点 | 选择 | 理由 |
|---|---|---|
| `docs/superpowers/` 3 文件 | 直接删除 | git 历史留存，openspec 承载正式变更，删除最干净 |
| 发布排除机制形式 | 代码内黑名单常量 | 简单直接，无需解析逻辑（YAGNI） |
| 根目录是否归类 | 不归类 | 文档是查看器内容源、配置必须居根，归类破坏功能 |
