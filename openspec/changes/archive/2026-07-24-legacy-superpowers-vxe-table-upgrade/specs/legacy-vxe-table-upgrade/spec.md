## ADDED Requirements

### Requirement: 表格依赖升级必须验证破坏性变化、类型兼容和现有业务表格行为。

探索将 vxe-table、xe-utils 和相关依赖升级到当时最新版的影响。本要求来自历史 Superpowers 文档迁移，仅作为归档后的历史能力描述；当前实现是否仍适用必须以后续 OpenSpec change 为准。

#### Scenario: 历史能力可追溯

- **WHEN** 开发者需要追溯「vxe-table 升级探索」的历史方案
- **THEN** 系统 MUST 在本 OpenSpec archive change 中提供 proposal、design、tasks、spec 和原始来源材料

#### Scenario: 历史结论不覆盖当前规范

- **WHEN** 历史材料与当前项目文档或活跃 OpenSpec change 存在冲突
- **THEN** 当前项目文档和活跃 OpenSpec change MUST 优先生效

#### Scenario: 主题能力约束

- **WHEN** 重新评估该历史主题
- **THEN** 升级 vxe-table 后，跨页选择、分页、代理查询和主题样式必须通过回归验证。