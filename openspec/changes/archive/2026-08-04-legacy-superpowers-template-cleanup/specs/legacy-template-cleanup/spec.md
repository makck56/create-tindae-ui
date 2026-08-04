## ADDED Requirements

### Requirement: 模板发布复制必须排除开发期残留，并保留用户项目必需文件。

清理模板顶层开发残留，并为发布复制链路增加忽略规则。本要求来自历史 Superpowers 文档迁移，仅作为归档后的历史能力描述；当前实现是否仍适用必须以后续 OpenSpec change 为准。

#### Scenario: 历史能力可追溯

- **WHEN** 开发者需要追溯「Template 顶层清理与发布排除机制」的历史方案
- **THEN** 系统 MUST 在本 OpenSpec archive change 中提供 proposal、design、tasks、spec 和原始来源材料

#### Scenario: 历史结论不覆盖当前规范

- **WHEN** 历史材料与当前项目文档或活跃 OpenSpec change 存在冲突
- **THEN** 当前项目文档和活跃 OpenSpec change MUST 优先生效

#### Scenario: 主题能力约束

- **WHEN** 重新评估该历史主题
- **THEN** 脚手架复制 template 时，黑名单中的开发材料不得出现在生成项目中。