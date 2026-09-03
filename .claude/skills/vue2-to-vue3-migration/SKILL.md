---
name: vue2-to-vue3-migration
description: Use when converting a Vue2 + ElementUI + SCSS page to the current project (Vue3 + Ant Design Vue + Tailwind CSS). Triggers on: "migrate from Vue2", "convert ElementUI page", "upgrade Vue2 project", or user provides a .vue file written in Vue2 Options API with ElementUI components and SCSS styles.
---

# Vue2 → Vue3 页面迁移

## 概述

将一个 Vue2 + ElementUI + SCSS 的页面**逐层转换**为目标项目页面：Vue3 Composition API (`<script setup lang="ts">`) + Ant Design Vue 4.x + Tailwind CSS 4.x + TypeScript。

**核心原则：先拆解再替换，拒绝一次性全量重写。** 优先保持业务逻辑不变，仅做技术栈迁移。

## 何时使用

```
接收 Vue2 页面源码？
├─ 是 .vue 单文件组件 → 继续
├─ 使用 Options API（data/methods/computed/watch）→ 继续
├─ 包含 ElementUI 组件（el-*）→ 继续
├─ 包含 SCSS 样式（scoped lang="scss"）→ 继续
└─ → 使用此 Skill
```

**不适用场景：**
- 源项目已经是 Vue3 + Composition API（只需组件库迁移，参见 references/）
- 源项目使用其他 UI 库（如 Bootstrap-Vue、Vuetify）
- 仅需样式迁移，不涉及组件替换

## 目标项目技术栈速览

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3.5 (`<script setup lang="ts">`) |
| UI 组件库 | Ant Design Vue 4.x (主) + vxe-table 4.x (表格) |
| 样式 | Tailwind CSS 4.x + CSS 变量主题系统 |
| 状态管理 | Pinia (全局) + composables (局部) |
| 路由 | Vue Router 4.x |
| 语言 | TypeScript（strict） |
| 图标 | @ant-design/icons-vue |

## 四阶段迁移工作流

### 阶段 1：分析源页面

**在动笔之前，先分析源页面的完整结构：**

1. **列出所有 ElementUI 组件**：扫描 template 中所有 `el-*` 标签
2. **提取 Options API 区块**：识别 `data()`、`computed`、`watch`、`methods`、`mounted` 等
3. **识别 SCSS 变量和 mixin**：找出 `$variable`、`@mixin`、`@include`
4. **标记业务逻辑**：区分「纯 UI 逻辑」和「业务逻辑」，后者要完整保留
5. **识别 API 调用模式**：记录 `axios`/`this.$http` 调用方式

### 阶段 2：脚本迁移（最优先）

**必须严格按照以下顺序转换：**

#### 2.1 结构替换

```
<script>                    →  <script setup lang="ts">
export default {           →  （删除，改为顶层代码）
  components: {},          →  import 后自动注册
  props: {},               →  defineProps<T>()
  emits: [],               →  defineEmits<T>()
  data() { return {} },    →  ref() / reactive()
  computed: {},            →  computed()
  watch: {},               →  watch() / watchEffect()
  methods: {},             →  纯函数 function
  mounted() {},            →  onMounted(() => {})
  beforeDestroy() {},      →  onBeforeUnmount(() => {})
}
```

#### 2.2 生命周期映射

| Vue2 | Vue3 |
|------|------|
| `beforeCreate` | `setup()` 顶层代码（直接执行） |
| `created` | `setup()` 顶层代码（直接执行） |
| `beforeMount` | `onBeforeMount` |
| `mounted` | `onMounted` |
| `beforeUpdate` | `onBeforeUpdate` |
| `updated` | `onUpdated` |
| `beforeDestroy` | `onBeforeUnmount` |
| `destroyed` | `onUnmounted` |
| `errorCaptured` | `onErrorCaptured` |

#### 2.3 关键语法转换

```typescript
// ❌ Vue2 Options API
export default {
  data() {
    return { count: 0, name: '' }
  },
  computed: {
    double() { return this.count * 2 }
  },
  watch: {
    count(val) { console.log(val) }
  },
  methods: {
    increment() { this.count++ }
  },
  mounted() { this.fetchData() }
}

// ✅ Vue3 Composition API
const count = ref(0)
const name = ref('')
const double = computed(() => count.value * 2)
watch(count, (val) => console.log(val))
function increment() { count.value++ }
onMounted(() => fetchData())
```

#### 2.4 Vue2 特有语法处理

