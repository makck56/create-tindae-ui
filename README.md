# create-tindae-ui

`create-tindae-ui` 是一个面向 Vue 3 企业后台的项目脚手架。它把仓库内的 `template/` 复制为一个可运行的后台应用，并完成项目名替换、依赖安装和可选的 Git 初始化。

当前 README 以本仓库和模板的真实代码为准，不再保留旧版文档中已经不匹配的预设、组件体系或工具链说明。

## 适用场景

- 快速生成一个 Vue 3 + TypeScript 后台项目。
- 复用模板内已经打通的登录、权限、菜单、标签页、主题、Mock、表格、图表和页面生成能力。
- 在生成项目里继续用 `scaffold:domain` / `scaffold:feature` 创建业务模块。

## 仓库和生成项目的区别

| 位置 | 作用 |
| --- | --- |
| 根目录 `package.json`、`bin/`、`src/` | 脚手架 CLI 本身，用于创建项目 |
| `template/` | 生成项目的源码模板，是运行时依赖和页面代码的主要事实来源 |
| `demo/` | 本地验证用生成项目，不随 npm 包发布 |

修改后台模板能力时，通常应该改 `template/`；修改 CLI 参数、复制流程、发布行为时，才改根目录 `src/` / `bin/`。

## 快速开始

### 使用已发布包

```bash
pnpm create tindae-ui my-project
```

也可以指定包管理器：

```bash
pnpm create tindae-ui my-project --package-manager npm
pnpm create tindae-ui my-project --package-manager yarn
```

### 从本仓库本地运行

```bash
pnpm install
pnpm build
node dist/bin/create-tindae-ui.js my-project
```

开发脚手架本身时，也可以直接跑源码：

```bash
pnpm dev my-project
```

生成完成后进入项目：

```bash
cd my-project
pnpm dev
```

开发服务默认运行在 `http://localhost:3000`。

## CLI 参数

| 参数 | 说明 | 默认值 |
| --- | --- | --- |
| `<project-name>` | 项目名，只允许小写字母、数字和连字符 | 未传时交互输入 |
| `--package-manager <pm>` | 依赖安装工具，可选 `pnpm`、`npm`、`yarn` | `pnpm` |
| `--skip-install` | 跳过依赖安装 | `false` |
| `--no-install` | `--skip-install` 的别名 | `false` |
| `--skip-git` | 跳过 `git init` 和初始提交 | `false` |

示例：

```bash
pnpm create tindae-ui my-app --skip-install --skip-git
pnpm create tindae-ui my-app --package-manager=npm
```

当前 CLI 是单模板脚手架，没有模板预设选择，也没有 `upgrade` 子命令。

## 模板技术栈

下面只列 `template/package.json` 当前真实声明的依赖，不再用旧文档里的概括口径。

| 类别 | 当前模板依赖 / 能力 |
| --- | --- |
| 运行环境 | Node.js `^20.19.0 || >=22.12.0` |
| 应用框架 | `vue@^3.5.0`、Composition API、`<script setup>` |
| 类型与构建 | `typescript@^5.5.0`、`vite@^8.1.5`、`@vitejs/plugin-vue@^6.0.8`、`vue-tsc@^2.1.0` |
| 样式系统 | `tailwindcss@^4.3.3`、`@tailwindcss/vite@^4.3.3`、CSS Variables、`@theme inline` |
| UI 组件 | `ant-design-vue@^4.2.6`、`@ant-design/icons-vue@^7.0.0`、`unplugin-vue-components@^32.0.0` |
| 表格组件 | `vxe-table@4.20.7`、`vxe-pc-ui@4.16.21`、`@vxe-ui/core@4.4.18`、`xe-utils@^4.0.11` |
| 图表组件 | `echarts@^6.0.0`、`vue-echarts@^8.0.1`、`BaseChart` 按需注册 renderer / chart / component |
| 路由与状态 | `vue-router@^4.4.0`、`pinia@^2.2.0` |
| HTTP 与登录 | `axios@^1.7.0`、`jsencrypt@^3.5.4`、图形验证码、mock token 刷新 |
| Mock | `msw@^2.14.6`，开发态默认启用，保留 `/api` fallback 诊断 |
| Markdown 文档页 | `markdown-it@^14.0.0`、`highlight.js@^11.0.0` |
| 主题 token | `@google/design.md@^0.3.0`、`design.md`、`theme.tokens.json`、`tokens:check` |
| 测试 | `vitest@^4.1.10`、`@vue/test-utils@^2.4.0`、`jsdom@^24.0.0` |
| 工程规范 | `eslint@^8.57.0`、`eslint-plugin-vue@^9.27.0`、`prettier@^3.3.0` |

