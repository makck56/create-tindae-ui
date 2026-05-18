# vite-plugin-route-names

从路由配置自动生成类型安全的路由名称常量，并检查路由名与组件 `defineOptions({ name })` 的一致性。

## 功能

### 1. 路由常量自动生成

扫描 `src/pages/**/*.routes.ts`，提取路由 `name`，生成 `src/shared/constants/routeNames.ts`：

```ts
export const ROUTE_NAMES = {
  UserManagement: {
    /** 用户列表 */
    USER_MANAGEMENT: "UserManagement",
    /** 用户详情 */
    USER_DETAIL: "UserDetail",
  },
} as const;
```

代码中使用 `ROUTE_NAMES.UserManagement.USER_MANAGEMENT` 代替硬编码字符串，路由重命名时编译器自动报错。

支持 `// @key: CUSTOM_KEY` 注释自定义常量 key：

```ts
// routes.ts
{
  name: 'UserManagement', // @key: LIST
  component: () => import('./pages/UserList.page.vue'),
}
// 生成: LIST: "UserManagement"
```

### 2. 一致性检查

构建启动时检查每个 `.page.vue` 的 `defineOptions({ name })` 是否与路由 `name` 一致：

```
============================================================
🔍 [AutoRoutes] 路由名称一致性检查报告
============================================================

📊 统计: 3 个路由, 3 ✅, 0 ❌

✅ src/pages/login/pages/Login.page.vue
   路由名: Login
   组件名: Login
============================================================
```

不一致会影响 `KeepAlive` 缓存的准确性。

### 3. HMR 热更新

修改 `.routes.ts` 文件后自动重新生成常量并触发热更新。

## 使用

```ts
// vite.config.ts
import { autoRoutesPlugin } from './build-plugins'

export default defineConfig({
  plugins: [
    autoRoutesPlugin(),
  ],
})
```

### 配置项

```ts
autoRoutesPlugin({
  outputFile: 'src/shared/constants/routeNames.ts', // 输出路径
  enableCheck: true,  // 是否启用一致性检查
  strict: false,       // true 时检查不通过则构建失败
})
```

### CLI

```bash
# 检查一致性
tsx build-plugins/plugins/vite-plugin-route-names/cli.ts check

# JSON 格式输出
tsx build-plugins/plugins/vite-plugin-route-names/cli.ts check --json

# 手动触发生成
tsx build-plugins/plugins/vite-plugin-route-names/cli.ts generate
```

## 文件结构

```
vite-plugin-route-names/
├── index.ts       # 导出
├── plugin.ts      # Vite 插件入口（buildStart / handleHotUpdate）
├── scanner.ts     # 扫描 .routes.ts，提取路由信息
├── generator.ts   # 生成 routeNames.ts 常量文件
├── checker.ts     # 一致性检查 + 报告输出
├── fixer.ts       # 输出修复建议（不自动修改文件）
├── parser.ts      # Vue SFC 解析（提取 defineOptions）
├── cli.ts         # 命令行接口
└── types.ts       # 类型定义
```

## 约定

- 路由文件必须匹配 `src/pages/**/*.routes.ts`
- 页面组件必须以 `.page.vue` 结尾
- 路由对象必须包含 `name` 和 `component` 字段
