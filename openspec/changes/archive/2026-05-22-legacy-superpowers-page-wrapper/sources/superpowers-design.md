# PageWrapper 公共布局组件设计

## 目标

为通用表格页面提供统一的上中下布局组件，消除每个 view 页面重复的布局代码。

## 位置

`src/shared/components/page-wrapper/`
- `PageWrapper.vue` — 组件
- `index.ts` — 导出

## 布局结构

```
┌─────────────────────────────────────┐
│  header（卡片：白底+圆角+padding）    │
│  ┌───────────────┐ ┌─────────────┐  │
│  │   #search     │ │   #extra    │  │
│  └───────────────┘ └─────────────┘  │
├─────────────────────────────────────┤
│                                     │
│  #default（flex:1 填满剩余高度）       │
│                                     │
├─────────────────────────────────────┤
│  #footer（可选，默认不渲染）           │
└─────────────────────────────────────┘
```

## 插槽

| 插槽 | 作用 | 条件 |
|------|------|------|
| `#header` | 完全自定义 header，替换默认的 search+extra | 可选 |
| `#search` | header 左侧搜索区域 | 可选，仅在未使用 `#header` 时生效 |
| `#extra` | header 右侧额外操作区域 | 可选，仅在未使用 `#header` 时生效 |
| `#default` | 主内容区（表格） | 必需 |
| `#footer` | 底部区域（分页器等） | 可选，有内容时渲染 |

## Props

| Prop | 类型 | 默认值 | 作用 |
|------|------|--------|------|
| `headerClass` | `string` | — | 覆盖 header 区域的 class |
| `headerStyle` | `StyleValue` | — | 覆盖 header 区域的 style |
| `contentClass` | `string` | — | 覆盖 content 区域的 class |
| `contentStyle` | `StyleValue` | — | 覆盖 content 区域的 style |
| `footerClass` | `string` | — | 覆盖 footer 区域的 class |
| `footerStyle` | `StyleValue` | — | 覆盖 footer 区域的 style |

## 样式（Tailwind CSS）

**外层容器：** `flex flex-col h-full`

**Header（默认，未使用 #header 时）：**
- 默认 class：`bg-white rounded p-4 mb-4`
- 内部：`flex items-center justify-between`
- props 传入的 `headerClass` / `headerStyle` 追加到容器上

**Default 区域：**
- 默认 class：`flex-1 overflow-auto p-4`
- props 传入的 `contentClass` / `contentStyle` 追加到容器上

**Footer 区域：**
- 默认 class：`pt-4`
- props 传入的 `footerClass` / `footerStyle` 追加到容器上

## 使用示例

```vue
<PageWrapper>
  <template #search>
    <UserFilter ... />
  </template>
  <template #extra>
    <a-button type="primary">新增用户</a-button>
  </template>

  <vxe-grid v-bind="gridOptions" />

  <template #footer>
    <vxe-pager ... />
  </template>
</PageWrapper>
```

完全自定义 header：

```vue
<PageWrapper>
  <template #header>
    <div class="flex items-center justify-between">
      <span>自定义标题</span>
      <a-button>操作</a-button>
    </div>
  </template>

  <vxe-grid v-bind="gridOptions" />
</PageWrapper>
```

## 不包含

- 不内置 loading/spin 状态
- 不内置分页器组件
- 不绑定任何业务数据
- 不包含组件级 CSS 文件，全部使用 Tailwind 类
