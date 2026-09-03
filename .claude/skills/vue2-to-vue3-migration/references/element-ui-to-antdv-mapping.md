# ElementUI → Ant Design Vue 组件映射表

## 使用说明

此映射表覆盖 ElementUI 1.x/2.x 到 Ant Design Vue 4.x 的组件替换方案。
**原则**：表格类页面优先使用 `vxe-grid`（表格内置分页、排序、筛选），简单展示优先使用 `a-table`。

---

## 通用组件

### Button 按钮

| ElementUI | Ant Design Vue | Props 差异 |
|-----------|---------------|------------|
| `<el-button>` | `<a-button>` | |
| `type="primary"` | `type="primary"` | 颜色有差异 |
| `type="success"` | `type="primary"` + 绿色主题 | AntDV 无 `success` type |
| `type="warning"` | `type="default"` + 黄色主题 | AntDV 无 `warning` type |
| `type="danger"` | `danger` (属性) | AntDV 是独立 prop |
| `type="info"` | `type="default"` | |
| `type="text"` | `type="link"` | |
| `icon="el-icon-xxx"` | `<template #icon><XxxOutlined /></template>` | 图标导入方式完全不同 |
| `size="mini"` | `size="small"` | AntDV 无 mini |
| `plain` | `ghost` | 幽灵按钮 |
| `round` | `shape="round"` | |
| `circle` | `shape="circle"` | |
| `loading` | `loading` | |
| `disabled` | `disabled` | |

### Input 输入框

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-input>` | `<a-input>` |
| `v-model` | `v-model:value`（或直接 `v-model`） |
| `type="textarea"` | `<a-textarea>` |
| `show-password` | `<a-input-password>` |
| `clearable` | `allow-clear` |
| `show-word-limit` | `:show-count="true"` |
| `prefix-icon` | `<template #prefix>` |
| `suffix-icon` | `<template #suffix>` |
| `<el-input-number>` | `<a-input-number>` |

### Select 选择器

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-select>` | `<a-select>` |
| `v-model` | `v-model:value` |
| `multiple` | `mode="multiple"` |
| `filterable` | `show-search` |
| `clearable` | `allow-clear` |
| `placeholder` | `placeholder` |
| `<el-option>` | `<a-select-option>` |
| `el-option` 的 `label` | `a-select-option` 的子内容 |
| `el-option` 的 `value` | `a-select-option` 的 `value` |
| `remote` + `remote-method` | `filter-option` + `@search` |
| **推荐**：`<el-select v-model="x"><el-option v-for...>` | **推荐**：`<a-select v-model:value="x" :options="options">` |

### Form 表单

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-form>` | `<a-form>` |
| `model` | `model` |
| `rules` | `rules` |
| `label-width="100px"` | `:label-col="{ style: { width: '100px' } }"` |
| `inline` | `layout="inline"` |
| `size` | `size` |
| `hide-required-asterisk` | `:hide-required-mark="true"` |
| `<el-form-item>` | `<a-form-item>` |
| `label` | `label` |
| `prop` | `name` |
| `required` | `required` |

**验证规则格式差异：**

```javascript
// ElementUI
rules: {
  name: [
    { required: true, message: '必填', trigger: 'blur' }
  ]
}

// Ant Design Vue
rules: {
  name: [
    { required: true, message: '必填', trigger: 'blur' }
  ]
}
// → trigger: 'blur' → trigger: 'change'（AntDV 默认 change）
```

---

## 数据展示

### Table 表格

| ElementUI | 目标替代 | 适用场景 |
|-----------|---------|----------|
| `<el-table>` | `<vxe-grid>` | 复杂表格（分页、排序、勾选、工具栏） |
| `<el-table>` | `<a-table>` | 简单数据展示、展开行 |

**el-table → vxe-grid 映射：**

| el-table 属性 | vxe-grid 属性 |
|---------------|---------------|
| `:data` | proxyConfig 中的 ajax.query（远程分页） |
| `border` | `border` |
| `stripe` | `stripe` |
| `height` | `height="auto"` |
| `size` | `size` |
| `empty-text` | `empty-text` 插槽 |

