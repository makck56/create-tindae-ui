## ADDED Requirements

### Requirement: 模板文档必须反映真实内置能力

模板 README 和 AGENTS 文档 MUST 与当前 `package.json`、真实路由文件和文档文件路径保持一致，不得声明模板中不存在的默认业务页面或过期依赖版本。

#### Scenario: 文档列出内置页面

- **WHEN** 开发者查看模板 README 的内置页面列表
- **THEN** 列表中的每个路径 MUST 对应模板中实际注册的默认路由

#### Scenario: 文档声明技术栈

- **WHEN** 开发者查看 AGENTS 或 README 的技术栈说明
- **THEN** 说明中的核心依赖版本 MUST 与 `package.json` 当前声明一致

### Requirement: 开发态专用页面不得暴露为生产菜单

模板 MUST 保证仅开发态注册的页面不会在生产态菜单中暴露，避免用户点击后进入不存在的路由。

#### Scenario: 生产态菜单生成

- **WHEN** 应用以生产态运行并读取菜单配置
- **THEN** 菜单 MUST 不包含仅开发态可访问的 `Readme` 和 `ThemePreview` 入口

#### Scenario: 开发态菜单生成

- **WHEN** 应用以开发态运行并读取菜单配置
- **THEN** 菜单 MUST 保留 `Readme` 和 `ThemePreview` 入口以支持模板调试和主题验证

### Requirement: 模板必须提供统一健康检查入口

模板 MUST 提供一个脚本命令，用于集中执行主题 token 校验、单元测试、生产构建和脚手架 dry-run 验证。

#### Scenario: 执行模板健康检查

- **WHEN** 开发者运行模板健康检查命令
- **THEN** 系统 MUST 顺序执行模板发布前需要的关键验证，并在任一验证失败时返回失败退出码

