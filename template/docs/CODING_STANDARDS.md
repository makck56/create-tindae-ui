# 开发规范手册 (Coding Standards)

本文档规定了项目中的命名规范、代码实现细节以及目录深度约束，是日常开发的执行标准。

## 1. 命名规范 (Naming Conventions)

为了保证类型系统的健壮性和代码的可读性，本项目采用以下 TypeScript 命名与 `as const` 约定。

### 1.1. 文件与目录命名 (File & Directory Naming)

*   **文件夹 (Folders)**: `kebab-case` (全小写，中划线连接)。
    *   理由：跨操作系统兼容性最好。
    *   示例：`data-source-management`, `ui-kit`, `components`
*   **Vue 组件 (`.vue`)**: `PascalCase` (大驼峰)。
    *   理由：与组件引用 `<MyComponent />` 保持一致，便于编辑器识别。
    *   示例：`DataSourceList.page.vue`, `UserProfile.vue`
*   **TS/JS 逻辑文件 (`.ts/.js`)**: `camelCase` (小驼峰)。
    *   理由：通常导出函数或实例，文件名与导出变量名一致。
    *   示例：`useWindowSize.ts`, `formatDate.ts`, `main.ts`
*   **TS 类/模型文件 (`.ts`)**: `PascalCase` (大驼峰)。
    *   理由：导出 Class 或 Type 时，文件名应与类名一致。
    *   示例：`User.ts`, `HttpService.ts`

### 1.2. `as const` 枚举源 (替代 enum)

*   **场景**：一组离散的值，用来派生联合类型，并在代码中像枚举一样使用。
*   **对象名**：大驼峰 + 复数 (PascalCase + Plural)，表示“一组值的集合”。
*   **属性名**：全大写 (UPPER_CASE)，表示“枚举标签”。

```typescript
// 定义
export const FieldTypes = {
  TEXT: "text",
  NUMBER: "number",
  IP: "ip",
  DICT: "dict",
} as const;

// 派生类型
export type FieldType = (typeof FieldTypes)[keyof typeof FieldTypes];

// 推荐：三位一体 (值 + 类型 + 选项)
// src/pages/user/shared/models/UserStatus.ts
export const UserStatuses = { ACTIVE: 'active', INACTIVE: 'inactive' } as const;
export type UserStatus = (typeof UserStatuses)[keyof typeof UserStatuses];
export const userStatusOptions = [
  { label: '启用', value: UserStatuses.ACTIVE },
  { label: '禁用', value: UserStatuses.INACTIVE },
];

// 使用
function isIpField(fieldType: FieldType) {
  return fieldType === FieldTypes.IP;
}
```

### 1.3. Options / 下拉选项常量

*   **场景**：UI 组件使用的选项数组，通常结构为 `{ label, value }[]`，常由枚举源派生。
*   **变量名**：大驼峰 + Options/List/Items 后缀。
*   **示例**：`FieldTypeOptions`, `ServerStatusOptions`。

```typescript
export const FieldTypeOptions = [
  { label: "文本", value: FieldTypes.TEXT },
  { label: "数字", value: FieldTypes.NUMBER },
  { label: "IP 地址", value: FieldTypes.IP },
] as const;
```

### 1.4. 单个配置常量 / 环境常量

*   **场景**：接口地址、超时时间、默认分页大小等“单个固定值”。
*   **变量名**：全大写 + 下划线 (SNAKE_UPPER_CASE)。
*   **示例**：`API_BASE_URL`, `DEFAULT_PAGE_SIZE`, `MAX_RETRY_COUNT`。

### 1.5. 缓存与组件命名规范 (KeepAlive)

为了确保 `<KeepAlive>` 正常工作，必须遵循以下严格约定：

1.  **一致性**：**`Route.name` 必须等于 `Component.name`**。
2.  **显式定义**：在 `.vue` 文件中必须使用 `defineOptions` 显式声明组件名。
3.  **唯一性**：组件名必须是全局唯一的 PascalCase（如 `UserList`）。
4.  **字面量**：禁止在 Page 组件内引用 `AppRouteNames` 定义 name (避免循环依赖)，必须使用字符串字面量。

