# 变更记录（CHANGELOG）

本文件记录 `create-tindae-ui` 脚手架项目的所有重要变更，方便回溯每次提交「做了什么、为什么做」。

格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。
每条均标注对应的 commit 短哈希（`git log --oneline` 可查）。

---

## [Unreleased] — 2026-06-17

> 本次共 **6 个 commit**，主线是让 `scaffold:domain` 命令「开箱即用」（自动接入路由 / 菜单 / mock 权限），并补齐工程化护栏（dry-run、非交互、事务回滚、单测）。另含 `create-tindae-ui` CLI 包的选项增强。

### ✨ Features（新功能）

#### `scaffold:feature` 页面类型选择（概览型 / 表格型）

`pnpm scaffold:feature` 流程新增一步「选择页面类型」，并支持非交互参数 `--type=list|overview`，按选择渲染不同模板：

| 类型 | 适用场景 | 产物 |
|------|----------|------|
| **表格型**（`list`，默认） | 增删改查（CRUD）列表 | vxe-grid 分页表格 + 状态/操作列 |
| **概览型**（`overview`） | Dashboard 看板 | KPI 统计卡片（a-statistic）+ 近期数据列表（a-table） |

- **文件名按类型后缀区分**：`{Feature}List.view.vue` / `{Feature}Overview.view.vue`；同一个 `page-list.vue.hbs` 用 `typeSuffix` 变量对两类通用
- **最小依赖**：概览型纯 Ant Design Vue 实现，不引入图表库；只读聚合接口（`get{Feature}Overview`），无 CRUD
- 改动面：`args.ts`（新增 `FeatureType` + `--type` 解析与非法值回退）、`template.ts`（派生 `typeSuffix`）、`actions.ts`（类型选择交互 + 模板路径映射）、`route-manager.ts`（page 文件名带后缀）、新增 5 个概览模板（view/composable/api/model/constants）+ 改造 `page-list.vue.hbs`
- 单测 **+8**：`--type` 解析（含非法回退）、`typeSuffix` 派生、概览/表格模板渲染区分、page 模板对两类通用（总计 53 用例全绿）

> 默认仍为 `list`，完全向后兼容——既有 `scaffold:feature` 流程与产物不变。

#### 统一请求层 `@/core/http`（axios 封装 + 可扩展）

此前每个业务 api 文件各自 `axios.create()`，缺少拦截器、token 注入、统一错误处理与类型约束。本次新增 `src/core/http/` 统一请求层：

- **按职责拆分 6 个小文件**：`types.ts`（`ApiResponse<T>` 信封 / `HttpRequestConfig` / `HttpInstance`）、`error.ts`（统一 `HttpError`，区分 HTTP 状态 / 超时 / 网络中断）、`config.ts`（`configureHttp()` 运行时依赖注入）、`interceptors.ts`（请求附 token、响应解包信封、401/超时/网络错误归一）、`instance.ts`（`createHttp()` 工厂 + 默认实例 `request`）、`index.ts`
- **核心机制**：响应拦截器自动「解壳」，封装方法直接返回 `Promise<ApiResponse<T>>`，调用方从 `const { data: res } = await x()` 简化为 `const res = await x()`
- **可扩展四重**：`configureHttp()` 注入 token/401/错误回调（避免 http ↔ router/pinia 循环依赖）、`createHttp()` 多实例、`withDefaultInterceptors=false` 自定义拦截器、单请求级 `skipAuth` / `skipErrorHandler` / `rawResponse`
- **防竞态**：`cancelPrevious` 让相同请求（method+url+params+data）自动 `AbortController` 取消旧的、只留最新，消除 Race Condition；被取消请求抛 `RequestCanceledError`（静默、不触发全局回调），配套 `skipCancel` 单请求关闭。默认 opt-in，查询 / 搜索接口按需开启（避免影响 vxe-grid 的 proxyConfig）
- **文件传输**：新增 `file-transfer.ts`，内置 `request.download` / `request.upload`。下载自动处理 blob + `content-disposition` 文件名提取（含 RFC 5987 中文）+「blob 包装的 JSON 错误」检测 + 浏览器保存 + 进度；上传支持 FormData 进度，响应走业务信封解包。配套导出 `saveBlob` / `extractFilename` 工具
- **Token 无感续期**：双 token（access + refresh）+ 主动刷新（B：请求前 token 临近过期先 refresh）+ 401 兜底（C：refresh 后重试原请求）。新增 `token-refresh.ts` 协调器——并发 refresh 单例去重、挂起重试队列、防递归（refresh 请求 `skipRefresh`、重试请求 `__refreshRetried`）。`configureHttp` 增 `refreshAccessToken` / `onTokenRefreshed` / `getRefreshToken` / `isTokenExpiring` 注入项；活跃用户 token 自动续期、仅真正闲置才过期。login 契约改为返回 `accessToken` / `refreshToken` / `expiresIn`，新增 `POST /auth/refresh`；mock 配套实现双 token + 过期校验（access 默认 2min，`VITE_MOCK_ACCESS_TTL_SEC` 可调）
- **全量接入**：`auth` / `user` / `role` 三个 api、对应 composable 与 auth store、`bootstrap` 启动注入、scaffold feature 模板（`api.ts.hbs` / `api-overview.ts.hbs` / `composable-list.ts.hbs` / `composable-overview.ts.hbs`）全部迁移；login 持久化 token、logout 加 `skipErrorHandler` 防 401 死循环
- 同步至 `demo/` 实例；README 6.5 节重写 + 修正多处「未提供请求层」的过时表述

### 🐛 Fixes（修复）

#### `scaffold:domain` 菜单恒为根级（不再选父级）