| el-table-column | vxe-grid columns 配置 |
|-----------------|----------------------|
| `prop` | `field` |
| `label` | `title` |
| `width` | `width` |
| `min-width` | `min-width` |
| `fixed` | `fixed` |
| `sortable` | `sortable: true` |
| `align` | `align` |
| `formatter` | `formatter` |
| 自定义插槽 | `slots: { default: 'slot_name' }` |

**el-table → a-table 映射：**

| el-table 属性 | a-table 属性 |
|---------------|-------------|
| `:data` | `:data-source` |
| `border` | `bordered` |
| `stripe` | 无内置，用 rowClassName |
| `@selection-change` | `row-selection` 的 `onChange` |
| el-table-column `prop` | columns 的 `dataIndex` |
| el-table-column `label` | columns 的 `title` |

### Pagination 分页

**通常不需要单独使用**：`vxe-grid` 内置 proxyConfig 自动处理分页。

若独立使用：

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-pagination>` | `<a-pagination>` |
| `@size-change` | `@showSizeChange` |
| `@current-change` | `@change` |
| `layout` | 无对应，用 `show-size-changer`、`show-quick-jumper` 等独立 prop |

### Tag 标签

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-tag>` | `<a-tag>` |
| `type="primary"` | `color="blue"` |
| `type="success"` | `color="green"` |
| `type="warning"` | `color="orange"` |
| `type="danger"` | `color="red"` |
| `type="info"` | `color="default"` |
| `closable` | `closable` |
| `size` | 靠 class 或 style 控制 |
| `effect="dark/plain"` | 无对应 |

### Tree 树形控件

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-tree>` | `<a-tree>` |
| `data` | `tree-data` |
| `props`（指定 children/label） | `field-names` |
| `default-expanded-keys` | `default-expanded-keys` |
| `node-key` | `field-names` 中的 key |
| `show-checkbox` | `checkable` |
| `@check` | `@check` |
| `@node-click` | `@select` |

---

## 反馈组件

### Dialog / Modal 对话框

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-dialog>` | `<a-modal>` |
| `visible.sync` | `v-model:open` ⚠️ 属性名不同 |
| `title` | `title` |
| `width` | `width` |
| `@close` | `@cancel` |
| `:before-close` | `@cancel` 中逻辑处理 |
| `close-on-click-modal` | `:mask-closable` |
| `close-on-press-escape` | `:keyboard` |
| `center` | `centered` |
| `fullscreen` | `:width="'100%'"` + 自定义样式 |
| `<el-dialog>` footer 插槽 | `<a-modal>` footer 插槽或 `:footer="null"` |

### Message 消息提示

⚠️ **不再使用 `this.$message`，改为函数式导入：**

```typescript
// ❌ Vue2 ElementUI
this.$message.success('操作成功')
this.$message.error('操作失败')

// ✅ Vue3 Ant Design Vue
import { message } from 'ant-design-vue/es/message'
message.success('操作成功')
message.error('操作失败')
```

### MessageBox 弹框

```typescript
// ❌ Vue2 ElementUI
this.$confirm('确定删除？', '提示', {
  confirmButtonText: '确定',
  cancelButtonText: '取消',
  type: 'warning'
}).then(() => { /* 确定 */ })

// ✅ Vue3 Ant Design Vue
import { Modal } from 'ant-design-vue/es/modal'
Modal.confirm({
  title: '确定删除？',
  content: '此操作不可撤销',
  okText: '确定',
  cancelText: '取消',
  okType: 'danger',
  onOk: () => { /* 确定 */ }
})
```

### Notification 通知

```typescript
// ❌ Vue2 ElementUI
this.$notify({ title: '成功', message: '操作成功', type: 'success' })

// ✅ Vue3 Ant Design Vue
import { notification } from 'ant-design-vue/es/notification'
notification.success({ message: '成功', description: '操作成功' })
```

