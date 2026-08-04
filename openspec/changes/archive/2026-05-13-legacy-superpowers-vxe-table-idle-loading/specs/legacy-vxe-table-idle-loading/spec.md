## ADDED Requirements

### Requirement: 表格能力必须支持空闲期加载，并让业务页面通过 vxe-grid 获得分页和代理查询能力。

将 vxe-table 注册延后到浏览器空闲期，并让脚手架默认采用 vxe-grid 模板。本要求来自历史 Superpowers 文档迁移，仅作为归档后的历史能力描述；当前实现是否仍适用必须以后续 OpenSpec change 为准。

#### Scenario: 历史能力可追溯

- **WHEN** 开发者需要追溯「vxe-table 空闲加载与 vxe-grid 默认模板」的历史方案
- **THEN** 系统 MUST 在本 OpenSpec archive change 中提供 proposal、design、tasks、spec 和原始来源材料

#### Scenario: 历史结论不覆盖当前规范

- **WHEN** 历史材料与当前项目文档或活跃 OpenSpec change 存在冲突
- **THEN** 当前项目文档和活跃 OpenSpec change MUST 优先生效

#### Scenario: 主题能力约束

- **WHEN** 重新评估该历史主题
- **THEN** 用户列表页渲染时，业务视图不需要手动逐个导入 vxe-table 子组件即可使用表格能力。