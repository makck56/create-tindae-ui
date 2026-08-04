## ADDED Requirements

### Requirement: QueryFilter 必须根据字段配置渲染筛选控件，并通过 v-model 同步查询模型。

用配置驱动的 QueryFilter 替代各页面重复筛选表单。本要求来自历史 Superpowers 文档迁移，仅作为归档后的历史能力描述；当前实现是否仍适用必须以后续 OpenSpec change 为准。

#### Scenario: 历史能力可追溯

- **WHEN** 开发者需要追溯「QueryFilter 通用筛选组件」的历史方案
- **THEN** 系统 MUST 在本 OpenSpec archive change 中提供 proposal、design、tasks、spec 和原始来源材料

#### Scenario: 历史结论不覆盖当前规范

- **WHEN** 历史材料与当前项目文档或活跃 OpenSpec change 存在冲突
- **THEN** 当前项目文档和活跃 OpenSpec change MUST 优先生效

#### Scenario: 主题能力约束

- **WHEN** 重新评估该历史主题
- **THEN** 业务页面传入筛选配置和查询对象时，组件必须渲染查询、重置按钮并触发对应事件。