## 1. 数据契约与解析层

- [x] 1.1 `menuTypes.ts`：`MenuItem` 新增可选 `icon` 字段（字符串图标名，随菜单树经接口下发）
- [x] 1.2 新增 `menuIcons.ts` 白名单注册表：`resolveMenuIcon`（严格解析）、`resolveRootMenuIcon`（根级兜底 `AppstoreOutlined`）
- [x] 1.3 `menu.config.ts`：用户管理 / 角色管理 / 主题预览 / 项目文档 配置对应图标名

## 2. 渲染层

- [x] 2.1 `Default.layout.vue`：根级菜单与子菜单在 `#icon` 插槽渲染解析后的图标组件（含约束注释）
- [x] 2.2 `Default.layout.vue`：子级菜单项按需渲染显式配置的图标（严格解析，未配置不占位）
- [x] 2.3 `Default.layout.vue`：侧栏折叠时应用名标题收缩为首字符，避免溢出 80px 折叠宽度

## 3. 脚手架一致性

- [x] 3.1 `scaffold-core/patch.ts`：`applyRootMenuPatch` 生成的根级菜单写入默认 icon
- [x] 3.2 `scaffold-core/patch.ts`：`rebuildDomainMenu` / `buildDomainMenuItem` 透传原菜单项 icon（缺失补默认值），防止重建静默丢失自定义图标

## 4. 测试与验证

- [x] 4.1 新增 `menuIcons.spec.ts`：注册表严格解析 / 根级兜底解析单测
- [x] 4.2 扩展 `menu.config.spec.ts`：「声明的 icon 必须在注册表中可解析」契约测试
- [x] 4.3 全量测试通过（209/209）、ESLint 无 error、vue-tsc 无新增错误（27 个既有错误与本次无关）
