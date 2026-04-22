# create-tindae-ui

快速搭建 Vue 3 企业级前端项目的脚手架工具。

## 快速开始

```bash
# 使用 pnpm
pnpm create tindae-ui

# 或指定项目名
pnpm create tindae-ui my-app

# 使用 npx
npx create-tindae-ui my-app
```

交互式输入项目名后，脚手架会自动完成：

1. 复制项目模板到目标目录
2. 替换 `package.json` 中的项目名称
3. 执行 `pnpm install` 安装依赖
4. 初始化 git 仓库并创建首次提交

```bash
cd my-app
pnpm dev
```

## 模板技术栈

| 类别 | 选型 |
|------|------|
| 框架 | Vue 3 + TypeScript |
| 构建 | Vite 5 |
| UI 库 | Ant Design Vue 3 |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| 样式 | Tailwind CSS 3 |
| 图表 | ECharts 5 |
| 表格 | VXE Table 4 |
| 测试 | Vitest + Vue Test Utils |
| 代码规范 | ESLint + Prettier |

## 架构概览

采用三层单向依赖架构，确保复杂度可控：

```
Pages (业务域) → Modules (全局业务) → Shared (通用底层)
```

- **Page / View 分离** — `*.page.vue` 是路由壳，极薄；`*.view.vue` 承载全部业务逻辑，与路由解耦，可跨页面复用
- **Feature 内聚** — 同一实体的列表、详情、编辑归属同一 feature，共享 API、Model、Composable
- **模块化路由** — 每个 page 目录下独立声明 `*.routes.ts`，由自定义 Vite 插件自动校验路由名称

生成的项目目录结构：

```
src/
├── main.ts                     # 应用入口
├── App.vue
├── router/                     # 路由与守卫
├── layouts/                    # 布局组件
├── core/plugins/               # 第三方库初始化配置
├── modules/
│   ├── auth/                   # 认证模块（登录/登出/权限）
│   └── app/                    # 全局状态与菜单配置
├── pages/
│   ├── login/                  # 登录页
│   ├── error/                  # 403 页
│   └── user-management/        # 示例业务页
├── shared/
│   ├── ui-kit/                 # UI 增强（composables / 样式覆盖）
│   ├── utils/                  # 通用工具函数
│   └── constants/              # 常量与路由名称
└── build-plugins/              # 自定义 Vite 插件
    ├── vite-plugin-route-names # 路由名称自动生成与校验
    └── menu-visualizer         # 菜单配置可视化调试
```

## 自定义 Vite 插件

### vite-plugin-route-names

扫描 `src/pages/**/ *.routes.ts`，自动生成 `src/shared/constants/routeNames.ts`，确保路由名称与菜单配置保持同步。支持 CLI 校验和自动修复。

### menu-visualizer

开发模式下启动可视化面板，展示菜单配置与路由的对应关系，方便调试菜单权限。

## 本地开发（脚手架本身）

```bash
pnpm install
pnpm dev my-test-app
```

## License

MIT
