<script setup lang="ts">
/**
 * Token 续期 DEV 观测面板（仅在开发环境挂载，见 App.vue 的 DEV 异步加载）。
 *
 * 存在意义：Token 续期是「请求驱动的后台异步动作」——闲置时既不刷新、也无从观测。
 * 本面板把不可见的状态实时可视化，并提供按钮主动触发各类场景，便于确定性验证方案 B / C：
 *
 *  - 实时显示：剩余有效期（倒计时）、累计续期次数；
 *  - 「发起测试请求」：调 /user/info，触发请求拦截器；若临过期则走方案 B 主动刷新；
 *  - 「标记临过期」：把本地 tokenExpiresAt 改到过去，下一个请求必触发方案 B 主动刷新（免等待）；
 *  - 「检查并续期」：直接调 ensureFreshToken()，验证主动刷新入口本身；
 *  - 「模拟 401」：把本地 token 改坏并标记为新鲜，让下个请求绕过方案 B、收到 401 → 验证方案 C 兜底。
 *
 * 为什么需要「模拟 401」：方案 B 的阈值（5min）通常远大于 TTL，正常流程里 token 总是被
 * 主动刷新、永远是新鲜的，方案 C 几乎触发不到（仅时钟漂移 / 服务端吊销 / 标签页挂起等边界才会）。
 * 要确定性验证方案 C，必须人为构造「token 失效但前端不自知」的状态。
 */
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { request, tokenRefreshCoordinator } from '@/core/http';

/** 主动刷新阈值（秒），与 config.ts 的 DEFAULT_REFRESH_THRESHOLD_MS 保持一致，仅用于 UI 着色 */
const REFRESH_THRESHOLD_SEC = 5 * 60;

/** 剩余有效期（秒）；null 表示未登录（无 tokenExpiresAt） */
const remainSec = ref<number | null>(null);
/** 累计续期次数（来自协调器，方案 B / C 任一成功都会 +1） */
const refreshCount = ref(0);
/** 操作日志（最新在上，仅保留最近若干条） */
const logs = ref<string[]>([]);
/** 折叠状态 */
const collapsed = ref(false);

/** 是否已进入「临过期」区间（剩余 ≤ 阈值），用于 UI 高亮 */
const nearExpiry = computed(
  () => remainSec.value !== null && remainSec.value <= REFRESH_THRESHOLD_SEC,
);

let timer: ReturnType<typeof setInterval> | undefined;

/** 当前时间字符串（日志用） */
function nowStr(): string {
  return new Date().toLocaleTimeString();
}

/** 轮询同步本地状态：剩余有效期 + 续期次数（DEV 面板 500ms 轮询可接受） */
function sync(): void {
  const exp = Number(localStorage.getItem('tokenExpiresAt') ?? NaN);
  remainSec.value = Number.isFinite(exp)
    ? Math.max(0, Math.round((exp - Date.now()) / 1000))
    : null;
  refreshCount.value = tokenRefreshCoordinator.getRefreshCount();
}

// 续期次数变化 → 自动追加一条日志（捕获方案 B / C 的刷新动作，无需盯 Network）
watch(refreshCount, (n, old) => {
  if (n > old) logs.value.unshift(`[${nowStr()}] ✅ 完成第 ${n} 次续期`);
});

/** 主动发起一个需鉴权的测试请求（触发请求拦截器 → 方案 B 主动刷新） */
async function fireRequest(): Promise<void> {
  logs.value.unshift(`[${nowStr()}] → 发起 /user/info`);
  try {
    await request.get('/user/info');
    logs.value.unshift(`[${nowStr()}] ← /user/info 成功`);
  } catch {
    logs.value.unshift(`[${nowStr()}] ← /user/info 失败（详见 Network / 控制台）`);
  }
  sync();
}

/** 把本地 tokenExpiresAt 改到过去，下一个请求必触发方案 B 主动刷新（免等待） */
function markNearExpiry(): void {
  localStorage.setItem('tokenExpiresAt', String(Date.now() - 1000));
  logs.value.unshift(`[${nowStr()}] ⚠ 已标记临过期（下次请求走方案 B）`);
  sync();
}