## 生成项目内置页面

生成项目默认包含这些页面和能力：

- `/login`：登录页，包含图形验证码和 RSA 加密演示。
- `/user-management`：用户管理列表示例。
- `/role-management`：角色管理列表示例。
- `/order-management`：订单中心示例，包含概览、列表、Mock 数据和业务交互。
- `/theme-preview`：主题预览页，用于验证 Tailwind、Ant Design Vue、VXE Table、ECharts 的主题联动。
- `/readme`：应用内 README 展示页。
- `/403`、`/404`：错误页。

开发态登录说明：

- mock 登录不校验真实密码。
- 用户名可用 `admin`、`manager`、`viewer` 观察不同权限效果。
- 验证码需要按图片显示内容填写。
- 登录后菜单和权限来自 `src/modules/app/config/menu.config.ts` 与 MSW auth handler。

## 生成项目命令

这些命令在生成后的 `my-project/` 内执行：

| 命令 | 作用 |
| --- | --- |
| `pnpm dev` | 启动 Vite 开发服务 |
| `pnpm build` | 生产构建 |
| `pnpm preview` | 预览生产构建产物 |
| `pnpm lint` | ESLint 修复并格式化 `src/**/*.{vue,ts,css}` |
| `pnpm test` | 运行 Vitest 单测 |
| `pnpm test:watch` | Vitest 监听模式 |
| `pnpm tokens:export` | 从 `design.md` 导出主题 token 适配文件 |
| `pnpm tokens:check` | 校验主题 token 和 Tailwind 适配一致性 |
| `pnpm scaffold` | 查看业务脚手架帮助 |
| `pnpm scaffold:domain` | 创建新的业务域骨架 |
| `pnpm scaffold:feature` | 在已有业务域下创建新特性 / 页面 |

根仓库命令：

| 命令 | 作用 |
| --- | --- |
| `pnpm build` | 编译脚手架 CLI 到 `dist/` |
| `pnpm dev [name]` | 直接用 `tsx` 运行 CLI 源码 |
| `pnpm test` | 运行 CLI 和模板契约测试 |
| `npm pack --dry-run` | 发布前确认 `dist/` 和 `template/` 会被打进 npm 包 |

## 生成项目目录结构

核心结构如下：

```text
my-project/
├── build-plugins/              # Vite 插件：路由名生成、菜单可视化、renderer 定义等
├── docs/                       # 架构、编码规范、迁移说明
├── public/
│   └── mockServiceWorker.js    # MSW worker
├── scripts/
│   ├── scaffold.ts             # 业务域 / 特性生成入口
│   ├── scaffold-core/          # 生成器实现
│   └── templates/              # Handlebars 模板
├── src/
│   ├── core/                   # 应用启动、HTTP、路由、主题、插件初始化
│   ├── layouts/                # 默认后台布局、标签页、KeepAlive
│   ├── modules/                # 跨页面业务模块，如 auth、app
│   ├── shared/                 # 通用组件、composables、常量、工具
│   ├── pages/                  # 业务页面域
│   ├── mock/                   # MSW handlers 和 mock 数据
│   └── assets/styles/          # global.css、tailwind.css、theme.tailwind.css、variables.css
├── design.md                   # 设计 token 来源
├── theme.md                    # 主题系统说明
├── vite.config.ts
└── vitest.config.ts
```

依赖方向建议保持为：

```text
pages -> modules -> shared -> core
```

`shared` 不应该反向依赖具体业务页；跨业务复用能力优先放在 `modules` 或 `shared`，页面私有逻辑放在各自 `pages/<domain>/features/` 下。

## 开发新业务

推荐流程：

```bash
pnpm scaffold:domain
pnpm scaffold:feature
```

`scaffold:domain` 用于创建业务域目录和首个列表骨架。它会生成：

```text
src/pages/<domain>/
├── <domain>.routes.ts
├── pages/
├── features/<feature>/
│   ├── api/
│   ├── composables/
│   ├── constants/
│   ├── models/
│   └── views/
└── shared/
```

创建 domain 后，需要确认：

- `<domain>.routes.ts` 已接入 `src/core/bootstrap/router.ts`。
- 菜单已写入 `src/modules/app/config/menu.config.ts`。
- 路由 `name`、页面 `defineOptions({ name })`、菜单 `routeName`、权限 `code` 保持一致。

