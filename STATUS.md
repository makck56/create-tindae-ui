# 项目状态 (2026-04-22)

## 已完成

### README.md 重写
- 将旧的"前端架构设计指南"替换为脚手架工具文档
- 涵盖快速开始、技术栈、架构概览、目录结构、自定义 Vite 插件
- 已提交: `42eb53e docs: rewrite README as scaffolding tool documentation`

### Scaffold 脚本同步 (features-demo → template)
从 `features-demo/scripts/` 复制到 `template/scripts/`：
- `scaffold.ts` — 入口文件
- `scaffold-core/` — actions.ts, io.ts, template.ts, utils.ts, route-manager.ts, readme-manager.ts
- `templates/domain/` — routes.ts.hbs, page-list.vue.hbs, readme.md.hbs
- `templates/feature/` — view-list.vue.hbs, composable-list.ts.hbs, api.ts.hbs, model.ts.hbs, constants.ts.hbs, page-list.vue.hbs

### package.json 更新
- 新增 scripts: `scaffold`, `scaffold:domain`, `scaffold:feature`
- 新增 devDependencies: `handlebars@^4.7.8`, `@types/handlebars@^4.1.0`, `tsx@^4.21.0`

### 移除 Detail 相关内容
- actions.ts: 移除 Detail page/view/composable 生成逻辑
- routes.ts.hbs: 移除 detail/:id 路由
- readme.md.hbs: 移除 Detail 引用
- api.ts.hbs: 移除 getDetail 方法
- 删除模板文件: page-detail.vue.hbs, view-detail.vue.hbs, composable-detail.ts.hbs

### 脚本测试
- `scaffold:domain` — 通过（生成完整域结构：路由、页面壳、视图、composable、API、Model、常量、README）
- `scaffold:feature` — 通过（在已有域下生成特性文件，自动更新路由和 README）
- 测试产物已清理

## 未提交

以上 scaffold 脚本同步和 Detail 移除的变更尚未提交到 git。

## 待办

- [ ] 提交 scaffold 脚本同步的变更
- [ ] 更新 pnpm-lock.yaml（添加了 handlebars、tsx 等新依赖）