/** 直接调用主动刷新入口，验证协调器本身 */
async function checkRefresh(): Promise<void> {
  logs.value.unshift(`[${nowStr()}] → 调用 ensureFreshToken()`);
  try {
    await tokenRefreshCoordinator.ensureFreshToken();
    logs.value.unshift(`[${nowStr()}] ← ensureFreshToken() 完成`);
  } catch {
    logs.value.unshift(`[${nowStr()}] ← ensureFreshToken() 失败`);
  }
  sync();
}

/**
 * 模拟「token 在服务端已失效、但前端尚不自知」：
 * 把本地 access token 改坏，并把过期时间推到「新鲜」区间（> 阈值）。
 * 这样下一个请求不会被方案 B 主动拦截，而是带着坏 token 出去 → 收到 401 → 触发方案 C 兜底。
 */
function simulateInvalidToken(): void {
  localStorage.setItem('token', 'mock-access-BROKEN');
  localStorage.setItem('tokenExpiresAt', String(Date.now() + 600 * 1000));
  logs.value.unshift(`[${nowStr()}] ⚠ 已改坏 token + 标记新鲜（下次请求走方案 C）`);
  sync();
}

onMounted(() => {
  sync();
  timer = setInterval(sync, 500);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <div class="token-panel">
    <!-- 标题栏：点击折叠/展开 -->
    <div class="token-panel__bar" @click="collapsed = !collapsed">
      <span class="token-panel__title">🔍 Token 续期</span>
      <span :class="['token-panel__remain', { 'is-near': nearExpiry }]">
        {{ remainSec === null ? '未登录' : `${remainSec}s` }}
      </span>
      <span class="token-panel__count">续期 ×{{ refreshCount }}</span>
      <span class="token-panel__toggle">{{ collapsed ? '展开' : '收起' }}</span>
    </div>

    <div v-show="!collapsed" class="token-panel__body">
      <!-- 触发按钮 -->
      <div class="token-panel__row">
        <button @click="fireRequest">发起测试请求</button>
        <button @click="markNearExpiry">标记临过期</button>
        <button @click="checkRefresh">检查并续期</button>
        <button @click="simulateInvalidToken">模拟 401</button>
      </div>

      <!-- 操作日志 -->
      <ul class="token-panel__logs">
        <li v-for="(line, i) in logs.slice(0, 8)" :key="i">{{ line }}</li>
        <li v-if="logs.length === 0" class="is-empty">
          暂无操作（点上方按钮触发请求即可观察续期）
        </li>
      </ul>

      <p class="token-panel__tip">
        续期只在「发请求」时发生，闲置不会刷新。<br />
        方案 B：点「发起测试请求」（TTL&lt;300s 时必触发）。<br />
        方案 C：先点「模拟 401」→ 再点「发起测试请求」。
      </p>
    </div>
  </div>
</template>

<style scoped>
/* 固定在右下角，DEV 工具样式，独立作用域不影响业务 */
.token-panel {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 9999;
  width: 320px;
  font-size: 12px;
  color: #1f1f1f;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.token-panel__bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  user-select: none;
}
.token-panel__title {
  font-weight: 600;
}
.token-panel__remain.is-near {
  color: #fa8c16;
  font-weight: 600;
}
.token-panel__count {
  margin-left: auto;
  color: #1677ff;
}
.token-panel__toggle {
  color: #999;
}
.token-panel__body {
  padding: 10px 12px;
}
.token-panel__row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}
.token-panel__row button {
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}
.token-panel__row button:hover {
  background: #e6f4ff;
  border-color: #1677ff;
  color: #1677ff;
}
.token-panel__logs {
  list-style: none;
  margin: 0 0 8px;
  padding: 0;
  max-height: 140px;
  overflow: auto;
}
.token-panel__logs li {
  padding: 2px 0;
  line-height: 1.5;
  border-bottom: 1px dashed #f5f5f5;
}
.token-panel__logs .is-empty {
  color: #999;
}
.token-panel__tip {
  margin: 0;
  color: #888;
  line-height: 1.6;
}
</style>