```typescript
// 路由定义
{
  path: '/user/list',
  name: 'UserList', // ✅ 与组件名一致
  component: () => import('./UserList.view.vue')
}
```

```vue
<!-- 组件定义 -->
<script setup lang="ts">
defineOptions({ name: 'UserList' }); // ✅ 显式声明
</script>
```

### 1.6. 普通变量、函数与类型 (Variable Naming)

*   **PascalCase (大驼峰)**: 用于 “定义/模具” (Class, Type, Component, Options, Enum)。
*   **UPPER_CASE (全大写)**: 用于 “配置/天条” (不可变的默认配置 `DEFAULT_CONFIG`)。
*   **camelCase (小驼峰)**: 用于 “实例/数据” (Reactive State, Variables)。

### 1.7. 命名速查表

| 场景 | 命名风格 | 示例 | 备注 |
| :----- | :------------------- | :------------------ | :-------------------- |
| 文件夹 | kebab-case | `ui-kit` | 跨平台兼容 |
| Vue 组件 | PascalCase | `UserProfile.vue` | 组件即类 |
| 逻辑文件 | camelCase | `useAuth.ts` | 导出函数/实例 |
| 枚举源 | 大驼峰 (对象) + 全大写 (Key) | `FieldTypes.TEXT` | 用于 `as const` 和类型派生 |
| 选项数组 | 大驼峰 + Options 后缀 | `FieldTypeOptions` | 用于 `<Select>` 等 UI 组件 |
| 单值常量 | 全大写下划线 | `DEFAULT_PAGE_SIZE` | 配置、环境量 |
| 函数/变量 | 小驼峰 | `validateIp` | 业务逻辑 |
| 组件/类型 | 大驼峰 | `FieldSchema` | 组件名或 TypeScript 类型 |

## 2. 开发实现规范 (Implementation Guidelines)

目录结构定义了“代码放哪里”，本章规定“代码怎么写”，以确保团队协作的一致性。

### 2.1. 网络请求与数据流

我们遵循 `View -> Composable -> API` 的单向数据流。

#### 2.1.1. API 文件命名与后缀
*   **必须使用 `.api.ts` 后缀**。
    *   理由：在 IDE 标签页中区分 `User.ts` (Model) 和 `user.api.ts` (API)；支持模糊搜索 `user api`。
*   **导入路径**：`import { getUser } from '../../api/user.api';` (保留后缀，显式优于隐式)。

#### 2.1.2. API 层 (`features/.../api/`)

*   **职责**：仅负责定义 API 接口和参数类型。
*   **原则**：纯函数。严禁在 API 中引入 Router 或 UI 弹窗（Message）。UI 逻辑应归还给视图层或拦截器。
*   **类型契约**：所有请求必须定义明确的响应类型（DTO）。

```typescript
// ✅ 正确示例
import { http } from '@/core/http';
import type { DataSource, CreateDataSourceParams } from '../models/dataSource';

export const createDataSource = (params: CreateDataSourceParams) => {
  // 泛型 Result<T> 来自全局 types/api.d.ts
  return http.post<Result<DataSource>>('/api/datasource', params);
};
```

#### 2.1.3. Composable 层 (`features/.../composables/`)

*   **职责**：处理业务逻辑、状态 loading、错误捕获。
*   **原则**：将 API 返回的 Promise 转换为响应式状态。
*   **内部常量**：如果常量（如默认防抖时间）仅服务于本 Composable，**严禁** 移入 `shared/constants`，应直接写在文件内部并导出。

```typescript
// ✅ 正确示例
const create = async (params: CreateDataSourceParams) => {
  loading.value = true;
  try {
    await dataSourceApi.createDataSource(params);
    Message.success('创建成功'); // UI 反馈在这里处理
  } catch (err) {
    // 特定业务错误在这里处理，通用 500 错误由 Axios 拦截器处理
    console.error(err);
  } finally {
    loading.value = false;
  }
};
```

### 2.2. 状态管理决策 (State Management)

并非所有状态都需要 Pinia。请遵循以下决策优先级：

1.  **局部状态 (Local State)**：**优先使用**。
    *   **场景**：表单数据、弹窗显隐、Loading 状态。
    *   **实现**：直接在 `.vue` 或 composables 中使用 `ref`, `reactive`。
