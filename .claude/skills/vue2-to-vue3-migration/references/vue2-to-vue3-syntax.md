# Vue2 → Vue3 语法转换速查手册

## 使用说明

此手册提供 Vue2 Options API 到 Vue3 Composition API (`<script setup lang="ts">`) 的**逐项语法对照**。

每种转换遵循：**Vue2 示例 → Vue3 示例 → 关键差异说明**

---

## 1. 组件结构

```vue
<!-- ❌ Vue2 -->
<template>...</template>
<script>
export default {
  name: 'MyComponent',
  components: { ChildA, ChildB },
  props: { title: String },
  data() { return { count: 0 } },
  computed: { double() { return this.count * 2 } },
  watch: { count(val) { console.log(val) } },
  methods: { increment() { this.count++ } },
  mounted() { this.fetchData() }
}
</script>
<style scoped lang="scss">...</style>

<!-- ✅ Vue3 -->
<template>...</template>
<script setup lang="ts">
import ChildA from './ChildA.vue'
import ChildB from './ChildB.vue'

defineOptions({ name: 'MyComponent' })

interface Props { title: string }
const props = defineProps<Props>()

const count = ref(0)
const double = computed(() => count.value * 2)

watch(count, (val) => console.log(val))

function increment() { count.value++ }
function fetchData() { /* ... */ }

onMounted(() => fetchData())
</script>
<style scoped>...</style>
```

**关键变化**：
- `components: {}` 注册 → 不再需要，导入即注册
- `export default {}` → 删除，所有代码在顶层执行
- `this.xxx` → `xxx.value`（ref）或直接访问（reactive）

---

## 2. 响应式数据

### ref（基本类型）

```typescript
// ❌ Vue2
data() {
  return {
    count: 0,
    name: '',
    loading: false
  }
}

// ✅ Vue3
const count = ref(0)
const name = ref('')
const loading = ref(false)

// 访问/修改必须用 .value
count.value++
console.log(count.value)
```

### reactive（对象/数组）

```typescript
// ❌ Vue2
data() {
  return {
    form: { name: '', age: 0 },
    list: []
  }
}

// ✅ Vue3 方案 1：reactive
const form = reactive({ name: '', age: 0 })
const list = reactive<string[]>([])

// ✅ Vue3 方案 2：ref 包裹对象（推荐——可整体替换）
const form = ref({ name: '', age: 0 })
const list = ref<string[]>([])
```

⚠️ **推荐用 `ref()` 而非 `reactive()`**：
- `ref` 可以整体替换（`form.value = newData`），`reactive` 不能
- `ref` 解构后仍需 `.value`，类型推断更好

---

## 3. Props

```typescript
// ❌ Vue2
props: {
  title: { type: String, required: true },
  count: { type: Number, default: 0 }
}

// ✅ Vue3 类型声明式（推荐）
interface Props {
  title: string
  count?: number
}
const props = defineProps<Props>()

// ✅ Vue3 运行时声明式（需要默认值时）
const props = defineProps({
  title: { type: String, required: true },
  count: { type: Number, default: 0 }
})
```

**访问 props**：template 中直接用 `title`（无 `this.`），script 中用 `props.title`（无 `.value`）。

---

## 4. Emits

```typescript
// ❌ Vue2
this.$emit('update', newValue)
this.$emit('close')

// ✅ Vue3 类型声明式（推荐）
const emit = defineEmits<{
  (e: 'update', value: string): void
  (e: 'close'): void
}>()
emit('update', newValue)
emit('close')

// ✅ 简化语法（3.3+）
const emit = defineEmits<{
  update: [value: string]
  close: []
}>()
```

---

## 5. Computed

```typescript
// ❌ Vue2
computed: {
  fullName() { return this.firstName + ' ' + this.lastName },
  filteredList() { return this.list.filter(item => item.active) }
}

// ✅ Vue3
const fullName = computed(() => firstName.value + ' ' + lastName.value)
const filteredList = computed(() => list.value.filter(item => item.active))
```

