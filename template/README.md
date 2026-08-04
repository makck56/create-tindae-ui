# Tindae UI App

这是由 `create-tindae-ui` 生成的 Vue 3 企业后台模板项目。模板已经内置登录、权限、菜单、标签页、主题、Mock、表格、图表和业务模块生成器，可以直接作为后台应用起点。

## 环境要求

- Node.js `^20.19.0 || >=22.12.0`
- 推荐使用 `pnpm`
- 推荐 IDE：VS Code + Vue - Official、ESLint、Prettier

## 快速启动

```bash
pnpm install
pnpm dev
```

开发服务默认运行在 `http://localhost:3000`。

开发态登录说明：

- 用户名可用 `admin`、`manager`、`viewer`，用于观察不同权限效果。
- 密码任意。
- 验证码按图片显示内容填写。
- 登录后菜单和权限由 MSW mock 返回。

## 技术栈

本节按当前 `package.json` 的真实依赖声明维护。

| 类别 | 当前依赖 / 能力 |
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
| 工程规范 | `eslint@^10.0.0`、`eslint-plugin-vue@^10.0.0`、Flat Config（`eslint.config.mjs`）、`prettier@^3.3.0` |

## 命令

| 命令 | 作用 |
| --- | --- |
| `pnpm dev` | 启动开发服务 |
| `pnpm build` | 生产构建 |
| `pnpm preview` | 预览生产构建产物 |
| `pnpm lint` | ESLint 修复并格式化 `src/**/*.{vue,ts,css}` |
| `pnpm test` | 运行单元测试 |
| `pnpm test:watch` | Vitest 监听模式 |
| `pnpm tokens:export` | 从 `design.md` 导出主题 token 适配文件 |
| `pnpm tokens:check` | 校验主题 token 和 Tailwind 适配一致性 |
| `pnpm scaffold` | 查看业务脚手架帮助 |
| `pnpm scaffold:domain` | 创建业务域 |
| `pnpm scaffold:feature` | 在已有业务域下创建特性或页面 |
| `pnpm template:check` | 模板发布前健康检查，串联 token、测试、构建和脚手架 dry-run |

## 目录结构

```text
src/
├── core/                 # 应用启动、HTTP、路由、主题、插件初始化
├── layouts/              # 默认后台布局、标签页、KeepAlive
├── modules/              # 跨页面业务模块，如 auth、app
├── shared/               # 通用组件、composables、常量、工具
├── pages/                # 业务页面域
├── mock/                 # MSW handlers 和 mock 数据
└── assets/styles/        # global.css、tailwind.css、theme.tailwind.css、variables.css
```

建议依赖方向：

```text
pages -> modules -> shared -> core
```

页面私有逻辑放在 `src/pages/<domain>/features/` 下；跨页面复用能力放在 `modules` 或 `shared`；`shared` 不反向依赖具体业务页。

## 内置页面

| 路径 | 说明 |
| --- | --- |
| `/login` | 登录页，包含验证码和 RSA 加密演示 |
| `/user-management` | 用户管理列表示例 |
| `/role-management` | 角色管理列表示例 |
| `/theme-preview` | 主题预览页，仅开发态注册 |
| `/readme` | 应用内 README 展示页，仅开发态注册 |
| `/403`、`/404` | 错误页 |

## 业务开发

创建新业务域：

```bash
pnpm scaffold:domain
```

在已有业务域下创建新特性或页面：

```bash
pnpm scaffold:feature
```

生成后重点检查四个名字是否一致：

- `*.routes.ts` 里的路由 `name`
- `.page.vue` 里的 `defineOptions({ name })`
- `menu.config.ts` 里的 `routeName`
- `menu.config.ts` 里的权限 `code`

使用 `pnpm scaffold:feature` 创建页面时，脚手架会把 domain 名拼入新增 feature 的路由名。例如在 `sales` 域下创建 `order` 特性，默认路由名为 `SalesOrder`，避免不同域下同名 feature 发生 Vue Router `name` 冲突。

开发态 mock 的菜单和权限来自 `src/modules/app/config/menu.config.ts`，因此菜单配置错误通常会表现为菜单不显示或路由进入 `/403`。

## Mock

模板开发态默认使用 MSW：

- `src/main.ts` 在 `import.meta.env.DEV` 下启动 worker。
- `public/mockServiceWorker.js` 会绕过同源非 `/api/` 请求，避免拦截 Vite 源码模块、HMR 和静态资源。
- 未匹配的 `/api/...` 请求会由 fallback handler 返回结构化 404。

新增业务 API 时，优先在 `src/mock/handlers/` 增加 handler，并在 `src/mock/handlers/index.ts` 聚合。

## 接真实后端

接真实接口时建议按这个顺序处理：

1. 在 `vite.config.ts` 增加 `server.proxy`。
2. 在 `src/main.ts` 增加环境变量开关控制是否启动 MSW。
3. 确认后端响应结构适配模板约定的 `{ code, data, message }`。
4. 如果后端结构不同，调整 `src/core/http/` 的拦截器或统一转换层。

## 主题

模板使用 Tailwind CSS v4：

- 样式入口为 `src/assets/styles/tailwind.css`。
- Tailwind token 通过 `src/assets/styles/theme.tailwind.css` 的 `@theme inline` 暴露。
- 运行时主题变量由 `src/assets/styles/variables.css` 和 `src/core/theme/` 管理。
- `/theme-preview` 用于验证 Tailwind、Ant Design Vue、VXE Table、ECharts 的主题联动。

不再使用 `tailwind.config.js`、`postcss.config.js` 和 `@tailwind base/components/utilities` 这套 Tailwind v3 入口。

## 图表

图表统一使用 `src/shared/components/BaseChart/index.vue`：

- BaseChart 封装 `vue-echarts`。
- ECharts 6 的 `CanvasRenderer` 和内置图表类型在 BaseChart 模块加载时注册。
- 业务图表需要提供稳定高度，避免 autoresize 形成高度反馈。

新增图表类型时，优先扩展 BaseChart 中的 ECharts 注册清单。

## 更多文档

- [ARCHITECTURE.md](ARCHITECTURE.md)：架构说明。
- [docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md)：编码规范。
- [docs/MIGRATION.md](docs/MIGRATION.md)：迁移说明。
- [theme.md](theme.md)：主题系统说明。

## License

MIT