| Vue2 语法 | Vue3 替代 |
|-----------|----------|
| `this.$refs.xxx` | `const xxx = ref<HTMLElement>()` + `xxx.value` |
| `this.$router.push()` | `useRouter().push()` |
| `this.$route.params` | `useRoute().params` |
| `this.$emit('event', data)` | `const emit = defineEmits<{...}>()` + `emit('event', data)` |
| `this.$message.success()` | `import message from 'ant-design-vue/es/message'` |
| `this.$confirm()` | `import Modal from 'ant-design-vue/es/modal'` |
| `filters: { xxx }` | 纯函数 `function xxx() {}` 或 `computed()` |
| `v-model` (单个) | `v-model`（不变，但也支持多个 `v-model:xxx`） |
| `.sync` 修饰符 | `v-model:propName` |
| `$listeners` | 合并到 `$attrs`，透传用 `v-bind="$attrs"` |

### 阶段 3：组件映射（ElementUI → Ant Design Vue）

**详细映射表见** `references/element-ui-to-antdv-mapping.md`

**快速对照（常用组件）：**

| ElementUI | Ant Design Vue | 备注 |
|-----------|---------------|------|
| `el-button` | `a-button` | type 值不同，见映射表 |
| `el-input` | `a-input` | v-model 行为基本一致 |
| `el-select` + `el-option` | `a-select` + `a-select-option` | options 属性更推荐 |
| `el-table` | `vxe-grid`（表格页）/ `a-table`（展示页） | vxe-grid 更适合复杂表格 |
| `el-form` + `el-form-item` | `a-form` + `a-form-item` | rules 语法不同 |
| `el-dialog` | `a-modal` | visible → open |
| `el-message-box` | `Modal.confirm()` | 函数式调用 |
| `el-tag` | `a-tag` | type → color |
| `el-pagination` | vxe-grid 内置 / `a-pagination` | 通常不用单独写 |
| `el-tabs` + `el-tab-pane` | `a-tabs` + `a-tab-pane` | name → key |
| `el-tree` | `a-tree` | props 结构不同 |
| `el-switch` | `a-switch` | 基本一致 |
| `el-radio` + `el-radio-group` | `a-radio` + `a-radio-group` | 基本一致 |
| `el-checkbox` + `el-checkbox-group` | `a-checkbox` + `a-checkbox-group` | 基本一致 |
| `el-date-picker` | `a-date-picker` / `a-range-picker` | type 值不同 |
| `el-upload` | `a-upload` | action → customRequest |
| `el-popover` | `a-popover` | trigger/content 属性对齐 |
| `el-tooltip` | `a-tooltip` | 基本一致 |
| `el-dropdown` | `a-dropdown` | 插槽结构有差异 |
| `el-menu` | `a-menu` | mode="horizontal"/"inline" |
| `el-card` | `a-card` | 基本一致 |
| `el-divider` | `a-divider` | 基本一致 |
| `el-empty` | `a-empty` | 基本一致 |
| `el-badge` | `a-badge` | value → count |
| `el-avatar` | `a-avatar` | 基本一致 |
| `el-alert` | `a-alert` | type 值可能不同 |
| `el-skeleton` | `a-skeleton` | 属性有差异 |
| `el-result` | `a-result` | 基本一致 |
| `el-icon` | `@ant-design/icons-vue` 中的具名组件 | 按需导入 |
| `el-image` | `a-image` | 基本一致 |

### 阶段 4：样式迁移（SCSS → Tailwind CSS）

**详细映射表见** `references/scss-to-tailwind.md`

#### 4.1 三层样式策略

当遇到 SCSS 样式时，按以下优先级选择方案：

| 优先级 | 方案 | 适用场景 |
|--------|------|----------|
| 1 | **Tailwind 工具类** | 间距、尺寸、颜色、排版、边框、Flex/Grid 布局 |
| 2 | **CSS 变量（项目主题系统）** | 主题相关的颜色、圆角、阴影、字体 |
| 3 | **`<style scoped>`** | 组件特有、无法用 Tailwind 表达的样式 |

#### 4.2 核心转换规则

```scss
// ❌ SCSS：变量定义
$primary-color: #1890ff;
$border-radius: 6px;

// ✅ Tailwind：直接使用工具类
// <div class="bg-blue-500 rounded-md">

// 或使用项目 CSS 变量
// background: var(--td-color-primary);
// border-radius: var(--td-border-radius-base);
```

```scss
// ❌ SCSS：嵌套选择器
.container {
  padding: 16px;
  .header {
    font-size: 18px;
    .title { color: red; }
  }
}

// ✅ Tailwind：扁平化 + 类名
// <div class="p-4">
//   <div class="text-lg">
//     <span class="text-red-500">
```

```scss
// ❌ SCSS：mixin
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

// ✅ Tailwind：直接使用工具类
// <div class="flex items-center justify-center">
```

```scss
// ❌ SCSS：deep selector
.parent ::v-deep .child { color: red; }

// ✅ Vue3 scoped：:deep() 伪类
// .parent :deep(.child) { color: red; }
```

