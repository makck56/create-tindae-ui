## Why

当前 `template` 已经具备企业后台的基础能力，但文档、菜单、开发态路由和脚手架约束之间出现了漂移。生成项目的第一印象依赖模板可信度，如果模板说明与实际代码不一致，后续业务开发会更容易误判能力边界。

本次变更优先修复低成本、高收益的问题：让模板文档与真实依赖一致，让开发态专用页面不会污染生产菜单，并让脚手架在生成跨域特性时主动规避路由命名冲突。

## What Changes

- 修正模板 README / AGENTS 中与实际依赖、内置页面、文档路径不一致的描述。
- 让开发态专用的 `readme` / `theme-preview` 菜单与路由环境保持一致，避免生产环境出现无效菜单入口。
- 强化脚手架生成的路由命名策略，默认避免不同业务域下同名 feature 产生 Vue Router `name` 冲突。
- 增加模板健康检查入口，用于集中验证主题 token、单测、构建和脚手架 dry-run。
- 扩展必要测试，覆盖菜单/路由一致性和脚手架命名安全性。

## Capabilities

### New Capabilities

- `template-consistency`: 约束模板文档、菜单、路由和健康检查必须反映当前真实能力。
- `scaffold-route-safety`: 约束脚手架生成的路由、菜单和组件名应具备跨域唯一性与可验证性。

### Modified Capabilities

- 无。

## Impact

- 影响 `template/README.md`、`template/AGENTS.md`、`template/package.json`、`template/src/core/bootstrap/router.ts`、`template/src/modules/app/config/menu.config.ts`。
- 影响 `template/scripts/scaffold-core/*` 和对应模板/测试。
- 不引入新的 UI 框架，不改动业务页面视觉结构，不改变现有 API 响应协议。
