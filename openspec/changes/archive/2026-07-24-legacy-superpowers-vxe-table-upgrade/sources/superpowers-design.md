# vxe-table 升级到最新版探索设计

## 背景

当前模板仍固定在 `vxe-table 4.3.7`，配套 `xe-utils ^3.5.0`。截至 **2026-07-24**，npm 上最新版已经是：

- `vxe-table 4.20.7`
- `xe-utils 4.0.11`

这不是一次“只改版本号”的升级。当前模板对 `vxe-table` 有三层直接耦合：

1. 运行时注册层：手动从 `vxe-table/es/*` 深路径导入模块、CSS，并控制 `Filter` 注册顺序。
2. 主题桥接层：基于 `4.3.7` 的真实 CSS 选择器和硬编码样式做覆盖。
3. 业务与类型层：`VxeGridInstance`、`VxeGridConstructor`、`VxeTableDefines`、`VxeCheckbox` 等类型与组件被直接引用。

因此，这次升级的本质不是“升级依赖”，而是“验证模板是否仍然匹配新版 VXE 运行时、类型系统和样式结构”。

## 已核实的当前状态

### 1. 依赖版本

- `template/package.json`
  - `vxe-table: 4.3.7`
  - `xe-utils: ^3.5.0`
- `template/pnpm-lock.yaml`
  - 当前实际锁到 `xe-utils 3.9.1`

### 2. 运行时接入方式

`template/src/core/plugins/vxeTable.ts`

- 直接深路径导入：
  - `vxe-table/es/v-x-e-table`
  - `vxe-table/es/grid`
  - `vxe-table/es/table`
  - `vxe-table/es/column`
  - `vxe-table/es/checkbox`
  - `vxe-table/es/filter`
  - `vxe-table/es/toolbar`
  - `vxe-table/es/vxe-pager`
  - `vxe-table/es/vxe-modal`
  - `vxe-table/es/tooltip`
- 直接深路径导入对应样式：
  - `.../style.css`
- 明确依赖 `Filter` 必须先于 `Grid` 注册，否则 `commitProxy('query')` 会触发 `getCheckedFilters is not a function`

这说明模板并不是使用 `app.use(VXETable)` 的黑盒模式，而是依赖 VXE 内部模块拆分和 hook 行为。

### 3. 主题桥接方式

`template/src/core/theme/bridges/vxeTable.ts`

当前主题桥接的注释已经把约束写得很清楚：

- 它是**按 `vxe-table@4.3.7` 的真实 CSS 结构**写的。
- 明确依赖以下选择器和结构：
  - `.vxe-table--render-default`
  - `.vxe-header--column`
  - `.vxe-body--column`
  - `.vxe-pager`
  - `.vxe-checkbox--icon`
  - `.vxe-sort--asc-btn.sort--active`
- 边框覆盖不是简单改 `border-color`，而是覆盖 `background-image: linear-gradient(...)`

这意味着只要新版 VXE 的 class 命名、层级结构、边框绘制方式、分页器 DOM 有变化，主题桥接就可能直接失效。

### 4. 业务与类型耦合点

以下位置直接依赖 VXE 类型或组件导出：

- `template/src/pages/user-management/features/user/composables/useUser.ts`
  - `import type { VxeGridInstance } from 'vxe-table'`
- `template/src/shared/components/cross-page-select/useCrossPageGrid.ts`
  - `import type { VxeGridConstructor } from 'vxe-table/types/grid'`
  - `import type { VxeTableDefines } from 'vxe-table/types/table'`
- `template/src/shared/components/cross-page-select/CrossPageCheckboxHeader.vue`
  - `import { VxeCheckbox } from 'vxe-table'`

这类依赖比模板标签 `<vxe-grid>` 更脆弱，因为它们依赖包的导出结构和类型文件路径保持稳定。

### 5. 业务示例与生成模板依赖

以下内容会被升级直接波及：

- `template/src/pages/user-management/features/user/views/UserList.view.vue`
- `template/src/pages/user-management/features/role/views/RoleList.view.vue`
- `template/src/pages/theme-preview/features/theme-preview/components/VxeTableShowcase.section.vue`
- `template/scripts/templates/feature/view-list.vue.hbs`
- `template/scripts/scaffold-core/args.ts`
- `template/scripts/scaffold-core/actions.ts`

说明：升级不是只修现有 demo，还会影响脚手架未来生成项目的默认表格方案。

## 最新版升级的风险判断

### 结论

**可以探索升级到 `vxe-table 4.20.7`，但不建议把它定义成“低风险依赖升级”。**

建议将其视为一次**中高风险前端基础设施升级**，原因如下：

1. 当前模板对 `vxe-table/es/*` 深路径导入耦合很重。
2. 当前主题桥接明确绑定到 `4.3.7` 的 CSS 结构。
3. 模板里存在 `vxe-table/types/*` 路径级类型引用。
4. 交互行为依赖 `proxyConfig + commitProxy + Filter hook` 这一套内部协作。

### 风险分级

| 风险项 | 等级 | 原因 |
|---|---|---|
| 深路径模块导入失效 | 高 | `es/*` 子模块、样式路径、导出名存在变化风险 |
| 主题覆盖失效 | 高 | 当前桥接明确绑定 `4.3.7` 的 DOM/CSS 选择器 |
| TS 类型路径失效 | 高 | `vxe-table/types/grid`、`types/table` 属于内部结构耦合 |
| `Filter -> Grid` 注册顺序问题 | 中 | hook 机制如果有调整，`commitProxy` 相关行为可能变 |
| 业务页面运行错误 | 中 | `proxyConfig.ajax.query`、checkbox、sort、pager 需要冒烟验证 |
| 生成模板回归 | 中 | 未来 scaffold 输出会继承升级后的 VXE 方案 |
| Vite 打包分 chunk 变化 | 低 | `vite.config.ts` 仅按包名 `vxe-table|xe-utils` 分组，通常可继续工作 |