2.  **域内共享状态 (Domain State)**：**推荐**。
    *   **场景**：同一业务域内多个页面共享的数据（如“多步骤表单”数据）。
    *   **实现**：在 `pages/{domain}/shared/composables/` 中创建 `use{Domain}State.ts` (利用闭包实现单例) 或使用 Pinia Store 但仅在该域内引用。
3.  **全局状态 (Global State)**：**谨慎使用**。
    *   **场景**：用户信息 (`UserStore`)、权限 (`AuthStore`)、跨页面的购物车、全局主题配置。
    *   **位置**：`src/modules/{moduleName}/{Module}Store.ts`。
    *   **语法**：必须使用 Setup Store 语法 (`defineStore(() => { ... })`) 以保持与 Composition API 风格一致。

### 2.3. 样式解决方案 (Styling Strategy)

*   **组件样式**：必须使用 `<style scoped>` 防止污染。推荐使用 **CSS 变量** 维持主题一致性。
*   **UI 库覆盖 (Overrides)**：
    *   **Level 1 (推荐)**：使用 UI 库提供的 ConfigProvider (Design Tokens)。
    *   **Level 2 (推荐)**：在 `src/shared/ui-kit/styles` 中编写全局覆盖样式。
    *   **Level 3 (慎用)**：在组件内部使用 `:deep(.ant-btn) { ... }`。仅限于该组件特有的微调。

### 2.4. 引用与导出规范 (Import & Export Standards)

在 v2.3 架构中，对于 `features/{featureName}` 内部的 `components`, `composables`, `api` 等目录，**原则上不推荐**使用 `index.ts` 进行“全量导出” (Barrel Files)。

#### 2.4.1. 为什么禁止 Barrel Files？

1.  **破坏物理隔离**：显式的长路径（如 `../../list/Filter.vue`）能提醒开发者注意架构边界，防止私有组件被跨目录滥用。`index.ts` 的便捷性会掩盖这种边界。
2.  **循环依赖 (Circular Dependencies)**：这是工程上的最大痛点。Vite/Webpack 处理嵌套的 `index.ts` 导出时容易产生循环引用，导致 HMR 失效或运行时错误。显式路径引入是解决此问题的最有效手段。
3.  **构建性能**：过多的 Re-export 会增加构建工具的解析开销，影响 Tree-shaking 效果。

#### 2.4.2. 具体规则

*   **Components**: **禁止**使用 `index.ts`。请保持目录深度，强迫感知组件归属。
*   **Composables**: **不推荐**。请直接引用具体文件：`import { useX } from './useX'`。
*   **API / Services**: **禁止**。必须显式路径引用 (如 `../../api/user.api`) 以防止循环依赖。
*   **Models / Types**: **允许**。类型定义在编译后消失，不会导致运行时循环依赖，且聚合导出有利于 DTO 复用。

#### 2.4.3. 特权例外 (Privileged Exception)
在 **`src/modules`** 的 **根目录**：
*   ✅ `src/modules/auth/index.ts`
*   **理由**：Module 是黑盒，必须通过根目录的 `index.ts` 定义对外暴露的 Public API。

> **核心原则**：显式优于隐式 (Explicit is better than Implicit)。多敲几个字符的路径，换来的是架构的清晰和零循环依赖的安稳。

### 2.5. 文案管理 (Copywriting Management)

本项目**不使用** i18n 国际化库。为了保持文案的统一管理和类型安全，我们采用 **常量字典模式 (Constant Dictionary Pattern)**。

*   **原则**：所有 UI 文案（按钮文字、提示信息、校验错误）必须提取到 `src/shared/constants/copy.ts` 中，严禁在模板中硬编码中文字符串。
*   **实现**：使用 `as const` 确保类型提示。

```typescript
// src/shared/constants/copy.ts
export const COPY = {
  COMMON: {
    CONFIRM: '确认',
    CANCEL: '取消',
  },
  LOGIN: {
    TITLE: '用户登录',
    ERROR: '密码错误',
  }
} as const;
```

*   **使用**：