### Drawer 抽屉

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-drawer>` | `<a-drawer>` |
| `visible.sync` | `v-model:open` |
| `direction` | `placement`（left/right/top/bottom） |
| `size` | `width`（左右）/ `height`（上下） |

### Loading 加载

| ElementUI | 目标替代 |
|-----------|---------|
| `v-loading` 指令 | `<a-spin :spinning="loading">` 包裹 |
| `this.$loading()` 服务 | 使用 `<a-spin>` 组件 |

---

## 导航组件

### Menu 菜单

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-menu>` | `<a-menu>` |
| `mode="horizontal"` | `mode="horizontal"` |
| `mode="vertical"` | `mode="inline"` |
| `default-active` | `selected-keys` |
| `@select` | `@click`（回调参数不同） |
| `<el-submenu>` | `<a-sub-menu>` |
| `<el-menu-item>` | `<a-menu-item>` |

### Tabs 标签页

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-tabs>` | `<a-tabs>` |
| `value` / `v-model` | `active-key` / `v-model:active-key` |
| `type="card"` | `type="card"` |
| `type="border-card"` | 无直接对应 |
| `tab-position="left"` | `tab-position="left"` |
| `<el-tab-pane>` | `<a-tab-pane>` |
| `label` | `tab` |
| `name` | `key` ⚠️ 属性名不同 |

### Breadcrumb 面包屑

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-breadcrumb>` | `<a-breadcrumb>` |
| `<el-breadcrumb-item>` | `<a-breadcrumb-item>` |
| `separator` | `separator` |

### Steps 步骤条

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-steps>` | `<a-steps>` |
| `active` | `current` ⚠️ 属性名不同 |
| `direction="vertical"` | `direction="vertical"` |
| `simple` | 无直接对应 |
| `<el-step>` | `<a-step>` |
| `title` | `title` |
| `description` | `description` |
| `icon` | `icon` |

### Dropdown 下拉菜单

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-dropdown>` | `<a-dropdown>` |
| `trigger="click"` | `trigger="['click']"` |
| `@command` | 每个 item 独立 `@click` |
| `<el-dropdown-menu>` | `<template #overlay><a-menu>` |
| `<el-dropdown-item>` | `<a-menu-item>` |

---

## 表单组件

### DatePicker 日期选择器

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-date-picker>` | `<a-date-picker>` |
| `type="date"` | 默认行为 |
| `type="datetime"` | `show-time` |
| `type="daterange"` | `<a-range-picker>` |
| `type="month"` | `picker="month"` |
| `type="year"` | `picker="year"` |
| `format` | `format`（格式字符串可能不同） |
| `value-format` | `value-format` |
| `placeholder` | `placeholder` |

### TimePicker 时间选择器

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-time-picker>` | `<a-time-picker>` |
| `is-range` | `<a-time-range-picker>` |

### Upload 上传

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-upload>` | `<a-upload>` |
| `action` | `action` 或 `custom-request` |
| `:file-list` | `file-list` |
| `list-type="picture-card"` | `list-type="picture-card"` |
| `:on-success` | `@change` 中判断 status |
| `:before-upload` | `:before-upload` |
| `:limit` | `:max-count` |
| `auto-upload` | 用 `custom-request` 手动控制 |

### Switch 开关

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-switch>` | `<a-switch>` |
| `v-model` | `v-model:checked` |
| `active-text` | `checked-children` |
| `inactive-text` | `un-checked-children` |

### Slider 滑块

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-slider>` | `<a-slider>` |
| `v-model` | `v-model:value` |
| `range` | `range` |
| `show-stops` | 无内置 |
| `marks` | `marks` |

### Rate 评分

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-rate>` | `<a-rate>` |
| `v-model` | `v-model:value` |
| `show-text` | `:tooltips` |

### Transfer 穿梭框

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-transfer>` | `<a-transfer>` |
| `data` | `data-source` |
| `props` | 直接用 `data-source` 格式 |
| `titles` | `titles` |

### Cascader 级联选择器

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-cascader>` | `<a-cascader>` |
| `options` | `options` |
| `props` | `field-names` |
| `v-model` | `v-model:value` |

