# 项目状态 (2026-05-14)

## 已完成

### vxe-table 重构
- vxe-table 版本锁定 4.3.7
- vxeTable.ts 改为 defineAsyncComponent 同步注册 + requestIdleCallback 空闲预加载
- view 零导入 vxe-table 组件，全局注册后直接使用 `<vxe-grid>` / `<vxe-table>` 等
- UserList 从 vxe-table + vxe-column + a-pagination 迁移到 vxe-grid（gridOptions 模式）
- gridOptions 包含 proxyConfig.ajax.query + props 映射（`result: 'list', total: 'total'`）
- 提交: `3ae20a7 refactor: vxe-table idle loading with defineAsyncComponent and vxe-grid`

### Scaffold 模板重构
- view-list.vue.hbs: 改用 vxe-grid + slot 模板，Handlebars 转义 Vue `{{ }}`
- composable-list.ts.hbs: 返回 gridOptions（columns/pagerConfig/proxyConfig）
- api.ts.hbs: axios.create 模式 + `.api.ts` 后缀
- model.ts.hbs: PascalCase 文件名 + ListParams/ListResult 类型 + barrel index
- page-list.vue.hbs: 添加 defineOptions 组件名
- actions.ts: model 文件用 toPascalCase，自动生成 models/index.ts，API 文件名加 .api 后缀
- 移除 components/shared 目录的默认生成
- 提交: `55e8567 refactor: scaffold templates use vxe-grid and consistent naming`

### 构建优化
- vite.config.ts: manualChunks 拆分 vendor-antd 和 vendor-vxe
- dev server 添加 `host: true`
- 提交: `d921057 feat: pin vxe-table to 4.3.7, add vendor chunks and dev host config`

### useSpin composable
- 4 状态机（IDLE → PENDING → SPINNING → LINGERING → IDLE）
- 延迟开启 loading（默认 300ms），开启后最少展示（默认 500ms）
- 9 个单元测试全部通过
- 位置: `template/src/shared/composables/useSpin.ts`
- 提交: `7da7692 feat: add useSpin composable with state machine`

### Auth 模块更新 & Login 页面重构
- auth api/stores/models 更新
- login 页面拆分为 features（composables: useLoginForm, useCaptcha, useRsaEncrypt + views: Login.view.vue）
- 提交: `8b520c3 feat: auth module updates, login page refactor, and route cleanup`

### 文档整理
- 删除根目录 docs/ 下过时文档，保留 template/ARCHITECTURE.md
- ARCHITECTURE.md 新增轻量域规范（扁平结构，适用于 login/error 等简单域）
- 新增 specs/plans: vxe-table-idle-loading, usespin-composable
- 提交: `34de902`, `78840b0`

## 待办

- [ ] Mock server（登录页无法登录，无后端服务）
- [ ] 轻量项目使用指南：是否需要在 ARCHITECTURE.md 中补充"按需展开"理念
- [ ] vxe-table CSS 预加载完整性（toolbar/pager/modal/tooltip 样式）
- [ ] API 层共享 axios 实例（当前每个 feature 独立 axios.create）
- [ ] useSpin 在项目中的实际接入