#### 4.3 项目主题变量

项目通过 `@/core/theme` 提供了完整的 CSS 变量系统：

```css
/* 常用主题变量 */
--td-color-primary        /* 主色 */
--td-color-success        /* 成功色 */
--td-color-warning        /* 警告色 */
--td-color-error          /* 错误色 */
--td-border-radius-base   /* 基础圆角 */
--td-font-size-base       /* 基础字号 */
--td-line-height-base     /* 基础行高 */
--td-spacing-*            /* 间距系列 */
```

在组件中通过 `useTheme()` composable 访问主题：

```typescript
import { useTheme } from '@/core/theme'
const { theme, setTheme } = useTheme()
```

### 阶段 5：文件组织（适配目标项目结构）

源 Vue2 的**单文件页面**需要按目标项目规范拆分为多层：

```
# 源文件（Vue2 通常是一个文件）
UserManage.vue  (template + script + style 全部在一起)

# 目标文件（拆分为多层结构）
pages/user-management/
├── pages/
│   └── UserList.page.vue        # 页面入口（薄层，仅路由绑定）
├── features/user/
│   ├── views/
│   │   └── UserList.view.vue     # 功能视图（完整 template + 逻辑）
│   ├── composables/
│   │   └── useUser.ts            # 可复用逻辑 hooks
│   ├── models/
│   │   └── User.ts               # TypeScript 类型/接口/枚举
│   ├── api/
│   │   └── user.api.ts           # API 请求函数
│   └── constants/
│       └── index.ts              # 常量（枚举选项等）
└── user-management.routes.ts     # 路由定义
```

**拆分原则：**

1. `.page.vue` — 仅做路由绑定，极薄，只有 `<script setup>` + 单个 `<XxxView />`
2. `.view.vue` — 包含完整 template 和组件级逻辑
3. `composables/` — 将源文件 `methods` 中的可复用逻辑提取为 composable
4. `models/` — 将源文件中的数据模型提取为 TS 接口和 const enum
5. `api/` — 将 `axios`/`this.$http` 调用提取为独立的 API 函数
6. `constants/` — 将硬编码的枚举选项值提取为常量

## 实施清单（每次迁移必过）

完成迁移后，逐一验证：

- [ ] `<script setup lang="ts">` 已替换 Options API
- [ ] 所有 `el-*` 组件已映射到对应的 `a-*` / `vxe-*`
- [ ] ElementUI icons 已替换为 `@ant-design/icons-vue` 的具名组件
- [ ] `this.$message` / `this.$confirm` 已替换为函数式导入
- [ ] `this.$router` / `this.$route` 已替换为 `useRouter()` / `useRoute()`
- [ ] Filters 已替换为纯函数或 computed
- [ ] `.sync` 已替换为 `v-model:propName`
- [ ] SCSS 变量/mixin 已转换为 Tailwind 工具类或 CSS 变量
- [ ] `/deep/` / `::v-deep` 已替换为 `:deep()`
- [ ] TypeScript 类型已定义，无隐式 `any`
- [ ] `defineOptions({ name: '...' })` 已添加组件名（与 `ROUTE_NAMES` 对齐）
- [ ] 路由定义已按模板规范写入 `*.routes.ts`

## 常见错误

| 错误 | 原因 | 修复 |
|------|------|------|
| `ref.value` 在 template 中写了 `.value` | Vue2 习惯 | template 中自动解包，去掉 `.value` |
| `a-modal` visible 不生效 | AntDV 用 `open` 而非 `visible` | 将 `visible` 改为 `open`（v4.0+） |
| 表格列不显示 | 用 `a-table` columns 格式写了 `vxe-grid` columns | vxe-grid 用 `field` 而非 `dataIndex` |
| Tailwind 类不生效 | 动态拼接类名 | Tailwind 不支持动态类名，用完整类名或 style |
| `onMounted` 中 ref 为 null | 忘记了 template ref 需等待组件挂载 | 确认 ref 绑定元素存在，或用 `nextTick` |
| ElementUI type="primary" 变 AntDV 后颜色不同 | 两个库的 type 值映射不完全一致 | 参见 `references/element-ui-to-antdv-mapping.md` |

## 不盲目转换

以下情况**保留原样**或采用更优方案：

1. **ElementUI 的复杂交互组件**（如 `el-transfer` 穿梭框）：AntDV 无直接对应，评估用 `a-transfer`（如存在）或自定义实现
2. **页面级状态**：不要强行全用 Pinia，局部状态适合用 composable
3. **SCSS 复杂的计算逻辑**：CSS 变量 + JS 计算可能更合适，而非强行 Tailwind
4. **业务逻辑**：绝不动业务逻辑，只做语法翻译
