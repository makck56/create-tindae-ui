## ADDED Requirements

### Requirement: 脚手架必须能够生成完整可运行的企业级 Vue 3 模板项目。

建设零选项 Vue 3 企业级项目脚手架，固定技术栈并复制完整模板。本要求来自历史 Superpowers 文档迁移，仅作为归档后的历史能力描述；当前实现是否仍适用必须以后续 OpenSpec change 为准。

#### Scenario: 历史能力可追溯

- **WHEN** 开发者需要追溯「create-tindae-ui 脚手架」的历史方案
- **THEN** 系统 MUST 在本 OpenSpec archive change 中提供 proposal、design、tasks、spec 和原始来源材料

#### Scenario: 历史结论不覆盖当前规范

- **WHEN** 历史材料与当前项目文档或活跃 OpenSpec change 存在冲突
- **THEN** 当前项目文档和活跃 OpenSpec change MUST 优先生效

#### Scenario: 主题能力约束

- **WHEN** 重新评估该历史主题
- **THEN** 开发者执行脚手架创建项目时，生成目录必须包含 CLI 模板约定的源码、配置、文档和示例业务域。