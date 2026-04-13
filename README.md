# 前端架构设计指南

**版本**: 2.5  
**最后更新**: 2025-12

本文档是项目的前端架构门户。详细规范请参考 `docs/` 目录下的文档。

## 📚 文档索引 (Documentation Index)

| 文档 | 描述 | 适用人群 |
| :--- | :--- | :--- |
| [**架构白皮书**](docs/ARCHITECTURE.md) | 设计哲学、分层架构、依赖规则 | 架构师、Tech Lead、新成员 |
| [**开发规范手册**](docs/CODING_STANDARDS.md) | 命名规范、代码实现细节、目录深度约束 | **所有开发者 (必读)** |
| [**迁移指南**](docs/MIGRATION.md) | 旧项目迁移策略、共存方案 | 负责重构的开发者 |

---

## 1. 快速上手 (Getting Started)

### 1.1. 技术栈 (Tech Stack)

*   **核心框架**: [Vue 3](https://vuejs.org/) (Composition API)
*   **构建工具**: [Vite](https://vitejs.dev/)
*   **语言**: [TypeScript](https://www.typescriptlang.org/) (严格模式)
*   **状态管理**: [Pinia](https://pinia.vuejs.org/)
*   **路由**: [Vue Router](https://router.vuejs.org/)
*   **代码规范**: ESLint + Prettier + Commitlint

### 1.2. 安装与运行

确保本地 Node.js 版本 >= 18.0.0，推荐使用 `pnpm`。

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产环境
pnpm build

# 代码格式化与检查
pnpm lint
```

### 1.3. 快速生成工具 (Scaffolding)

本项目提供了自动化脚本，用于快速生成符合架构规范的 Domain 和 Feature 目录结构。

```bash
# 创建新的业务域 (Domain)
# 包含: 路由定义、Page Shell、基础 Feature 结构
pnpm scaffold:domain

# 在现有域下创建新特性 (Feature)
# 包含: View, Composable, API, Model, Constants
pnpm scaffold:feature
```

## 2. 目录结构总览 (The "What")

```text
src/
├── assets/                 # 【全局资源】仅存放全站通用的静态资源
├── core/                   # 【应用基建】项目的“骨架”与启动逻辑
├── layouts/                # 【全局布局】路由的直接容器
├── shared/                 # 【通用底层】纯净的、无业务属性的工具箱 (严禁引用 pages/modules)
├── modules/                # 【全局业务】跨域复用的业务模块 (如 Auth, Notification)
├── pages/                  # 【业务域】所有业务代码的根目录
│   └── [domain]/           # 示例：data-source-management
│       ├── pages/          # 1.【路由页】极薄的 .page.vue 路由入口
│       ├── features/       # 2.【特性核】所有业务逻辑的实现 (View, API, Store)
│       ├── shared/         # 3.【域内共享】仅供本域内部特性共享的资源
│       └── [domain].routes.ts # 4.【域路由】本域的路由定义
├── types/                  # 【全局类型契约】
├── App.vue                 # 根组件
├── main.ts                 # 入口文件
└── router/                 # 路由组装
```

## 3. 协作工作流 (Collaboration Workflow)

### 3.1. Git 提交规范

本项目启用 Commitlint，提交信息必须遵循 Conventional Commits 标准：

`type(scope): subject`

*   `feat`: 新增功能
*   `fix`: 修复 Bug
*   `refactor`: 代码重构
*   `docs`: 文档变更
*   `style`: 格式调整
*   `chore`: 构建过程或辅助工具变动

**示例**：`feat(datasource): add connection test button`

### 3.2. IDE 配置

为确保“保存即格式化”，所有开发者必须安装以下 VS Code 插件：

1.  **Vue - Official (Volar)**
2.  **ESLint**
3.  **Prettier**