domain 是顶级业务域，其菜单语义上必须是**一级（根级）**，挂到其它菜单下当子项是错误的。故 `scaffold:domain` 不再询问父级 / 标签，直接以**域中文名**作为根级菜单项添加（`--no-menu` 仍可跳过；非交互模式照常自动加根级菜单）。

- 移除随之失去调用方的「选父级」交互：`askMenuParent`、`listMenuOptions`、纯函数 `parseTopLevelMenuLabels` 及其 4 个单测
- 连带清理：`menu-manager` 不再 import `question`（仅交互函数用过）
- 总计 53 用例全绿

> 演进说明：上一版曾用 `parseTopLevelMenuLabels` 修复「选父级时混入子菜单」的列表问题；在确定 domain 不应选父级后，该能力整体移除。

---

#### 1. `scaffold:domain` 全自动接入 + 运行期增强（`c63d4de`）

消除 README 原本记录的「三大避坑」——新域创建后**无需手改任何配置文件**：

- 自动接入根路由 `src/core/bootstrap/router.ts`
- 自动配置侧边栏菜单 `src/modules/app/config/menu.config.ts`
- 自动注入 mock 登录权限 `src/mock/handlers/auth.ts`

同时新增三项运行期能力：

| 能力 | 说明 | 触发方式 |
|------|------|----------|
| **dry-run** | 只预览写操作意图，不真正落盘 | `--dry-run` |
| **非交互 CLI** | 跳过所有提问，适合 CI / 脚本化 | `--name` `--chinese` `--feature` `--domain` `--no-menu` `--no-page` |
| **事务回滚** | 任一步骤失败时，自动还原已修改的配置文件并清理新建目录 | 失败自动触发 |

```bash
# 非交互 + 预览示例
pnpm scaffold:domain --name=order-management --chinese=订单管理 --dry-run
```

> 💡 配套：`scaffold:feature` 的菜单以该域 `routes.ts` 为单一真相源**自动重建**——仅 1 条路由→叶子（点击直接进），多条路由→父级 + 全部子项（第一项为默认特性，不再被「过滤掉」）。前端菜单组件无需改动（现有「叶子点击 / 有 children 展开」逻辑配合该数据结构即正确）。

#### 2. `create-tindae-ui` CLI 选项（`baec2a7`）

- `--package-manager=pnpm|npm|yarn`：选择依赖管理器（默认 pnpm）
- `--no-install` / `--skip-install`：跳过依赖安装
- `--skip-git`：跳过 git 初始化
- 模板目录解析改为「候选路径」机制，兼容开发态（`template/`）与发布态（`dist/template/`）两种布局

### ♻️ Refactor（重构）

#### 3. scaffold-core 注入逻辑重构（`60d48f6`）

把过去「脆弱的文本正则匹配」统一改造为「锚点 + 纯函数」模式：

- **新增 `constants.ts`**：集中所有注入锚点（`@scaffold:domain-import` 等）与项目路径，杜绝字符串散落漂移
- **新增 `patch.ts`**：提取 4 个**纯函数**（无 IO、可单测）
  - `applyDomainRouterPatch` — 根路由 import + children 接入
  - `applyRootMenuPatch` — 根级菜单项插入
  - `applyMockMenuPatch` — mock 权限码插入
  - `injectChildMenu` — 子菜单插入（用**括号深度匹配**替代会误匹配的正则）
- **新增 `types.ts`**：`PatchResult` 接口（含 `originalContent`）支撑事务回滚
- `router.ts` / `menu.config.ts` / `auth.ts` 添加 `@scaffold:*` 锚点
- 各 manager 复用 patch 纯函数、注入 `rootDir`（默认 `process.cwd()`，便于测试）
- `utils.ts` **修复 `toCamelCase`** bug（原实现会丢失中间大写字母）；收敛 `DirEntry` 类型消除 `any`
- `template.ts` 增加 Handlebars 编译缓存；`page-list.vue.hbs` 注释 path 对齐实际路由

> 这一批重构是后面 dry-run / 非交互 / 回滚能落地的基础。

### 🧪 Tests（测试）

#### 4. scaffold-core 单测套件（`5035f65`）

- 新增 `patch` / `utils` / `args` / `precheck` / `dry-run` 五套测试 + `cli.test`，共 **36 个用例全绿**
- `package.json` test 脚本接入 `node --test` + `tsx`
- 新增 `handlebars` devDependency（渲染测试依赖）
- 单测在重构阶段立功：挖出并修复了 `toCamelCase` 的潜伏 bug

### 📚 Docs（文档）

#### 5. README 重写（`d59df38`）

- 同步「三大避坑」已自动化的现状（不再需要手动改路由 / 菜单 / 权限）
- 补充 `--dry-run` 与非交互用法的示例

### 🔧 Chore（杂项）

#### 6. `.gitignore`（`eca96f9`）

- 忽略 `src/**/*.js`、`bin/**/*.js`：tsc 异常输出到源码旁的产物（正式发布产物在 `dist/`）
- 忽略 `think.md`：本地优化草稿，不入库

---

## 提交顺序（依赖关系）

```
chore(.gitignore)        挡掉编译产物 / 本地草稿
      │
feat(cli)                create-tindae-ui 包选项（独立特性线）
      │
refactor(scaffold-core)  锚点 + 纯函数（基础设施层）
      │
feat(scaffold)           全自动接入 + dry-run + 非交互（依赖上面的重构）
      │
test                     单测套件（验证 feat）
      │
docs                     README 同步（收尾）
```

---

## 如何查看本次提交

```bash
# 查看这 6 个 commit
git log --oneline -6

# 查看某次提交的完整改动（例如全自动接入那次）
git show c63d4de

# 对比「本次全部改动」相对第 6 个 commit 之前的状态
git diff c63d4de~6 HEAD --stat
```
