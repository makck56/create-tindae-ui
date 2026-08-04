## ADDED Requirements

### Requirement: 标签页模块必须根据路由元信息维护打开页签和 KeepAlive 缓存列表。

在默认布局中加入页面缓存和多标签页切换能力。本要求来自历史 Superpowers 文档迁移，仅作为归档后的历史能力描述；当前实现是否仍适用必须以后续 OpenSpec change 为准。

#### Scenario: 历史能力可追溯

- **WHEN** 开发者需要追溯「Keep-Alive 与标签页」的历史方案
- **THEN** 系统 MUST 在本 OpenSpec archive change 中提供 proposal、design、tasks、spec 和原始来源材料

#### Scenario: 历史结论不覆盖当前规范

- **WHEN** 历史材料与当前项目文档或活跃 OpenSpec change 存在冲突
- **THEN** 当前项目文档和活跃 OpenSpec change MUST 优先生效

#### Scenario: 主题能力约束

- **WHEN** 重新评估该历史主题
- **THEN** 访问声明 keepAlive 的页面后，切换到其他页面再返回时，页面状态应被缓存恢复。