### ColorPicker 颜色选择器

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-color-picker>` | `<a-color-picker>` |

---

## 数据展示组件

### Card 卡片

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-card>` | `<a-card>` |
| `header` 插槽 | `title` 插槽 |
| `body-style` | 使用 class 控制 |

### Collapse 折叠面板

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-collapse>` | `<a-collapse>` |
| `v-model` | `v-model:active-key`（数组） |
| `<el-collapse-item>` | `<a-collapse-panel>` |
| `title` | `header` |
| `name` | `key` |

### Descriptions 描述列表

ElementUI 无内置组件，AntDV 有 `<a-descriptions>` + `<a-descriptions-item>`。

### Image 图片

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-image>` | `<a-image>` |
| `src` | `src` |
| `preview-src-list` | `<a-image-preview-group>` 包裹 |

### Skeleton 骨架屏

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-skeleton>` | `<a-skeleton>` |
| `animated` | `active` |
| `count` | 用 v-for 循环 |

### Empty 空状态

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-empty>` | `<a-empty>` |
| `description` | `description` |
| `image` | `image` 插槽或自定义 |

### Result 结果

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-result>` | `<a-result>` |
| `status` 值可能不同：`success/warning/info/error` | `status` 值：`success/info/warning/error/403/404/500` |

---

## 其他组件

### Icon 图标

```typescript
// ❌ Vue2 ElementUI
<i class="el-icon-edit" />

// ✅ Vue3 Ant Design Vue
import { EditOutlined } from '@ant-design/icons-vue'
// <EditOutlined />
```

⚠️ **ElementUI 图标名和 AntDV 图标组件名完全不同，必须逐个查找对应关系。**

### Popover / Popconfirm

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-popover>` | `<a-popover>` |
| `trigger="hover"` | `trigger="hover"` |
| `content` | `content` |
| `title` | `title` |
| `<el-popconfirm>` | `<a-popconfirm>` |

### Tooltip

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-tooltip>` | `<a-tooltip>` |
| `content` | `title` ⚠️ 属性名不同 |
| `effect="dark"` | `color` 控制 |

### Divider 分割线

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-divider>` | `<a-divider>` |
| `direction` | `type="vertical"` / `type="horizontal"` |
| `content-position` | `orientation="left/center/right"` |

### Badge 标记

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-badge>` | `<a-badge>` |
| `value` | `count` |
| `is-dot` | `:dot="true"` |

### Avatar 头像

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-avatar>` | `<a-avatar>` |
| `size` | `size` |
| `shape` | `shape` |

### Alert 警告

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-alert>` | `<a-alert>` |
| `type="success"` | `type="success"` |
| `closable` | `closable` |
| `show-icon` | `show-icon` |

### Progress 进度条

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-progress>` | `<a-progress>` |
| `percentage` | `percent` ⚠️ 属性名不同 |
| `stroke-width` | `stroke-width` |
| `type="circle"` | `type="circle"` |

### Timeline 时间线

| ElementUI | Ant Design Vue |
|-----------|---------------|
| `<el-timeline>` | `<a-timeline>` |
| `<el-timeline-item>` | `<a-timeline-item>` |

---

## 特殊场景处理

### 表格中的指令式 loading

```html
<!-- ❌ Vue2：v-loading 指令 -->
<el-table v-loading="loading" :data="list">

<!-- ✅ Vue3 + vxe-grid：loading 属性 -->
<vxe-grid :loading="loading">

<!-- ✅ Vue3 + a-table：loading 属性 -->
<a-table :loading="loading" :data-source="list">
```

### xss 过滤 `{{}}` → `v-html`

```html
<!-- ❌ 不做：Vue2 中用 v-html 渲染 HTML -->
<div v-html="htmlStr" />

<!-- ✅ 用 Markdown 组件渲染 -->
<Markdown :source="htmlStr" />
```

### 事件名对标

ElementUI 的事件多以 `@xxx` 裸名出现，AntDV 大部分事件名称一致，但回调参数可能不同，遇到报错时查阅 AntDV 文档确认参数格式。
