# useSpin Composable 设计

## 背景

异步请求 loading 有两个体验问题：
1. 快速请求（<300ms）导致 loading 闪烁
2. 极短展示时间的 loading 让用户感觉界面抖动

## 设计

### 状态机

```
IDLE → PENDING → SPINNING → LINGERING → IDLE
```

| 状态 | 含义 | spinning |
|---|---|---|
| `IDLE` | 空闲 | false |
| `PENDING` | 请求已开始，等待 delay | false |
| `SPINNING` | loading 展示中 | true |
| `LINGERING` | 请求已完成，等待 minDuration | true |

**转换规则：**

| 当前状态 | 调用 start() | 调用 stop() |
|---|---|---|
| IDLE | → PENDING，启动 delay 定时器 | 无操作 |
| PENDING | 无操作 | → IDLE，清除 delay 定时器 |
| SPINNING | 无操作 | → LINGERING，启动 minDuration 定时器 |
| LINGERING | 无操作 | 无操作（等待定时器结束） |

### API

```ts
interface UseSpinOptions {
  delay?: number;       // 等多少 ms 后才显示 loading，默认 300
  minDuration?: number; // 开启后至少展示多少 ms，默认 500
}

interface UseSpinReturn {
  spinning: Readonly<Ref<boolean>>;
  start: () => void;
  stop: () => void;
}

function useSpin(options?: UseSpinOptions): UseSpinReturn
```

### 使用示例

```ts
const { spinning, start, stop } = useSpin({ delay: 300, minDuration: 500 });

async function fetchData() {
  start();
  try {
    await api.getData();
  } finally {
    stop();
  }
}
```

### 文件

- 创建：`template/src/shared/composables/useSpin.ts`
- 测试：`template/src/shared/composables/useSpin.spec.ts`
