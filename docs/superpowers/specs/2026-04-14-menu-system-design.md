# 菜单系统设计规范

**版本**: 1.0
**日期**: 2026-04-14
**状态**: 待评审

---

## 1. 概述

基于配置文件驱动的菜单系统，支持多级菜单嵌套，通过 `ROUTE_NAMES` 常量关联路由，集成 `menu-visualizer` 可视化编辑器。

---

## 2. 文件结构

```
src/
├── modules/app/
│   ├── menu.config.ts      # 菜单配置数据
│   └── menuTypes.ts         # 菜单类型定义
├── layouts/
│   └── Default.layout.vue   # 递归渲染菜单
└── shared/constants/
    └── routeNames.ts         # 自动生成的路由名称常量（已存在）
```

---

## 3. 类型定义 — `src/modules/app/menuTypes.ts`

```typescript
export interface MenuItem {
  key: string;
  label: string;
  icon?: string;           // antd icon 组件名，如 'UserOutlined'
  routeName?: string;      // 引用 ROUTE_NAMES 常量
  children?: MenuItem[];   // 子菜单，支持无限嵌套
  visible?: boolean;       // 默认 true，控制是否显示
}

export type MenuConfig = MenuItem[];
```

---

## 4. 菜单配置 — `src/modules/app/menu.config.ts`

```typescript
import type { MenuConfig } from './menuTypes';
import { ROUTE_NAMES } from '@/shared/constants/routeNames';

export const menuConfig: MenuConfig = [
  {
    key: 'user-management',
    label: '用户管理',
    icon: 'UserOutlined',
    routeName: ROUTE_NAMES.UserManagement,
  },
];
```

---

## 5. Layout 渲染逻辑 — `Default.layout.vue`

改造现有的 `Default.layout.vue`：

1. 从 `menu.config.ts` 导入 `menuConfig`
2. 递归渲染 `<a-menu-item>` 和 `<a-sub-menu>`
3. 点击菜单项时 `router.push({ name: item.routeName })`
4. `visible === false` 的项跳过渲染
5. `icon` 字符串映射到 antd icon 组件

### 渲染规则

| 条件 | 渲染 |
|:---|:---|
| 有 `children` | `<a-sub-menu>` 递归渲染子项 |
| 有 `routeName`，无 `children` | `<a-menu-item>`，点击跳转路由 |
| `visible === false` | 跳过，不渲染 |
| 有 `icon` | 在菜单项前显示对应 antd icon |

---

## 6. menu-visualizer 集成

在 `vite.config.ts` 中注册：

```typescript
import { menuVisualizerPlugin } from '@internal/build-tools';

export default defineConfig({
  plugins: [
    vue(),
    autoRoutesPlugin(),
    menuVisualizerPlugin({
      viewsPath: 'src/pages',
      menuConfigPath: 'src/modules/app/menu.config.ts',
      routeNamesPath: 'src/shared/constants/routeNames.ts',
    }),
  ],
});
```

开发时访问 `/__menu-editor` 可视化编辑菜单配置。

---

## 7. 文件归属设计

`src/modules/app/`：菜单配置归属于 `app` 模块，作为应用级配置的一部分。符合架构规范中 Pages/Modules/Shared/Core 的分层原则 — 菜单是应用级别的功能，不是跨域复用的通用工具，也不是独立业务 domain。
