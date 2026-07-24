## 背景

当前状态核实于 2026-07-24：

| 区域 | 当前状态 | 升级关注点 |
|---|---|---|
| 依赖 | `vxe-table: 4.3.7`，`xe-utils: ^3.5.0` | 最新已核实为 `vxe-table@4.20.7`，`xe-utils@4.0.11` |
| 运行时注册 | `template/src/core/plugins/vxeTable.ts` 直接导入大量 `vxe-table/es/*` 模块 | `npm pack vxe-table@4.20.7 --dry-run` 显示仍有 `es/grid`、`es/table`、`es/column`、`es/toolbar`，但旧接入使用的顶层 `es/filter`、`es/checkbox`、`es/vxe-pager`、`es/vxe-modal`、`es/tooltip` 路径未出现在包清单中 |
| 类型导入 | 使用包根导出的 `VxeGridInstance`，以及 `vxe-table/types/grid`、`vxe-table/types/table` | 包清单主要显示 `types/index.d.ts` 与 `types/all.d.ts`，内部类型路径应视为不稳定 |
| 主题桥接 | `template/src/core/theme/bridges/vxeTable.ts` 明确按 `vxe-table@4.3.7` CSS 结构编写 | `4.20.7` 包含更大的 `es/table/style.css` 和 theme 文件，选择器必须重新核实 |
| 业务使用 | `vxe-grid` 支撑用户列表、角色列表、生成列表模板和主题预览 | 导入、类型、样式调整后，现有行为必须保持稳定 |

这次升级有三个互相影响的部分：

```text
依赖版本
   |
   v
运行时注册 -----> 业务表格行为
   |                  |
   v                  v
样式导入 + 主题桥接 -> 视觉回归
```

## 目标 / 非目标

**目标：**

- 将模板升级到 `vxe-table@4.20.7` 与 `xe-utils@^4.0.11`。
- 保持生成后的后台模板仍基于 Vue 3、Vite、Ant Design Vue 3、Tailwind 和 `vxe-grid`。
- 保持列表页行为：代理查询、分页、排序、checkbox 选择、删除后刷新。
- 保持主题系统契约：VXE 的视觉表现继续由 `core/theme` 的主题 token 驱动。
- 建立可以证明构建、单测、运行时行为、主题视觉都通过的验证路径。

**非目标：**

- 本次不把整个表格栈迁移到 `vxe-pc-ui`。
- 本次不重设列表页数据流，也不替换 `proxyConfig`。
- 本次不重写跨页选择 UX，除非升级兼容必须调整。
- 如果 `docs/superpowers/*` 旧文档与本 OpenSpec change 冲突，以本 change 为准。

## 决策

### Decision 1: 按兼容性升级处理，而不是只升级依赖

原因：当前代码依赖内部模块路径、内部类型路径和 CSS 内部结构。`vxe-table@4.20.7` 仍保留部分熟悉的 ES 路径，但旧注册清单整体已经不能原样视为稳定。

备选方案：只修改 `package.json` 和 lockfile。拒绝原因是 `es/filter`、`es/checkbox`、`es/vxe-pager`、`es/vxe-modal`、`es/tooltip` 未出现在 `4.20.7` 包清单中。

### Decision 2: 运行时注册优先使用稳定的 VXE 安装路径

实现阶段应优先尝试稳定导入策略：

- 从 `vxe-table` 导入根安装器或配置对象。
- 从稳定发布路径导入全局或组件样式，例如 `vxe-table/es/style.css` 或 `vxe-table/es/index.css`。
- 通过受支持的安装入口注册模板需要的组件。

如果包体积或 tree-shaking 不可接受，再进行第二轮按需优化，选择当前确实存在的模块路径，例如 `vxe-table/es/grid`、`vxe-table/es/table`、`vxe-table/es/column`、`vxe-table/es/toolbar`。第二轮优化也不能继续依赖已移除的深路径。

### Decision 3: 第一轮升级不主动引入 `@vxe-ui/core`，除非编译证明必须

`@vxe-ui/core@4.4.18` 依赖 `xe-utils@^4.0.11`，属于新版 VXE 生态的一部分。只有当 `vxe-table@4.20.7` 或官方导入方式在实践中要求它时，才把它作为兼容依赖纳入。

