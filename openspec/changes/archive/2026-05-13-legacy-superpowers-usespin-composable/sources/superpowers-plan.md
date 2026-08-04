# useSpin Composable 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现一个基于状态机的 useSpin composable，延迟开启 loading，开启后最少展示一段时间。

**Architecture:** 4 状态有限状态机（IDLE → PENDING → SPINNING → LINGERING → IDLE），通过 ref 记录状态，computed 派生 spinning，setTimeout 驱动转换。

**Tech Stack:** Vue 3 Composition API, vitest, fake timers

---

## File Structure

| 文件 | 职责 | 状态 |
|---|---|---|
| `template/src/shared/composables/useSpin.ts` | useSpin composable 实现 | 创建 |
| `template/src/shared/composables/useSpin.spec.ts` | useSpin 单元测试 | 创建 |

---

### Task 1: 编写 useSpin 测试

**Files:**
- Create: `template/src/shared/composables/useSpin.spec.ts`

- [ ] **Step 1: 创建目录并编写测试文件**

```bash
mkdir -p template/src/shared/composables
```

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSpin } from './useSpin';

describe('useSpin', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('初始状态 spinning 为 false', () => {
    const { spinning } = useSpin();
    expect(spinning.value).toBe(false);
  });

  it('快速请求（< delay）不显示 loading', () => {
    const { spinning, start, stop } = useSpin({ delay: 300 });

    start();
    expect(spinning.value).toBe(false);

    vi.advanceTimersByTime(200);
    stop();
    expect(spinning.value).toBe(false);

    vi.advanceTimersByTime(500);
    expect(spinning.value).toBe(false);
  });

  it('超过 delay 后显示 loading', () => {
    const { spinning, start } = useSpin({ delay: 300 });

    start();
    expect(spinning.value).toBe(false);

    vi.advanceTimersByTime(300);
    expect(spinning.value).toBe(true);
  });

  it('开启后至少展示 minDuration', () => {
    const { spinning, start, stop } = useSpin({ delay: 300, minDuration: 500 });

    start();
    vi.advanceTimersByTime(300);
    expect(spinning.value).toBe(true);

    stop();
    vi.advanceTimersByTime(400);
    expect(spinning.value).toBe(true);

    vi.advanceTimersByTime(100);
    expect(spinning.value).toBe(false);
  });

  it('PENDING 状态下 stop 直接回到 IDLE', () => {
    const { spinning, start, stop } = useSpin({ delay: 300 });

    start();
    vi.advanceTimersByTime(100);
    stop();
    expect(spinning.value).toBe(false);

    vi.advanceTimersByTime(500);
    expect(spinning.value).toBe(false);
  });

  it('使用默认参数', () => {
    const { spinning, start, stop } = useSpin();

    start();
    vi.advanceTimersByTime(300);
    expect(spinning.value).toBe(true);

    stop();
    vi.advanceTimersByTime(500);
    expect(spinning.value).toBe(false);
  });

  it('多次 start 不产生副作用', () => {
    const { spinning, start } = useSpin({ delay: 300 });

    start();
    start();
    start();

    vi.advanceTimersByTime(300);
    expect(spinning.value).toBe(true);
  });

  it('SPINNING 状态下 stop 进入 LINGERING', () => {
    const { spinning, start, stop } = useSpin({ delay: 200, minDuration: 400 });

    start();
    vi.advanceTimersByTime(200);
    expect(spinning.value).toBe(true);

    stop();
    vi.advanceTimersByTime(399);
    expect(spinning.value).toBe(true);

    vi.advanceTimersByTime(1);
    expect(spinning.value).toBe(false);
  });

  it('LINGERING 状态下 stop 和 start 无效', () => {
    const { spinning, start, stop } = useSpin({ delay: 100, minDuration: 300 });

    start();
    vi.advanceTimersByTime(100);

    stop();
    start(); // LINGERING 中的 start 应无效
    stop();  // LINGERING 中的 stop 应无效

    vi.advanceTimersByTime(150);
    expect(spinning.value).toBe(true);

    vi.advanceTimersByTime(150);
    expect(spinning.value).toBe(false);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd template && pnpm vitest run src/shared/composables/useSpin.spec.ts`
Expected: FAIL — 模块不存在

---

### Task 2: 实现 useSpin

**Files:**
- Create: `template/src/shared/composables/useSpin.ts`

- [ ] **Step 1: 实现 useSpin composable**

```ts
import { ref, computed, onUnmounted } from 'vue';

type SpinState = 'IDLE' | 'PENDING' | 'SPINNING' | 'LINGERING';

export interface UseSpinOptions {
  delay?: number;
  minDuration?: number;
}

export function useSpin(options: UseSpinOptions = {}) {
  const delay = options.delay ?? 300;
  const minDuration = options.minDuration ?? 500;

  const state = ref<SpinState>('IDLE');
  let delayTimer: ReturnType<typeof setTimeout> | null = null;
  let lingerTimer: ReturnType<typeof setTimeout> | null = null;
  let spinStartTime = 0;

  const spinning = computed(() => state.value === 'SPINNING' || state.value === 'LINGERING');

  function clearTimers() {
    if (delayTimer !== null) {
      clearTimeout(delayTimer);
      delayTimer = null;
    }
    if (lingerTimer !== null) {
      clearTimeout(lingerTimer);
      lingerTimer = null;
    }
  }

  function start() {
    if (state.value !== 'IDLE') return;

    state.value = 'PENDING';
    delayTimer = setTimeout(() => {
      state.value = 'SPINNING';
      spinStartTime = Date.now();
      delayTimer = null;
    }, delay);
  }

  function stop() {
    if (state.value === 'PENDING') {
      clearTimers();
      state.value = 'IDLE';
      return;
    }

    if (state.value === 'SPINNING') {
      const elapsed = Date.now() - spinStartTime;
      const remaining = Math.max(0, minDuration - elapsed);

      if (remaining === 0) {
        state.value = 'IDLE';
      } else {
        state.value = 'LINGERING';
        lingerTimer = setTimeout(() => {
          state.value = 'IDLE';
          lingerTimer = null;
        }, remaining);
      }
    }
  }

  onUnmounted(clearTimers);

  return { spinning, start, stop };
}
```

- [ ] **Step 2: 运行测试确认通过**

Run: `cd template && pnpm vitest run src/shared/composables/useSpin.spec.ts`
Expected: 全部 PASS

- [ ] **Step 3: 运行完整构建验证**

Run: `cd template && pnpm build`
Expected: 构建成功

- [ ] **Step 4: Commit**

```bash
git add template/src/shared/composables/useSpin.ts template/src/shared/composables/useSpin.spec.ts
git commit -m "feat: add useSpin composable with state machine"
```
