# Keep-Alive + 标签页功能设计

## 概述

为 layout 内的页面添加 Keep-Alive 缓存和多标签页切换功能。通过路由 `meta.keepAlive` 控制是否缓存，Tab 功能作为独立模块可整体禁用。

## 核心设计

### 禁用方式

Tab 功能通过 `setupTab(router)` 在 bootstrap 中注册。不调用即完全禁用——无 store、无路由 hook、无 tab 栏渲染、无缓存。

### Route Meta

```ts
// src/core/types/global.d.ts
declare module 'vue-router' {
  interface RouteMeta {
    code?: string;
    keepAlive?: boolean;
    title?: string;
  }
}
```

- `keepAlive: true` — 允许缓存，tab 关闭时销毁
- 不写或 `false` — 不缓存
- `title` — tab 栏显示文本

### Tab Store

文件：`src/layouts/stores/tab.ts`

```ts
interface TabItem {
  name: string    // 路由 name = 组件 name = KeepAlive include key
  path: string    // route.fullPath，用于导航
  title: string   // 显示文本，优先 meta.title，fallback route.name
}

interface TabState {
  tabs: TabItem[]
  activeTab: string
}
```

核心操作：
- `addTab(route)` — 路由变化时调用，已存在则仅切换 activeTab；非 keepAlive 页面也加入 tabs（tab 栏需要显示），但不加入 cachedNames
- `closeTab(name)` — 移除 tab，若是当前 tab 则跳转到相邻 tab（优先左侧）
- `closeOtherTabs(name)` — 关闭除指定 tab 外的所有 tab
- `closeAllTabs()` — 关闭所有 tab，跳转到第一个可用路由
- `refreshTab(name)` — 从 cachedNames 移除，nextTick 后加回，组件重新挂载

Getter：
- `cachedNames: string[]` — 仅包含 `meta.keepAlive === true` 且 tab 仍打开的组件 name 列表，供 `<KeepAlive :include>` 使用

### Setup 函数

文件：`src/layouts/stores/tab.ts`

```ts
export function setupTab(router: Router): void {
  const store = useTabStore();

  router.afterEach((to) => {
    if (to.name && to.matched.some((r) => r.meta.keepAlive !== undefined || r.meta.title)) {
      store.addTab(to);
    }
  });
}
```

在 bootstrap 中调用：

```ts
// src/core/bootstrap/index.ts
setupTab(router);
```

删掉这行即完全禁用。

### Layout 改造

`src/layouts/Default.layout.vue` 中：

```vue
<router-view v-slot="{ Component }">
  <KeepAlive :include="tabStore.cachedNames">
    <component :is="Component" :key="$route.fullPath" />
  </KeepAlive>
</router-view>
```

不安装 tab 功能时 `cachedNames` 为空数组，KeepAlive 不缓存任何组件。

### Tab 栏组件

文件：`src/layouts/components/TabBar.vue`

功能：
- 渲染已打开的 tab 列表，可点击切换路由
- 每个 tab 有关闭按钮（只剩一个时隐藏关闭按钮）
- 右侧有刷新按钮，刷新当前 tab
- Ant Design Vue 的 `a-tabs` 组件实现样式

位置：`Default.layout.vue` 的 header 和 content 之间。

### 刷新机制

点击刷新按钮：
1. 从 `cachedNames` 中移除当前组件 name
2. `nextTick` 后加回
3. KeepAlive 识别为新增，组件重新挂载

非 keepAlive 页面刷新按钮隐藏或不可用（因为没有缓存可刷新）。

## 文件变更

| 文件 | 变更 |
|---|---|
| `src/layouts/stores/tab.ts` | 新建 — Tab store + setupTab |
| `src/layouts/components/TabBar.vue` | 新建 — 标签栏组件 |
| `src/layouts/Default.layout.vue` | 修改 — 加 KeepAlive + TabBar |
| `src/core/types/global.d.ts` | 修改 — RouteMeta 加 keepAlive / title |
| `src/core/bootstrap/index.ts` | 修改 — 调用 setupTab(router) |

## 约束

- 页面组件的 `defineOptions({ name })` 必须与路由 `name` 一致（项目已满足）
- `:key="$route.fullPath"` 确保同一路由不同参数渲染不同实例
- Tab Store 只管理 DefaultLayout 子路由，login/error 等独立路由不进入 tab
