## Why

侧边栏菜单此前没有图标。ant-design-vue 折叠态隐藏文字的样式是
`.ant-menu-item-icon + span { opacity: 0 }`——仅当菜单项存在 icon 元素时才生效，
因此无图标的菜单在侧栏收缩后文字不会被隐藏，只会被 80px 折叠宽度裁切，视觉破损；
同时侧边栏应用名标题在折叠后同样溢出。

## What Changes

- `MenuItem` 类型新增 `icon` 字段：后端 / 配置下发图标名字符串（接口层只能承载可序列化数据）
- 新增 `menuIcons.ts` 图标白名单注册表：`resolveMenuIcon`（严格解析）、`resolveRootMenuIcon`（根级兜底默认图标，保证折叠态必有图标可显示）
- `menu.config.ts` 为既有菜单项配置图标名
- `Default.layout.vue` 根级菜单 / 子菜单渲染 `#icon` 插槽；侧栏折叠时应用名标题收缩为首字符
- 脚手架 `scaffold-core/patch.ts`：根级菜单生成时写入默认 icon；域菜单重建时透传原 icon（防止 `scaffold:feature` 静默丢失自定义图标）
- 新增注册表单测 + 「菜单声明的 icon 必须可解析」契约测试

## Capabilities

### New Capabilities

- `sidebar-menu-icons`: 侧边栏菜单图标的配置契约（字符串字段）、白名单解析规则、折叠态渲染行为与脚手架生成约定

### Modified Capabilities

（无——既有 capability 的需求不变；菜单 code / 权限码契约未受影响）

## Impact

- `template/src/modules/app/config/menuTypes.ts`（类型扩展）
- `template/src/modules/app/config/menuIcons.ts`（新增）
- `template/src/modules/app/config/menu.config.ts`（配置数据）
- `template/src/layouts/Default.layout.vue`（渲染层）
- `template/scripts/scaffold-core/patch.ts`（脚手架生成格式）
- mock 层无需改动：`mock/handlers/auth.ts` 直接回吐 `menuConfig`，icon 随单一真相源自动下发
- 测试：`menuIcons.spec.ts` 新增、`menu.config.spec.ts` 扩展
