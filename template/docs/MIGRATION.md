# 渐进式迁移指南 (Migration Guide)

对于现存项目，不建议进行一次性重构 (Big Bang)。请遵循 **“由底向上，由外向内”** 的渐进式迁移策略。

## 1. 阶段一：基建先行与“止血” (Infrastructure)

**目标**：建立新架构骨架，确保新代码不再腐烂。

1.  **建立目录**：创建 `src/core`, `src/shared`, `src/modules`, `src/pages`。
2.  **隔离旧代码**：将原业务代码归类到 `src/legacy`（或保持原位），并配置别名 `@legacy`。
3.  **迁移底层**：将通用的 `utils`, `constants`, `types` 移动到 `src/shared`。
4.  **立规矩**：**所有新功能**必须在 `src/pages` 下按新架构开发。

## 2. 阶段二：核心域下沉 (Core Domain Extraction)

**目标**：迁移“全局业务”，为上层业务域提供支撑。

1.  **迁移 Auth & User**：将登录、用户信息、权限守卫迁移到 `src/modules/auth` 和 `src/modules/user`。这是所有业务的依赖源头。
2.  **重构 Layouts**：在 `src/layouts` 中建立新布局，引用新的 Store。

## 3. 阶段三：业务域逐个击破 (Feature-by-Feature)

**策略**：**绞杀者模式 (Strangler Fig Pattern)**。

1.  **选择试点**：选一个独立性强、依赖少的业务域（如“日志管理”）。
2.  **按 Feature 拆解**：
    *   API -> `features/xxx/api`
    *   逻辑 -> `features/xxx/composables`
    *   UI -> `views` & `components`
3.  **路由切换**：修改路由配置，将该业务路径指向新页面。
4.  **清理**：删除 `src/legacy` 中对应的旧代码。

## 4. 共存策略 (Coexistence Strategy)

*   **旧调新**：允许旧代码引用 `src/shared` 和 `src/modules`。**禁止**引用 `src/pages`。
*   **新调旧**：**原则上禁止**。如必须复用，请建立 `src/legacy-adapter` 适配层，避免新代码直接依赖旧文件结构。
