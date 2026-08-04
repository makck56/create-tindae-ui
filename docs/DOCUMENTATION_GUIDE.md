# 文档治理说明

本项目曾同时使用 Superpowers 和 OpenSpec 产出方案文档。为避免同一需求在多个目录里重复维护，后续统一按本文规则执行。

## 一句话规则

OpenSpec 是需求、设计、验收标准和任务拆分的唯一真相源；Superpowers 只用于头脑风暴、方案推演、评审辅助和过程记录。

## 文档职责

| 文档位置 | 职责 | 是否作为编码依据 |
| :-- | :-- | :-- |
| `openspec/specs/` | 当前能力规格和验收标准 | 是 |
| `openspec/changes/<change-id>/proposal.md` | 变更背景、目标和范围 | 是 |
| `openspec/changes/<change-id>/design.md` | 正式设计方案、架构决策、边界说明 | 是 |
| `openspec/changes/<change-id>/tasks.md` | 实施任务、验证任务、交付清单 | 是 |
| `openspec/changes/archive/*legacy-superpowers*/` | 历史头脑风暴、旧计划和过程材料 | 否 |
| `README.md` / `ARCHITECTURE.md` / `theme.md` | 长期项目说明、架构和主题规范 | 是，作为基础约束 |
| `docs/*.md` | 发布、迁移、操作类长期说明 | 视文档主题而定 |

## 新需求流程

1. 需要头脑风暴时，可以先用 Superpowers 梳理问题、方案和风险。
2. 方向确认后，必须把正式结论沉淀到 OpenSpec change。
3. 编码前，AI 和开发者必须先读取对应 change 的 `proposal.md`、`design.md`、`tasks.md` 和相关 `specs/*/spec.md`。
4. 编码期间如果需求变化，只更新 OpenSpec，不再新增 `docs/superpowers/specs/*`。
5. 交付前运行对应的 OpenSpec 校验，并在需要时归档 change。

## 旧文档处理规则

- 已经迁移到 OpenSpec 的 Superpowers 文档保留为历史归档，不再作为实现依据。
- 如发现新的 Superpowers 历史材料仍有价值，应新建 OpenSpec change 后迁移关键结论。
- 纯过程性讨论迁移后仅作为 `sources/` 历史证据保留，不进入当前正式规格。
- 禁止继续新增 Superpowers 正式规格文档。

## AI 执行规则

AI 编码时按以下优先级读取文档：

1. 当前任务指定的 OpenSpec change。
2. `openspec/specs/` 中相关能力规格。
3. `AGENTS.md`、`ARCHITECTURE.md`、`README.md`、`theme.md` 等长期约束。
4. `openspec/changes/archive/*legacy-superpowers*/` 仅作为历史背景参考，不能覆盖 OpenSpec 结论。
