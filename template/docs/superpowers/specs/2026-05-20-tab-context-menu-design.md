# 标签页右键菜单 & 自定义标签列表

## 概述

替换 antd `a-tabs` 组件为自定义横向标签列表。新增右键菜单，包含刷新和关闭操作。将标签唯一标识从路由名称改为路由路径，以支持同路由多标签页（如详情页）。新增访问顺序追踪，关闭标签后跳转到上一个访问的标签。

## 设计决策

- **标签唯一键**：`route.path`（包含 params，不含 query）。`/order/123` 和 `/order/456` 是独立标签，`_tabTitle` query 参数不影响标签唯一性。
- **动态标签标题**：通过 `router.push({ query: { _tabTitle: '...' } })` 传递。回退顺序：`_tabTitle` → `route.meta.title` → `route.name`。
- **关闭后导航**：用 `visitedOrder: string[]` 记录访问顺序。关闭时从 `visitedOrder` 倒序找到仍在标签列表中的上一个标签作为跳转目标。兜底跳 `/`。
- **右键菜单触发**：每个标签包裹 `a-dropdown`，`trigger="['contextmenu']"`。
- **视觉风格**：胶囊标签。激活标签：`bg-primary text-white`。非激活：`bg-gray-100 text-gray-700`。hover 高亮。

## Store 变更 (`src/layouts/tab/tab.ts`)

### TabItem 接口

```typescript
export interface TabItem {
  key: string;       // route.path — 唯一标识
  name: string;      // route.name — 供 KeepAlive include 匹配
  path: string;      // route.fullPath — 用于导航
  title: string;     // _tabTitle query ?? meta.title ?? route.name
  keepAlive: boolean;
}
```

### State 变更

- `activeTab` — 改为存储 `key`（route.path），不再存 `route.name`
- 新增：`visitedOrder: string[]` — 按访问时间排列的标签 key 列表（最新的在末尾）

### addTab 变更

- 用 `route.path` 作为 key 去重（替代 `route.name`）。同名路由不同参数会创建独立标签。
- 标题解析：`route.query._tabTitle ?? route.meta.title ?? route.name`
- 将 key 推入 `visitedOrder`（如已存在则移到末尾）

### closeTab 变更

- 参数从 `name: string` 改为 `key: string`
- 移除标签后，倒序遍历 `visitedOrder` 找到第一个仍在 `tabs` 中的 key 作为导航目标。找不到则跳 `/`
- 从 `visitedOrder` 中清理已移除的 key

### 新增 actions

- `closeLeftTabs(key: string, router: Router)` — 关闭 `key` 左侧所有标签，激活 `key`，清理 `visitedOrder`
- `closeRightTabs(key: string, router: Router)` — 关闭 `key` 右侧所有标签，激活 `key`，清理 `visitedOrder`

### 已有 action 变更

- `closeOtherTabs(key: string)` — 参数从 `name` 改为 `key`，清理 `visitedOrder`
- `closeAllTabs(router: Router)` — 清空 `visitedOrder`
- `refreshTab(key: string)` — 参数从 `name` 改为 `key`，KeepAlive 排除仍使用 tab 的 `name` 字段

### cachedNames getter

不变。仍返回 `tab.name`（route.name）供 KeepAlive `include` 匹配。同名路由多标签共享同一个 KeepAlive 缓存实例。

## 组件变更 (`src/layouts/tab/TabBar.vue`)

### 移除

- `a-tabs`（editable-card 类型）
- 独立刷新按钮

### 新增：自定义标签列表

横向胶囊标签列表，每个标签包含：
- 标题文字
- 关闭图标（×）— 仅在标签数 > 1 时显示

布局：
```
┌─────────┐  ┌───────────────┐  ┌──────────┐
│ 首页    │  │ 订单 #123 详情×│  │ 用户管理 ×│
└─────────┘  └───────────────┘  └──────────┘
   ^激活          ^非激活          ^非激活
```

- 激活标签：填充背景（主题色），白色文字
- 非激活标签：浅灰背景，深色文字
- Hover：背景色加深
- 关闭图标：hover 时显示，或标签数 > 1 时始终显示
- 容器：横向 flex 布局，overflow-x auto 横向滚动

### 新增：右键菜单

每个标签包裹 `a-dropdown`，`trigger="['contextmenu']"`。

菜单项（5 项）：

| 菜单项 | 操作 | 禁用条件 |
|--------|------|----------|
| 刷新 | `refreshTab(key)` | 非 keepAlive 标签 |
| 关闭 | `closeTab(key, router)` | 仅剩 1 个标签 |
| 关闭左侧 | `closeLeftTabs(key, router)` | 左侧无标签 |
| 关闭右侧 | `closeRightTabs(key, router)` | 右侧无标签 |
| 关闭其他 | `closeOtherTabs(key)` | 仅剩 1 个标签 |

"关闭左侧/右侧/其他"后，右键点击的标签保持激活。
"关闭"后，通过 `visitedOrder` 跳转到上一个访问的标签。

## 变更文件

| 文件 | 变更内容 |
|------|----------|
| `src/layouts/tab/tab.ts` | TabItem 接口、store state/actions/getters |
| `src/layouts/tab/TabBar.vue` | 替换 a-tabs 为自定义标签列表 + 右键菜单 |

## 不变文件

- `Default.layout.vue` — KeepAlive `:include` 绑定 `cachedNames`，仍返回 route name
- 路由配置 — 无需改动，`_tabTitle` 由调用方按需传递