`scaffold:feature` 会在已有 domain 下继续生成 feature，并自动追加路由和菜单。新增 API 时，开发态优先补 `src/mock/handlers/` 中的 MSW handler。

## Mock 与真实后端

模板开发态默认使用 MSW，不使用 Vite `/api` mock 中间件。

当前策略：

- `src/main.ts` 在 `import.meta.env.DEV` 下启动 MSW。
- `public/mockServiceWorker.js` 会绕过同源的非 `/api/` 请求，避免拦截 Vite 源码模块、HMR 和静态资源。
- 已声明的业务 handler 优先响应。
- 未匹配的 `/api/...` 请求由 fallback handler 返回结构化 404，方便定位缺失 mock。

接真实后端时，建议先评估是否仍保留 MSW 作为开发 mock。若要切真实接口，通常需要：

1. 在 `vite.config.ts` 加 `server.proxy`。
2. 在 `src/main.ts` 增加环境变量开关控制是否启动 MSW。
3. 确认后端响应结构适配模板约定的 `{ code, data, message }`。

不要直接把 MSW 替换成 Vite mock，除非已经更新 OpenSpec、模板代码和相关文档。

## 主题系统

模板已升级到 Tailwind CSS v4：

- 样式入口使用 `@import "tailwindcss"`。
- 主题变量通过 `src/assets/styles/theme.tailwind.css` 的 `@theme inline` 暴露给 Tailwind。
- 运行时 token 在 `src/assets/styles/variables.css` 和 `src/core/theme/` 中管理。
- `theme-preview` 页面用于验证 Tailwind、Ant Design Vue、VXE Table、ECharts 的主题联动。

注意事项：

- 不再使用 `tailwind.config.js`、`postcss.config.js`、`@tailwind base/components/utilities` 这套 v3 配置入口。
- 动态拼接 class 时要确认 Tailwind v4 能扫描到完整类名。
- Ant Design Vue / VXE / ECharts 的主题桥接逻辑不要散落在业务页面中，优先走已有 theme bridge 或 BaseChart。

## 发布

发布前建议执行：

```bash
pnpm install
pnpm test
pnpm build
npm pack --dry-run
```

根 `package.json` 的发布面：

- `bin.create-tindae-ui` 指向 `./dist/bin/create-tindae-ui.js`。
- `files` 只包含 `dist` 和 `template`。
- `prepublishOnly` 会运行 `npm run build`。

更完整的 npm / Nexus 发布流程见 [docs/npm-publish-guide.md](docs/npm-publish-guide.md)。

## 常见问题

### 启动后跳登录，登录后又跳 403

检查路由 `meta.code` 是否存在于登录后返回的权限集合中。开发态 mock 的权限来源和菜单配置相关，重点看 `src/modules/app/config/menu.config.ts` 的 `code`、`routeName` 是否和路由 `name` 一致。

### 访问新页面 404 或菜单不显示

通常是三类问题：

- 新 domain routes 没接入 `src/core/bootstrap/router.ts`。
- 菜单没写入 `menu.config.ts`。
- 路由名、菜单 routeName、权限 code 不一致。

### 控制台出现 `mockServiceWorker.js: Failed to fetch`

先看请求 URL：

- 如果是 `/api/...`，通常是缺少对应 MSW handler。
- 如果是 `.vue`、`.ts`、HMR 或静态资源，刷新页面或更新 / 注销旧的 service worker。

模板当前 worker 已在 fetch 事件最前面绕过同源非 `/api/` 请求，正常情况下不应该再拦截 Vite 源码模块。

### ECharts 报 `Renderer 'undefined' is not imported`

ECharts 6 需要显式注册 renderer。模板的 `BaseChart` 已注册 `CanvasRenderer` 和内置图表类型；新增图表类型时，优先扩展 `src/shared/components/BaseChart/index.vue` 的注册清单。

### 图表不断撑高页面

给图表外层提供稳定高度，不要让 ECharts canvas 直接参与父级高度反馈。主题预览页已经用固定 viewport 处理这个问题。

## 维护约定

- 模板运行时代码以 `template/` 为准。
- `demo/` 只用于本地验证，不纳入 npm 发布面。
- 文档中出现版本号、命令、路径时，优先从 `package.json`、`template/package.json` 和真实文件树核对。
- 提交信息使用中文描述，遵循 Conventional Commits，例如 `docs: 更新 README 以匹配当前模板`。

## License

MIT
