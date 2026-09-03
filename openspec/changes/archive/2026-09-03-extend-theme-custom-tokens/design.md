## 上下文

主题系统已有亮/暗基础 Token、品牌预设、Ant Design Vue、VXE、ECharts 和 CSS 变量桥接。问题不在换肤预设，而在 Token 结构本身只能表达预置字段，业务扩展需要改多处基础设施。

## 目标

- 支持任意业务扩展 Token。
- 扩展 Token 运行时自动输出 CSS 变量。
- preset 能以不可变方式覆盖扩展 Token。
- 保持现有固定 Token API 和 CSS 变量完全兼容。

## 非目标

- 不自动生成 Tailwind 工具类。
- 不引入运行时取色器或色阶算法。
- 不重构 Ant/VXE/ECharts 现有映射。

## 设计决策

### 1. 使用 `custom` 作为扩展命名空间

扩展 Token 放在 `tokens.custom` 下，避免污染核心主题契约。业务可以按域分组，例如 `custom.chart.referenceLine`、`custom.workflow.pendingBg`。

### 2. 扩展 Token 自动转 CSS 变量

`buildCssVarMap` 递归展开 `custom`，变量名统一为 `--custom-<path>`，camelCase 自动转 kebab-case。例如 `custom.chart.referenceLine` 输出 `--custom-chart-reference-line`。

### 3. preset 对 `custom` 使用深合并

扩展 Token 常按业务域嵌套，浅合并会导致覆盖一个字段时丢掉同组其他字段。因此 `custom` 使用递归深合并，仍保持不可变。

## 风险与处理

- 风险：扩展变量没有 Tailwind 类。处理：文档明确通过 `var(--custom-*)` 使用；只有高频通用变量再手动加入 Tailwind。
- 风险：扩展名冲突。处理：统一加 `--custom-` 前缀，并推荐按业务域分组。