## 推荐升级策略

### 推荐策略：分三阶段做，不要一步到位直接替换并发布

#### Phase 1：依赖与类型探针

目标：确认最新版在**不改业务代码语义**的前提下，最小改动能否编译通过。

建议动作：

1. 将模板依赖调整为：
   - `vxe-table -> 4.20.7`
   - `xe-utils -> ^4.0.11`
2. 优先修正类型路径和导出变化：
   - `VxeGridInstance`
   - `VxeGridConstructor`
   - `VxeTableDefines`
   - `VxeCheckbox`
3. 先让以下命令恢复通过：
   - `pnpm test`
   - `pnpm build`

此阶段不要立刻处理视觉细节，先确认构建和类型系统能站住。

#### Phase 2：运行时注册与交互回归

目标：确认 `setupVxeTable()` 的模块接入方式仍然成立。

重点验证：

1. `Filter` 先注册时，`commitProxy('query')` 是否仍正常。
2. `<vxe-grid>` 是否正常渲染。
3. `checkbox-config`、排序、分页是否仍可工作。
4. `CrossPageCheckboxHeader` 中 `VxeCheckbox` 的直接导入是否还能渲染。

如果新版不再适合当前这种“模块手工注册”方案，需要在这里决定是否改为更统一的安装方式。

#### Phase 3：主题桥接重做/校准

目标：重新核实新版真实 CSS 结构，校准 `core/theme/bridges/vxeTable.ts`。

这是升级里最容易被低估的一块。当前桥接文件不是“泛化主题”，而是“针对 4.3.7 的精确覆盖层”。  
因此，升级到 `4.20.7` 后，必须重新核实：

1. 主表容器 class 是否仍为 `.vxe-table--render-default`
2. header/body/footer/pager/checkbox/sort 的 class 是否变化
3. 边框是否仍通过 `background-image` 绘制
4. hover/current/checked 行状态是否还写在 `row` / `td` 上

如果这些结构变化明显，最合理的做法不是“继续补丁”，而是把桥接策略升级为“基于新版 DOM 重新建模”。

## 推荐的实施边界

### 建议纳入本次升级

- 模板依赖升级：
  - `template/package.json`
  - `template/pnpm-lock.yaml`
- 运行时注册兼容：
  - `template/src/core/plugins/vxeTable.ts`
- 类型与业务层兼容：
  - `template/src/pages/user-management/features/user/composables/useUser.ts`
  - `template/src/pages/user-management/features/role/composables/useRoleList.ts`
  - `template/src/shared/components/cross-page-select/useCrossPageGrid.ts`
  - `template/src/shared/components/cross-page-select/CrossPageCheckboxHeader.vue`
- 主题桥接兼容：
  - `template/src/core/theme/bridges/vxeTable.ts`
- 展示页/模板页回归验证：
  - `template/src/pages/theme-preview/features/theme-preview/components/VxeTableShowcase.section.vue`
  - `template/scripts/templates/feature/view-list.vue.hbs`

### 建议暂不纳入本次升级

- 引入 `vxe-pc-ui`、`@vxe-ui/core` 等新生态组件并重构模板架构
- 重做表格交互模型
- 替换 `proxyConfig` 方案
- 重做分页、筛选、跨页选择组件 API

原因：这些属于“借升级顺手重构”，会显著扩大改动面，模糊回归原因。

## 验证清单

### 编译与测试

1. `template` 下 `pnpm test` 通过
2. `template` 下 `pnpm build` 通过
3. 根目录 `pnpm test` 通过
4. 根目录 `pnpm build` 通过

### 运行时冒烟

1. 登录后 `UserList` 页面能正常渲染
2. `RoleList` 页面能正常渲染
3. `QueryFilter -> handleSearch -> commitProxy('query')` 正常
4. `checkbox` 选择、排序、分页正常
5. `CrossPageCheckboxHeader` 能正常渲染并响应点击
6. `ThemePreview` 中 VXE Showcase 能展示 hover/current/checkbox/sort/pager 状态

### 视觉回归

1. 表头背景色仍被主题系统接管
2. 边框线条没有错位或消失
3. hover/current/checked 状态颜色仍正确
4. pager 激活态与 hover 态仍正确
5. checkbox / sort 图标颜色仍被主题色覆盖

## 最终建议

### 建议结论

**建议升级，但建议按“探索分支 / 兼容性升级”来做，不建议直接当成普通依赖更新合并到模板主线。**

### 原因

1. 版本差距过大：`4.3.7 -> 4.20.7`
2. 当前模板对 VXE 内部结构依赖很重
3. 最脆弱的不是业务逻辑，而是：
   - 深路径导入
   - 类型路径
   - 主题桥接

### 执行建议

如果进入实现阶段，建议拆成两个提交：

1. `chore: upgrade vxe-table and xe-utils to latest v4`
2. `fix: realign vxe theme bridge and cross-page selection for latest vxe-table`

这样可以把“依赖变更”和“兼容修复”分离，后续 review 和回滚都更清晰。

## 一句话结论

**这次升级是可做的，但它本质上是一次 VXE 接入层兼容性改造，不是单纯的版本 bump。**