⚠️ **computed 返回的是只读 ref**，访问需要 `.value`。

---

## 6. Watch

```typescript
// ❌ Vue2
watch: {
  count(val, oldVal) { console.log(val, oldVal) },
  'obj.name'(val) { console.log(val) },  // 深度路径
  obj: {
    handler(val) { console.log(val) },
    deep: true,
    immediate: true
  }
}

// ✅ Vue3
// 监听单个 ref
watch(count, (val, oldVal) => console.log(val, oldVal))

// 监听 reactive 属性（getter 函数）
watch(() => obj.name, (val) => console.log(val))

// 深度监听 + 立即执行
watch(obj, (val) => console.log(val), { deep: true, immediate: true })

// 监听多个源
watch([count, name], ([newCount, newName], [oldCount, oldName]) => {
  console.log(newCount, newName)
})

// watchEffect：自动追踪依赖
watchEffect(() => {
  console.log(count.value, name.value) // 任一变化都触发
})
```

---

## 7. 生命周期

| Vue2 | Vue3 |
|------|------|
| `beforeCreate()` | setup 顶层（直接执行） |
| `created()` | setup 顶层（直接执行） |
| `beforeMount()` | `onBeforeMount(() => {})` |
| `mounted()` | `onMounted(() => {})` |
| `beforeUpdate()` | `onBeforeUpdate(() => {})` |
| `updated()` | `onUpdated(() => {})` |
| `beforeDestroy()` | `onBeforeUnmount(() => {})` |
| `destroyed()` | `onUnmounted(() => {})` |
| `errorCaptured()` | `onErrorCaptured(() => {})` |
| `activated()` | `onActivated(() => {})` |
| `deactivated()` | `onDeactivated(() => {})` |

```typescript
// ❌ Vue2
export default {
  created() { this.init() },
  mounted() { this.fetchData() },
  beforeDestroy() { this.cleanup() }
}

// ✅ Vue3
// created 逻辑直接写在 setup 顶层
init()

onMounted(() => fetchData())
onBeforeUnmount(() => cleanup())
```

---

## 8. 模板引用（$refs）

```typescript
// ❌ Vue2
<el-form ref="formRef">
this.$refs.formRef.validate()

// ✅ Vue3
<a-form ref="formRef">

const formRef = ref<FormInstance>()
formRef.value?.validate()
```

⚠️ **ref 变量名必须与 template 中 `ref="xxx"` 完全一致**。

---

## 9. v-model 变化

```html
<!-- ❌ Vue2 -->
<!-- 单个 v-model（不变） -->
<el-input v-model="name" />

<!-- .sync 修饰符同步属性 -->
<el-dialog :visible.sync="dialogVisible" />

<!-- ✅ Vue3 -->
<!-- 单个 v-model（不变） -->
<a-input v-model:value="name" />

<!-- .sync → v-model:属性名 -->
<a-modal v-model:open="dialogVisible" />

<!-- 多个 v-model -->
<a-input
  v-model:value="name"
  v-model:placeholder="placeholderText"
/>
```

---

## 10. Filters（过滤器）

Vue3 已移除 filters 功能，使用纯函数或 computed 替代。

```html
<!-- ❌ Vue2 -->
<template>
  <span>{{ price | currency }}</span>
  <span>{{ date | formatDate('YYYY-MM-DD') }}</span>
</template>
<script>
export default {
  filters: {
    currency(val) { return '¥' + val.toFixed(2) },
    formatDate(val, fmt) { return dayjs(val).format(fmt) }
  }
}
</script>

<!-- ✅ Vue3 方案 1：纯函数 -->
<template>
  <span>{{ currency(price) }}</span>
  <span>{{ formatDate(date, 'YYYY-MM-DD') }}</span>
</template>
<script setup lang="ts">
function currency(val: number) { return '¥' + val.toFixed(2) }
function formatDate(val: string, fmt: string) { return dayjs(val).format(fmt) }
</script>

<!-- ✅ Vue3 方案 2：computed（适合复杂逻辑） -->
<template>
  <span>{{ displayPrice }}</span>
</template>
<script setup lang="ts">
const displayPrice = computed(() => '¥' + price.value.toFixed(2))
</script>
```

