## 编写代码

1. 不要直接写代码，每次涉及改动，都需要先使用openspec:explore探索
2. openspec:explore完成后，需要再经过用户确认再执行openspec:apply-change
3. 最后用户再次确认没问题，再归档

## OpenSpec

在使用OpenSpec时，生成的文档都需要是中文文档，不要英文

## 文档真相源

- 默认使用 OpenSpec；OpenSpec 是需求、设计、验收标准和任务拆分的唯一真相源。
- Superpowers 只用于头脑风暴、方案推演、评审辅助和过程记录，不作为编码依据。
- 编码前必须优先读取对应 OpenSpec change 的 `proposal.md`、`design.md`、`tasks.md` 和 `specs/*/spec.md`。
- `openspec/changes/archive/*legacy-superpowers*/` 是 Superpowers 历史归档入口，新需求不得继续使用 Superpowers 沉淀正式规格文档。
- 详细规则见 `docs/DOCUMENTATION_GUIDE.md`。

