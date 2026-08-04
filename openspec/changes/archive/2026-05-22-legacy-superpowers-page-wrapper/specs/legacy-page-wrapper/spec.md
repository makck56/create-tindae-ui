## ADDED Requirements

### Requirement: PageWrapper 必须通过插槽提供统一页面布局，并允许调用方覆盖区域样式。

提供表格页面通用上中下布局组件，减少重复布局代码。本要求来自历史 Superpowers 文档迁移，仅作为归档后的历史能力描述；当前实现是否仍适用必须以后续 OpenSpec change 为准。

#### Scenario: 历史能力可追溯

- **WHEN** 开发者需要追溯「PageWrapper 公共布局组件」的历史方案
- **THEN** 系统 MUST 在本 OpenSpec archive change 中提供 proposal、design、tasks、spec 和原始来源材料

#### Scenario: 历史结论不覆盖当前规范

- **WHEN** 历史材料与当前项目文档或活跃 OpenSpec change 存在冲突
- **THEN** 当前项目文档和活跃 OpenSpec change MUST 优先生效

#### Scenario: 主题能力约束

- **WHEN** 重新评估该历史主题
- **THEN** 业务表格页使用 PageWrapper 时，必须能分别放置筛选区、内容区和底部操作区。