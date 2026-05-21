# Feature 脚手架改造设计

## 概述

改造 `scaffoldFeature` 脚本，支持无页面 feature、可选菜单、菜单嵌套、mock 权限同步。同时统一路由模板为扁平风格。

## 设计决策

- **页面可选**：feature 不一定有页面。有页面才创建 Page 文件和路由配置。
- **菜单可选**：有页面时不一定需要菜单入口，用户可以选择跳过。
- **菜单嵌套**：添加菜单时选择父级（根级或挂在现有菜单下）。
- **mock 同步**：添加菜单时同步更新 `MOCK_MENUS`，保持开发环境权限一致。
- **扁平路由**：domain 路由模板从嵌套 children 改为扁平 top-level 路由，和项目实际风格一致。

## scaffoldFeature 交互流程

```
选择域 → 输入 feature 名 → 输入中文名 → 创建 feature 目录

询问: 是否创建页面？ (yes/no，默认 yes)
  ├─ no → 结束（不创建 page/route/menu）
  └─ yes → 创建 Page 文件 + 更新路由
        询问: 是否添加侧边栏菜单？ (yes/no，默认 yes)
          ├─ no → 结束
          └─ yes → 列出菜单选项:
                    0. 作为根级菜单
                    1. 用户管理
                    2. 角色管理
                    ...
                  选择父级 → 输入菜单标签（默认 feature 中文名）
                  → 更新 menu.config.ts
                  → 更新 mock/handlers/auth.ts MOCK_MENUS
```

## 文件变更

### 修改: `scripts/scaffold-core/actions.ts`

`scaffoldFeature` 新增交互步骤：

1. 创建 feature 目录和模板文件后，询问是否创建页面
2. 如果 yes，创建 Page 文件并调用 `updateRoutes`
3. 询问是否添加菜单
4. 如果 yes，调用 `listMenuOptions` 列出现有菜单，用户选择父级
5. 输入菜单标签，调用 `updateMenuConfig` 和 `updateMockMenus`

### 修改: `scripts/scaffold-core/route-manager.ts`

`updateRoutes` 适配扁平路由格式：
- 不再查找 `children: [` 数组插入
- 改为读取 `*.routes.ts` 文件，找到 `RouteRecordRaw[]` 数组末尾（匹配 `];`），在它前面追加新路由项
- 新路由格式：`{ path: '/{featureKebab}', name: '{featurePascal}', meta: { title, keepAlive }, component: () => import(...) }`

### 修改: `scripts/templates/domain/routes.ts.hbs`

从嵌套 children 改为扁平路由：

```typescript
import type { RouteRecordRaw } from 'vue-router';

export const {{domainCamel}}Routes: RouteRecordRaw[] = [
  {
    path: '/{{domainKebab}}',
    name: '{{domainPascal}}',
    component: () => import('./pages/{{domainPascal}}List.page.vue'),
    meta: { title: '{{chineseName}}列表', keepAlive: true },
  },
];
```

### 新增: `scripts/scaffold-core/menu-manager.ts`

`listMenuOptions(): Promise<Array<{ index: number; label: string }>>`
- 读取 `menu.config.ts` 文件内容
- 用正则匹配所有 `label: '...'` 提取菜单项
- 返回扁平列表，index 0 保留给"根级"

`updateMenuConfig(label: string, routeName: string, parentLabel: string | null): Promise<void>`
- 读取 `menu.config.ts` 文件内容
- `parentLabel === null` → 根级：找到 `menuConfig: MenuConfig = [` 的数组末尾，追加 `{ label, code: routeName, routeName }`
- `parentLabel !== null` → 子级：找到 `label: '${parentLabel}'` 所在的菜单项，在其 `}` 前插入 `children: [{ label, code, routeName }]`（已有 children 则追加）
- 写回文件

`updateMockMenus(routeName: string, name: string): Promise<void>`
- 读取 `mock/handlers/auth.ts`
- 找到 `MOCK_MENUS` 数组的 `];`，在前面追加 `{ code: '${routeName}', name: '${name}' },`
- 写回文件

## 不变

- `scaffoldDomain` 流程不变（它不更新主路由文件和菜单，只生成域内文件并提示用户手动操作）
- `io.ts`、`utils.ts`、`template.ts` 不变
- feature 模板文件（view-list、composable、api、model 等）不变
