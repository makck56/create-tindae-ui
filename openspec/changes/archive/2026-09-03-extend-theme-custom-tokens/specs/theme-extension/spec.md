## ADDED Requirements

### Requirement: 主题系统必须支持自定义扩展 Token

主题系统 MUST 允许开发者在核心固定 Token 之外声明自定义扩展 Token，且扩展 Token 不得要求同步修改 CSS 变量桥接代码。

#### Scenario: 输出嵌套自定义 Token

- **WHEN** `ThemeTokens.custom` 中包含嵌套字段 `chart.referenceLine`
- **THEN** CSS 变量桥接 MUST 输出 `--custom-chart-reference-line`

#### Scenario: 预设覆盖自定义 Token

- **WHEN** 主题预设提供 `custom` 覆盖字段
- **THEN** `applyPreset` MUST 深合并该扩展字段，并保留未覆盖的同组字段

#### Scenario: 现有固定变量兼容

- **WHEN** 主题系统启用自定义扩展 Token
- **THEN** 现有 `--color-*`、`--text-*`、`--bg-*`、`--border-*`、`--radius-*` 和布局变量 MUST 保持原有名称和行为

