# 项目状态 (2026-05-21)

## 已完成

### vxe-table 重构

- vxe-table 版本锁定 4.3.7，全部静态导入（Grid/Table/Column/Checkbox/Toolbar/Pager/Modal/Tooltip）
- 中文 locale 通过 `VXETable.setup({ i18n })` + zh-CN 语言包配置
- 所有组件 CSS 样式补齐（grid/table/column/pager/checkbox/toolbar/modal/tooltip）
- 提交: `4e7a34d fix: add missing vxe-table component CSS imports`

### Ant Design Vue 按需加载

- `antd.ts` 去掉 `app.use(Antd)` 全量注册，改为仅导入 CSS
- 通过 `unplugin-vue-components` + `AntDesignVueResolver` 自动按需导入组件
- 自动生成类型声明 `src/auto-components.d.ts`
- 提交: `5148230 refactor: switch antd to unplugin-vue-components on-demand import`

### MSW Mock Server

- `src/mock/handlers/auth.ts` — login/info/logout，sessionStorage 持久化登录状态
- `src/mock/handlers/user.ts` — 用户 CRUD + 分页过滤，30 条 mock 数据
- `src/mock/browser.ts` — MSW browser worker 初始化
- main.ts 中 dev 模式启动 MSW，bootstrap 保持同步
- 提交: `8587388`, `c931588`, `a6b11a8`, `f0d238d`

### Keep-Alive + 多标签页

- `src/layouts/tab/` 内聚目录：tab.ts（store + setupTab）、TabBar.vue、index.ts
- `useTabStore` 管理标签列表和缓存名称，`cachedNames` getter 过滤 keepAlive 页面
- `refreshTab` 通过临时排除 + nextTick 实现刷新
- `setupTab(router)` 注册 afterEach，可选禁用（不调用即可）
- DefaultLayout 集成 `<KeepAlive :include="tabStore.cachedNames">` + `<TabBar />`
- RouteMeta 新增 `keepAlive` 和 `title` 字段
- 刷新按钮对非 keepAlive 页面自动 disabled
- 提交: `5052b85 feat: add Keep-Alive caching and multi-tab switching`

### 其他修复

- RSA 加密 mock（无公钥时返回原密码）
- 登录错误日志输出
- 路由权限 code 修正（UserManagement 匹配）
- 提交: `4b07018 fix: misc login flow and mock handler fixes`

### 标签页右键菜单 & 自定义标签列表

- TabItem 唯一键从 `route.name` 改为 `route.path`，支持同路由多标签页（如详情页）
- 新增 `_tabTitle` query 参数支持动态标签标题（如 "订单 #123 详情"）
- 新增 `visitedOrder` 访问顺序追踪，关闭标签后跳转到上一个访问的标签
- 替换 antd `a-tabs` 为自定义胶囊标签列表
- 新增右键菜单：刷新、关闭、关闭左侧、关闭右侧、关闭其他
- `refreshTab` 通过 `_excludeCache` + `v-if` 实现真正的销毁重建，配合 loading spinner 反馈
- Store 完整测试覆盖（14 个测试通过）

### 角色管理路由 & 菜单

- 新增 `/role-management` 路由，指向已有 `RoleList.page.vue`
- menu.config.ts 新增角色管理菜单项，`code` 统一为 PascalCase（匹配 permissionCodes）
- mock 权限同步新增 `RoleManagement`
- 菜单 `selectedKeys` 绑定当前路由，刷新后保持高亮

### Loading 常量提取

- 新增 `src/shared/constants/spin.ts`：`SPIN_DELAY`（300ms）、`SPIN_MIN_DURATION`（500ms）
- `useSpin` 和 `refreshTab` 的魔法值替换为共享常量

### Scaffold 脚本改造

- 路由模板从嵌套 children 改为扁平 top-level 路由
- `scaffoldFeature` 新增交互：是否创建页面、是否添加菜单、菜单父级选择（支持嵌套）
- 新增 `menu-manager.ts`：`listMenuOptions`、`askMenuParent`、`updateMenuConfig`、`updateMockMenus`
- 路由和菜单配置同步包含 `meta.code`，脚手架生成的路由默认受权限守卫保护
- `updateRoutes` 适配扁平路由格式

### 早期完成（历史）

- vxe-grid + gridOptions 迁移，scaffold 模板重构
- useSpin composable（4 状态机，9 测试通过）
- Auth 模块 + Login 页面重构
- 构建优化（vendor chunks，dev host）
- 文档整理（ARCHITECTURE.md，轻量域规范）

## 待办

- [ ] API 层共享 axios 实例（当前每个 feature 独立 axios.create）
- [ ] useSpin 在项目中的实际接入
- [ ] 侧边栏菜单提取为独立组件（从 DefaultLayout 中拆出过滤逻辑、选中状态、交互处理）
- [ ] `refreshTab` 使用独立常量替代 `SPIN_MIN_DURATION`（语义不同）
- [ ] 轻量项目使用指南
