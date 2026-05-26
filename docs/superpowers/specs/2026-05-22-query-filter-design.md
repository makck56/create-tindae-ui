# QueryFilter 通用筛选组件设计

## 目标

用 config 驱动的方式替代每个页面手写筛选表单，消除 UserFilter 这类重复组件。

## 位置

`src/shared/components/query-filter/`
- `QueryFilter.vue` — 组件
- `index.ts` — 导出

## 类型定义

```typescript
type FilterItemConfig =
  | {
      type: 'input' | 'select' | 'tree-select' | 'cascader' | 'date-picker';
      label?: string;
      name: string;
      fieldProps?: Record<string, any>;
    }
  | {
      type: 'date-range';
      label?: string;
      name: [string, string];
      fieldProps?: Record<string, any>;
    };
```

## API

### Props

| Prop | 类型 | 默认值 | 作用 |
|------|------|--------|------|
| `config` | `FilterItemConfig[]` | — | 筛选项配置（必需） |
| `modelValue` | `Record<string, any>` | `{}` | 当前筛选值，支持 v-model:value |
| `labelWidth` | `number \| string` | — | form-item label 宽度 |

### Events

| 事件 | 参数 | 作用 |
|------|------|------|
| `update:modelValue` | `Record<string, any>` | 值变化时触发 |
| `search` | `Record<string, any>` | 点击查询按钮，携带当前值 |
| `reset` | — | 点击重置按钮 |

## 渲染逻辑

1. 外层 `a-form layout="inline"`
2. 遍历 config，每项渲染 `a-form-item :label="item.label"`，label 可选，无 label 时不显示标签，label 宽度由 `labelWidth` 控制
3. 根据 `item.type` 映射到 antdv 组件，通过 `v-bind="item.fieldProps"` 透传参数
4. 末尾固定渲染“查询”和“重置”按钮

## type 到组件映射

| type | 组件 |
|------|------|
| `input` | `a-input` |
| `select` | `a-select` |
| `tree-select` | `a-tree-select` |
| `cascader` | `a-cascader` |
| `date-picker` | `a-date-picker` |
| `date-range` | `a-range-picker` |

## date-range 处理

- `name` 为 `[startKey, endKey]`，如 `['startTime', 'endTime']`
- 渲染 `a-range-picker`
- 值变化时，将 `[start, end]` 解析为 `{ startTime: start, endTime: end }` 合并到 modelValue
- 重置时清空两个 key
- 反向同步：从 modelValue 中读取 `startTime` 和 `endTime` 组装为 `[start, end]` 回填到 range-picker

## 重置逻辑

生成一个全部值为 `undefined` 的对象（所有 config 项的 name），emit `update:modelValue` 和 `reset`。

## 使用示例

替换前（UserFilter.vue 手写）：

```vue
<UserFilter
  v-model:name="filters.name"
  v-model:status="filters.status"
  v-model:role="filters.role"
  @search="handleSearch"
  @reset="resetFilters"
/>
```

替换后：

```vue
<QueryFilter
  v-model:value="filters"
  :config="filterConfig"
  @search="handleSearch"
  @reset="resetFilters"
/>
```

```typescript
const filterConfig: FilterItemConfig[] = [
  { type: 'input', label: '用户名', name: 'name', fieldProps: { placeholder: '请输入用户名', allowClear: true } },
  { type: 'select', label: '状态', name: 'status', fieldProps: { placeholder: '请选择状态', allowClear: true, options: UserStatusOptions, style: { width: '120px' } } },
  { type: 'select', label: '角色', name: 'role', fieldProps: { placeholder: '请选择角色', allowClear: true, options: UserRoleOptions, style: { width: '120px' } } },
];
```

## 不包含

- 不内置搜索逻辑（由使用者处理）
- 不处理数据源请求（options 通过 fieldProps 传入）
- 不支持自定义插槽渲染筛选项（YAGNI，后续有需求再加）
- 不包含组件级 CSS 文件