---

## 11. 事件处理

```html
<!-- ❌ Vue2 -->
<!-- $listeners 透传（Vue3 已合并到 $attrs） -->
<child-component v-on="$listeners" />

<!-- .native 修饰符监听原生事件 -->
<el-input @click.native="handleClick" />

<!-- ✅ Vue3 -->
<!-- $listeners 合并到 $attrs，用 v-bind="$attrs" 透传 -->
<child-component v-bind="$attrs" />

<!-- .native 已移除，子组件未声明 emits 的事件自动透传到根元素 -->
<!-- 如需明确监听：在子组件中用 emit 声明，或直接 expose -->
```

---

## 12. 插槽

```html
<!-- ❌ Vue2 -->
<template>
  <!-- 默认插槽 -->
  <slot />
  <!-- 具名插槽 -->
  <slot name="header" />
  <!-- 作用域插槽（子） -->
  <slot name="item" :data="row" />
</template>

<!-- 作用域插槽（父） -->
<child>
  <template #item="scope">
    <span>{{ scope.data.name }}</span>
  </template>
</child>

<!-- ✅ Vue3（基本一致） -->
<template>
  <slot />
  <slot name="header" />
  <slot name="item" :data="row" />

  <!-- 新增：条件插槽判断 -->
  <div v-if="$slots.header">header 存在</div>
</template>
```

主要差异：
- `slot` 属性（父组件中 `slot="name"`）→ `v-slot:name` 或 `#name`
- `slot-scope` → `v-slot:name="scope"` 或 `#name="scope"`

---

## 13. v-if / v-for / v-show

```html
<!-- ❌ Vue2：v-if 和 v-for 同层时 v-for 优先级更高 -->
<li v-for="item in items" v-if="item.active" :key="item.id">

<!-- ✅ Vue3：v-if 优先级更高，禁止同层使用（会报错） -->
<!-- 必须通过 computed 过滤或嵌套 template -->
<template v-for="item in items" :key="item.id">
  <li v-if="item.active">{{ item.name }}</li>
</template>
<!-- 或者 -->
<li v-for="item in activeItems" :key="item.id">
```

---

## 14. 路由

```typescript
// ❌ Vue2
this.$router.push('/home')
this.$router.push({ name: 'UserDetail', params: { id: '1' } })
const id = this.$route.params.id
const query = this.$route.query.page

this.$router.beforeEach((to, from, next) => {
  if (to.meta.auth) next()
  else next('/login')
})

// ✅ Vue3
import { useRouter, useRoute, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

const router = useRouter()
const route = useRoute()

router.push('/home')
router.push({ name: 'UserDetail', params: { id: '1' } })
const id = route.params.id
const query = route.query.page

// 导航守卫在 router 创建处（core/bootstrap/router.ts），不在组件内
```

⚠️ **Vue Router 4 变化**：
- `router.beforeEach` 的 `next()` 不再强制要求，可以 `return` 路径或 `true/false`
- `params` 为 `Record<string, string | string[]>`（类型更严格）
- 动态路由 `addRoute` 行为有差异

---

## 15. Vuex → Pinia