```html
<template>
  <button>{{ COPY.COMMON.CONFIRM }}</button>
</template>

<script setup lang="ts">
import { COPY } from '@/shared/constants/copy';
</script>
```

### 2.6. 跨域交互规范 (Cross-Domain Interaction)

虽然架构原则禁止 `src/pages` 之间的直接代码引用，但业务上难免需要跨域交互。请遵循以下解耦方案：

#### 2.6.1. 页面跳转 (Navigation)

*   **场景**：域 A 跳转到域 B。
*   **方案**：使用 **自动生成的全局路由名称常量** 进行跳转。
    *   本项目集成了 Vite 插件，会自动扫描 `src/pages/**/*.routes.ts` 并生成 `src/shared/constants/appRouteNames.ts`。
    *   **严禁**直接引用对方的路由定义对象（会导致循环依赖）。
    *   **不推荐**手写硬编码字符串（维护成本高）。

*   **示例**：

    ```typescript
    // ✅ 正确：使用自动生成的常量 (类型安全 + 解耦)
    import { AppRouteNames } from '@/shared/constants/appRouteNames';
    
    // 支持 params 传参，且类型安全
    router.push({ 
      name: AppRouteNames.User.PROFILE, 
      params: { id: '123' } 
    });

    // ❌ 错误：导致强依赖
    import { UserRoutes } from '@/pages/user/routes';
    router.push({ name: UserRoutes.Profile });
    ```

    > **提示**: 插件会自动提取路由配置中的 `name` 属性。如果生成的 Key 不符合预期，可以在路由定义上方添加注释 `// @key: MY_KEY` 来强制指定。

#### 2.6.2. 逻辑复用 (Logic Reuse)

*   **场景**：域 A 和域 B 都需要使用同一个组件（如“用户头像”）或逻辑。
*   **方案**：**下沉到 Modules**。将该组件从 `src/pages/xxx` 移动到 `src/modules/xxx`，使其成为全局公共资源。

#### 2.6.3. 数据同步 (Data Sync)

*   **场景**：域 A 的操作需要影响域 B 的数据（如：订单支付成功 -> 更新用户余额）。
*   **方案**：**通过 Global Store 中转**。
    *   订单域调用 `useUserStore().refreshBalance()`。
    *   `UserStore` 定义在 `src/modules/user` 中，是全局可用的，因此不违反依赖规则。

### 2.7. 特性目录深度规范 (Feature Directory Standards)

本规范适用于 `src/pages/{domain}/features/{featureName}/` 下的所有子目录。

#### 2.7.1. 核心目录职责表

