## ADDED Requirements

### Requirement: 登录页必须遵循 Page/View 分层，并将验证码、表单和加密逻辑拆入 composable。

按 Page/View 分层重构登录页，并补充验证码与密码加密能力。本要求来自历史 Superpowers 文档迁移，仅作为归档后的历史能力描述；当前实现是否仍适用必须以后续 OpenSpec change 为准。

#### Scenario: 历史能力可追溯

- **WHEN** 开发者需要追溯「登录页重构」的历史方案
- **THEN** 系统 MUST 在本 OpenSpec archive change 中提供 proposal、design、tasks、spec 和原始来源材料

#### Scenario: 历史结论不覆盖当前规范

- **WHEN** 历史材料与当前项目文档或活跃 OpenSpec change 存在冲突
- **THEN** 当前项目文档和活跃 OpenSpec change MUST 优先生效

#### Scenario: 主题能力约束

- **WHEN** 重新评估该历史主题
- **THEN** 维护登录页时，路由壳不得包含业务逻辑，业务视图必须组合独立 composable 完成交互。