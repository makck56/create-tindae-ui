## ADDED Requirements

### Requirement: 历史 Superpowers 文档必须迁移到 OpenSpec 归档，且不再作为编码真相源。

记录 Superpowers 历史文档目录的治理规则，并将其迁移到 OpenSpec 管理。本要求来自历史 Superpowers 文档迁移，仅作为归档后的历史能力描述；当前实现是否仍适用必须以后续 OpenSpec change 为准。

#### Scenario: 历史能力可追溯

- **WHEN** 开发者需要追溯「Superpowers 文档治理」的历史方案
- **THEN** 系统 MUST 在本 OpenSpec archive change 中提供 proposal、design、tasks、spec 和原始来源材料

#### Scenario: 历史结论不覆盖当前规范

- **WHEN** 历史材料与当前项目文档或活跃 OpenSpec change 存在冲突
- **THEN** 当前项目文档和活跃 OpenSpec change MUST 优先生效

#### Scenario: 主题能力约束

- **WHEN** 重新评估该历史主题
- **THEN** 开发者查找历史 Superpowers 材料时，必须从 OpenSpec 归档进入，而不是从 docs/superpowers 读取。