原因：显式加入 `@vxe-ui/core` 会扩大模板对新版生态的暴露面，可能把一次 VXE v4 升级变成更大的生态迁移。本 change 的目标是让当前 `vxe-grid` 模板稳定运行在最新版 `vxe-table` v4 上。

### Decision 4: 类型导入围绕公开导出重建

内部类型路径应优先替换成包根公开导出的类型。如果旧类型没有等价公开导出，则为模板实际使用的方法定义窄接口，尤其是：

- `commitProxy('query')`
- `clearCheckboxRow()`
- `setCheckboxRow(rows, true)`
- 跨页选择消费的 checkbox 事件载荷

原因：模板并不需要完整的 VXE 内部 constructor 形状。窄接口可以降低未来升级耦合。

### Decision 5: 主题桥接校准是必做阶段

只有在 `template/src/core/theme/bridges/vxeTable.ts` 已按 `vxe-table@4.20.7` 的真实渲染 DOM 和 CSS 核实后，升级才算完成。

实现阶段必须验证：

- 主表容器 class
- header/body/footer column class
- pager class
- checkbox icon class
- sort active class
- 边框绘制方式，尤其是 `background-image: linear-gradient(...)`
- hover/current/checked 行状态 class

## 风险 / 取舍

| 风险 | 缓解方式 |
|---|---|
| 根安装器可能增大 `vendor-vxe` chunk | 先测量构建产物，行为稳定后再优化导入粒度 |
| 公开类型导出不匹配旧内部类型 | 为实际消费的方法和事件字段定义窄接口 |
| 主题选择器静默失效 | 使用 `ThemePreview` 作为视觉冒烟页，并检查升级后的真实 DOM/CSS |
| `commitProxy('query')` 行为变化 | 为搜索、重置、分页、reload 路径做运行时冒烟验证 |
| 跨页 checkbox header 失效 | 验证 `VxeCheckbox` 导入和渲染；如果直接导入变化，则考虑全局 `<vxe-checkbox>` 或本地 wrapper |
| 现有脏工作区干扰升级 diff | 保持本 OpenSpec change 独立，避免回滚无关既有改动 |

## 迁移计划

1. 依赖探针：
   - 更新 `template/package.json` 和 lockfile。
   - 在 `template` 内运行 `pnpm install`。
   - 运行 `pnpm test` 与 `pnpm build`，收集第一轮兼容错误。

2. 运行时注册：
   - 替换 `template/src/core/plugins/vxeTable.ts` 中已不适用的深路径导入。
   - 保留 VXE 中文 locale 设置。
   - 确认模板使用的 VXE 组件在 app mount 前完成注册。

3. 类型兼容：
   - 替换 `vxe-table/types/*` 导入。
   - 替换或收窄 `VxeGridInstance`、`VxeGridConstructor`、事件载荷类型。

4. 行为回归：
   - 验证 `UserList`、`RoleList`、`VxeTableShowcase` 和生成列表模板行为。
   - 验证搜索和重置仍触发 `commitProxy('query')`。
   - 验证 checkbox 选择、全选、排序、分页和删除后刷新。

5. 主题校准：
   - 对比 `4.20.7` 渲染 DOM/CSS 与当前主题桥接选择器。
   - 只在确认新结构后更新选择器。

6. 最终门禁：
   - `cd template && pnpm test`
   - `cd template && pnpm build`
   - 根目录 `pnpm test`
   - 根目录 `pnpm build`

回滚策略是正常 revert 依赖升级和兼容修复提交。实现时应尽量让依赖变更与兼容修复在 review 中容易区分。

## 未决问题

- `vxe-table@4.20.7` 的根安装方式是否会注册模板使用的所有组件，包括 pager、checkbox、modal、tooltip？
- 包根是否仍导出 `VxeGridInstance`、`VxeGridConstructor`、`VxeTableDefines`，还是应改用窄本地类型？
- `vxe-table/es/style.css` 是否包含当前按组件导入的所有样式？
- 最终依赖应精确锁定为 `4.20.7`，还是使用 patch 兼容的 `~4.20.7`？对本模板来说，只有第一轮验证通过后才考虑 `~4.20.7`。
