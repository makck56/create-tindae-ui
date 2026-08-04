## ADDED Requirements

### Requirement: useSpin 必须避免快速请求造成 loading 闪烁，并保证开启后有最短展示时间。

实现延迟开启、最短展示的 loading 状态机 composable。本要求来自历史 Superpowers 文档迁移，仅作为归档后的历史能力描述；当前实现是否仍适用必须以后续 OpenSpec change 为准。

#### Scenario: 历史能力可追溯

- **WHEN** 开发者需要追溯「useSpin Composable」的历史方案
- **THEN** 系统 MUST 在本 OpenSpec archive change 中提供 proposal、design、tasks、spec 和原始来源材料

#### Scenario: 历史结论不覆盖当前规范

- **WHEN** 历史材料与当前项目文档或活跃 OpenSpec change 存在冲突
- **THEN** 当前项目文档和活跃 OpenSpec change MUST 优先生效

#### Scenario: 主题能力约束

- **WHEN** 重新评估该历史主题
- **THEN** 异步任务在阈值前完成时，spinning 不应变为 true；超过阈值后必须至少展示到最短时长结束。