## 上下文

按 Page/View 分层重构登录页，并补充验证码与密码加密能力。

本文件是从 Superpowers 文档迁移后的 OpenSpec 设计记录。它保留历史设计意图，但不覆盖当前仓库中已经演进后的 README、AGENTS、ARCHITECTURE、theme 或现有 OpenSpec 规格。

## 目标

- 让「登录页重构」的历史设计和实施意图可以在 OpenSpec 中被查找。
- 把旧文档从过程材料转化为可归档、可追溯的 OpenSpec 变更。
- 明确该归档只承担历史说明职责，不直接驱动新代码实现。

## 非目标

- 不重新实现旧 Superpowers 计划中的代码任务。
- 不把旧技术栈版本回写为当前项目约束。
- 不替代当前已经存在的 OpenSpec 正式规格。

## 设计决策

### 1. 按历史主题独立归档

每个旧 Superpowers 主题生成一个独立 OpenSpec archive change，便于按能力查找和逐项评估是否仍有复用价值。

### 2. 中文 OpenSpec 文件承载正式迁移说明

proposal.md、design.md、	asks.md 和 specs/*/spec.md 使用中文描述迁移后的正式结构。原始材料仅放入 sources/ 作为历史证据。

### 3. 历史结论不自动升级为当前要求

旧文档中可能包含过期依赖版本、旧目录结构或旧命令。后续如果要重新采用其中任何设计，必须结合当前仓库状态重新创建 OpenSpec change。

## 风险与处理

- 风险：旧文档里的英文、旧依赖版本或旧命令被误认为当前规范。处理：在本归档中明确标注历史属性，并把当前编码依据限定为活跃 OpenSpec change 和当前 specs。
- 风险：迁移后查找路径变化。处理：在 docs/DOCUMENTATION_GUIDE.md 和 AGENTS.md 中同步新的真相源规则。