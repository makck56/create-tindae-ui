---
name: tindae-conventions
description: Use when writing or modifying any code in this Vue 3 project - enforces layered architecture, naming conventions, file structure, and data flow rules
---

# Tindae 前端工程约束

## 分层与依赖方向

四层架构，依赖**只能向下**，严禁反向：

| 层级 | 目录 | 能引用 |
|:---|:---|:---|
| core | 应用启动、插件、HTTP 封装 | 被任何层使用 |
| shared | 无业务的通用工具 (utils, ui-kit) | 只能引用 core |
| modules | 跨域复用的业务模块 (auth) | shared |
| pages | 具体业务功能 | modules、shared |

```
pages → modules → shared → core
```

## Page / View 分离

- **`.page.vue`**（路由壳）：只用 `useRoute()` 取参数，传 props 给 View。禁止业务逻辑和 API 调用。
- **`.view.vue`**（业务核）：组合 composables 和 components，处理 UI 交互、loading/error 状态。不直接调 `http.get`。
- View 与路由解耦，可被弹窗、侧边栏等场景复用。

## 数据流

单向流：`View → Composable → API → HTTP`

| 层 | 职责 | 禁止 |
|:---|:---|:---|
| API 层 (`*.api.ts`) | 定义接口、参数类型，返回 Promise | 禁止 `Message.error`、Router 引用 |
| Composable 层 | 业务逻辑、loading/error 状态、UI 反馈 | — |
| View 层 | 组合 composables + components | 禁止直接调 `http` |

## 命名规范

| 场景 | 命名风格 | 示例 |
|:---|:---|:---|
| 文件夹 | kebab-case | `data-source-management` |
| Vue 组件 | PascalCase | `DataSourceList.page.vue` |
| TS 逻辑文件 | camelCase | `useDataSource.ts` |
| TS 类/模型 | PascalCase | `DataSource.ts` |
| API 文件 | `.api.ts` 后缀 | `dataSource.api.ts` |
| 枚举源 | 大驼峰对象 + 全大写 Key | `FieldTypes.TEXT` |
| 选项数组 | 大驼峰 + Options 后缀 | `FieldTypeOptions` |
| 单值常量 | SNAKE_UPPER_CASE | `DEFAULT_PAGE_SIZE` |

## 业务域结构

```
pages/{domain}/
├── {domain}.routes.ts        # 域路由定义
├── pages/                    # 薄路由壳 .page.vue
├── features/{feature}/
│   ├── views/                # .view.vue 业务视图
│   ├── components/           # 私有 UI 组件 (按 list/detail/shared 拆子目录)
│   ├── composables/          # 业务逻辑
│   ├── api/                  # API 定义 (*.api.ts)
│   ├── models/               # 类型定义 (允许 index.ts)
│   ├── constants/            # 常量
│   ├── utils/                # 纯函数工具
│   └── assets/               # 特性独有静态资源
└── shared/                   # 域内多特性共享资源
```

## Barrel Files (index.ts) 规则

| 目录 | index.ts | 原因 |
|:---|:---|:---|
| components/ | **禁止** | 强迫完整路径，防止跨边界引用 |
| composables/ | **不推荐** | 显式路径避免循环依赖 |
| api/ | **禁止** | 防止循环依赖 |
| models/ | **允许** | 类型编译后消失，无运行时风险 |
| modules/ 根目录 | **允许** | Module 是黑盒，必须暴露 Public API |

## KeepAlive 约束

- `Route.name` 必须等于 `Component.name`
- `.vue` 中必须用 `defineOptions({ name: 'Xxx' })` 显式声明
- 组件名全局唯一，使用字符串字面量（禁止引用常量定义 name）

## 跨域交互

域之间**禁止直接 import**，使用三种方式：

1. **路由跳转**：`router.push()` + 自动生成的 `AppRouteNames` 常量
2. **逻辑复用**：下沉到 `modules/`
3. **数据同步**：通过 Global Store 中转

## 状态管理优先级

`ref()/reactive()`（局部） > 域内共享 composable > Pinia 全局 Store

能用 `ref()` 解决的不上 Pinia。全局 Store 必须使用 Setup Store 语法。

## 文案管理

不使用 i18n。所有 UI 文案提取到 `src/shared/constants/copy.ts`，使用 `as const`。禁止在模板中硬编码中文字符串。

## 样式

组件必须使用 `<style scoped>`。UI 库覆盖优先使用 ConfigProvider，其次全局覆盖样式，慎用 `:deep()`。

## 极简模式

小型特性允许简化（composables 逻辑写在 .view.vue、内联类型），但：
- **API 必须独立**：禁止在 `.vue` 中直接写 `http.get`
- View 超过 **300 行**或出现重复逻辑时，必须重构为标准结构
