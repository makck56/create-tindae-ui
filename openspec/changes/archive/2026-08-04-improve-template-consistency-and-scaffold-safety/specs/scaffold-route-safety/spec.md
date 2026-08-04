## ADDED Requirements

### Requirement: 脚手架生成的路由名必须跨域唯一
业务脚手架在为现有 domain 新增 feature 页面时，生成的 Vue Router `name` MUST 默认包含 domain 前缀，避免不同 domain 下同名 feature 互相冲突。

#### Scenario: 不同域生成同名特性
- **WHEN** 开发者分别在 `sales` 和 `finance` 域下生成名为 `order` 的 feature 页面
- **THEN** 两个页面的 route name MUST 不相同

### Requirement: 脚手架生成的权限码和菜单路由名必须一致
脚手架生成页面并写入菜单时，菜单 `code`、菜单 `routeName`、路由 `name` 和路由 `meta.code` MUST 使用同一个规范化名称。

#### Scenario: 新增 feature 菜单
- **WHEN** 开发者使用脚手架为现有 domain 新增 feature 并选择创建菜单
- **THEN** 生成的菜单项 MUST 指向实际生成的路由名，并且权限码 MUST 与路由 `meta.code` 一致

### Requirement: 脚手架 dry-run 必须覆盖安全命名结果
脚手架 dry-run MUST 展示将要生成或修改的关键文件，并能用于验证 route name、page 文件和菜单配置不会发生跨域命名冲突。

#### Scenario: 预览新增 feature
- **WHEN** 开发者执行新增 feature 的 dry-run
- **THEN** 输出 MUST 包含将写入的路由名或可定位到路由变更的文件列表，且不得实际落盘业务文件