| 目录 | 职责 (Responsibility) | 关键约束 (Constraints) |
| :--- | :--- | :--- |
| **views/** | **特性入口**。编排 UI 和逻辑，接收 Props。 | 🚫 **禁止**与路由解耦，严禁包含 `useRouter` 跳转逻辑（应回调父级）。 |
| **components/** | **私有 UI 组件**。仅供本特性使用的 Vue 组件。 | 🚫 **禁止**导出给外部特性使用。必须按视图拆分：`list/`, `detail/`, `shared/`。 |
| **composables/** | **业务逻辑**。状态管理、副作用、复杂的业务流。 | 🚫 **禁止**使用 `index.ts` 聚合导出。测试文件 (`.spec.ts`) 必须共存。 |
| **api/** | **API 定义**。后端接口的映射。 | 🟡 **不推荐**纯函数，返回 Promise。严禁包含 UI 逻辑 (Message/Modal)。 |
| **models/** | **类型定义**。TS 接口、DTO、枚举。 | ✅ **推荐**使用 `index.ts` 聚合导出。严禁在 `index.ts` 中直接编写 interface 定义。 |
| **utils/** | **工具函数**。特性专用的纯函数。 | 🟡 **不推荐**必须是无状态的纯函数。 |
| **constants/** | **常量**。配置项、注入 Key、枚举值。 | ✅ **允许**简单值集合，允许 index 导出。 |
| **assets/** | **静态资源**。特性独有的图片/图标。 | 仅存放只在该特性中出现的资源。**推荐扁平存放**，无需再分 `images` 目录。 |

#### 2.7.2. 详细设计说明

1.  **views/ (视图层)**
    *   **命名**：`{Name}.view.vue` (如 `DataSourceList.view.vue`)。
    *   **原则**：它是“乐高积木”的成品。它不关心自己被挂载在哪个路由上，只关心传入的数据。
    *   **反模式**：不要在这里定义大量 `<script>` 逻辑，逻辑应抽离到 `composables`。

2.  **components/ (组件层)**
    建议立即建立子文件夹，防止未来增加 View 时重构路径。
    *   **结构**：

        ```text
        components/
        ├── list/           # 列表页独有的组件 (FilterBar, ListItem)
        ├── detail/         # 详情页独有的组件 (InfoCard, HistoryLog)
        └── shared/         # 特性内部通用的组件 (StatusBadge)
        ```

    *   **为什么禁止 index.ts**：为了强迫开发者在引入时写出完整路径（如 `import Filter from '../list/Filter.vue'`），从而在代码层面形成“视觉阻力”，防止详情页错误引用列表页的组件。

3.  **models/ (数据层)**
    *   **结构**：

        ```text
        models/
        ├── dataSource.ts   # 实体定义 (interface)
        ├── api.ts          # 请求参数 (DTO)
        └── index.ts        # 仅包含 export * from ...
        ```

    *   **单一职责**：`index.ts` 只负责“路标”功能（导出），具体的定义必须写在有语义的 `.ts` 文件中。

#### 2.7.3. 规范总结

*   **物理隔离优先**：对于包含运行时代码的目录（components, composables, views），**严禁**使用 Barrel Files (`index.ts`)。显式路径引用是防止循环依赖和架构腐化的最强防线。
*   **类型聚合特权**：对于纯类型定义的目录（models），**推荐**使用 `index.ts` 聚合导出。
*   **结构即约束**：看到 `models/` 必须是文件夹。看到 `components/` 必须先分 `list/detail` 文件夹。
*   **就近原则**：所有东西（测试、图片、常量、工具）如果只服务于当前特性，就必须放在当前特性的目录下，严禁“偷懒”放到全局 `src/shared` 或 `src/utils`。

#### 2.7.4. 极简模式 (Simplified Mode)

对于逻辑简单的**小型特性**（如：仅展示静态列表、无复杂交互），允许简化目录结构以降低心智负担。

**允许的简化结构**：

```text
features/simple-log/
├── views/
│   └── SimpleLogList.view.vue  # 包含逻辑、样式、简单类型定义
└── api/                        # ⚠️ 必须保留 API 层
    └── log.ts
```

**简化规则**：
1.  **合并逻辑**：允许将 `composables` 逻辑直接写在 `.view.vue` 的 `<script setup>` 中。
2.  **内联类型**：允许将简单的 interface 定义在 `.view.vue` 或 `api.ts` 中，省略 `models` 目录。
3.  **API 必须独立**：**严禁**在 `.vue` 中直接编写 `http.get` 请求。API 定义必须保留在 `api/` 目录中，以保持接口层的纯净和可维护性。
4.  **升级触发器**：当 View 文件超过 **300行** 或出现重复逻辑时，必须立即重构为标准结构。

### 2.8. 下沉与重构规范 (Refactoring Standards)

当代码从 `features` 下沉到 `domain/shared` 时，必须执行 **“去上下文 (De-contextualization)”** 操作。

#### 2.8.1. API 命名重构
*   **Feature 层**：基于“场景”命名。
    *   `management.api.ts`, `wizard.api.ts`
*   **Shared 层**：基于“实体”命名。
    *   ❌ `management.api.ts` -> ✅ `user.api.ts`
    *   ❌ `dashboard.api.ts` -> ✅ `userStats.api.ts`

#### 2.8.2. Shared API 聚合策略
*   **默认策略**：**单文件聚合 (One File Rule)**。
    *   绝大多数 CRUD 操作都应放入 `user.api.ts`。
*   **拆分策略**：仅当满足以下条件时拆分：
    1.  **子资源膨胀**：如 `userLog.api.ts` (日志独立且复杂)。
    2.  **数据性质不同**：如 `userStats.api.ts` (统计数据 vs 业务数据)。
