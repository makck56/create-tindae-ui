## 背景

当前主题系统的基础 Token 和 CSS 变量映射都由固定字段维护。新增一个业务语义变量时，需要同步修改 `types.ts`、`tokens.ts`、`bridges/cssVariables.ts`、Tailwind 兜底和文档，扩展成本高且容易漏改。

## 变更内容

- 为 `ThemeTokens` 增加 `custom` 扩展命名空间。
- 允许主题预设通过 `custom` 覆盖扩展 Token。
- CSS 变量桥接自动把 `custom` 中的嵌套 Token 展开为 `--custom-*` 变量。
- 补充测试和主题文档，说明扩展 Token 的命名、合并和消费方式。

## 影响

- 不改变现有固定 Token 的 CSS 变量名。
- 不要求业务立即迁移现有变量。
- 新增业务 Token 可优先放入 `custom`，避免修改桥接层。