```typescript
// ❌ Vue2 + Vuex
// store/user.js
export default {
  state: { name: '', token: '' },
  getters: { isLoggedIn: state => !!state.token },
  mutations: { SET_TOKEN(state, token) { state.token = token } },
  actions: {
    async login({ commit }, credentials) {
      const res = await api.login(credentials)
      commit('SET_TOKEN', res.token)
    }
  }
}

// 组件中使用
this.$store.state.user.name
this.$store.getters['user/isLoggedIn']
this.$store.commit('user/SET_TOKEN', token)
this.$store.dispatch('user/login', credentials)

// ✅ Vue3 + Pinia
// stores/auth.ts
export const useAuthStore = defineStore('auth', () => {
  const name = ref('')
  const token = ref('')
  const isLoggedIn = computed(() => !!token.value)

  async function login(credentials: Credentials) {
    const res = await api.login(credentials)
    token.value = res.token
  }

  return { name, token, isLoggedIn, login }
})

// 组件中使用
const authStore = useAuthStore()
authStore.name       // 直接访问
authStore.isLoggedIn // 直接访问
authStore.login(credentials) // 直接调用 action
```

**关键变化**：
- 没有 mutations——直接修改 state
- 没有 `this.$store`——直接 import 并使用 store 实例
- 没有模块命名空间——每个 store 独立
- Composition API store（`defineStore('id', () => {...})`）比 Options API form 更自然

---

## 16. 全局属性

```typescript
// ❌ Vue2：挂载到 Vue.prototype
Vue.prototype.$http = axios
Vue.prototype.$dayjs = dayjs

// 组件中
this.$http.get('/api/data')

// ✅ Vue3：通过 provide/inject 或直接导入
// 推荐：直接导入（目标项目用 @/core/http）
import { request } from '@/core/http'
request.get('/api/data')
```

目标项目**不使用** `app.config.globalProperties`，所有工具函数通过 import 直接使用。

---

## 17. $attrs 透传

```html
<!-- ❌ Vue2 -->
<!-- $attrs 不包含 class 和 style -->
<child v-bind="$attrs" />

<!-- 手动处理 class/style -->
<child :class="$attrs.class" :style="$attrs.style" />

<!-- ✅ Vue3 -->
<!-- $attrs 自动包含 class 和 style -->
<child v-bind="$attrs" />
```

---

## 18. Provide / Inject

```typescript
// ❌ Vue2
// 祖先
export default {
  provide() {
    return { theme: this.theme }
  }
}
// 后代
export default {
  inject: ['theme']
}

// ✅ Vue3
// 祖先
import { provide } from 'vue'
provide('theme', theme) // 可以是 ref，后代自动解包

// 后代
import { inject } from 'vue'
const theme = inject('theme')
```

---

## 19. TypeScript 类型声明

```typescript
// ✅ Vue3 特有：为模板中的变量提供类型
const count = ref<number>(0)
const user = ref<User | null>(null)
const list = ref<User[]>([])

// 函数参数和返回值
function fetchUser(id: string): Promise<User> {
  return request.get<User>(`/users/${id}`).then(res => res.data)
}

// 事件处理
function handleEdit(record: User) {
  router.push(`/user-management/${record.id}`)
}
```

---

## 20. 快速自检清单

代码写完后过一遍：

- [ ] `data()` 返回的对象全部转为 `ref()` / `reactive()`
- [ ] `this.xxx` 全部清理（template 中自动解包，script 中用 `.value`）
- [ ] `this.$refs` → `const xxx = ref()`
- [ ] `this.$router` → `useRouter()`
- [ ] `this.$route` → `useRoute()`
- [ ] `this.$emit` → `const emit = defineEmits<{...}>()`
- [ ] `this.$message` / `this.$confirm` → 函数式导入
- [ ] `filters: {}` → 纯函数或 computed
- [ ] `.sync` → `v-model:prop`
- [ ] `mounted()` → `onMounted(() => {})`
- [ ] `beforeDestroy()` → `onBeforeUnmount(() => {})`
- [ ] `components: {}` → 导入即注册
- [ ] `provide() { return {} }` → `provide(key, value)`
- [ ] `inject: []` → `const x = inject(key)`
