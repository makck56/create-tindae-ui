import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { ThemeMode, ThemeTokens } from '../types';
import { getTokensByMode } from '../tokens';
import { applyPreset, findPreset, DEFAULT_PRESET_KEY } from '../presets';

/** 主题持久化 localStorage 键 */
export const THEME_STORAGE_KEY = 'app-theme';

/** 默认模式：亮色 */
const DEFAULT_MODE: ThemeMode = 'light';

/** 持久化结构（只存「状态」，不存派生数据，避免存冗余） */
interface PersistedTheme {
  mode: ThemeMode;
  presetKey: string;
}

/**
 * 从 localStorage 读取持久化主题（纯函数，不依赖 pinia）。
 *
 * 设计要点：
 * - 不依赖 pinia active 实例，因此可在 app.mount 之前的首屏预应用阶段直接调用；
 * - 对损坏数据做容错（JSON 解析失败 / 非法值一律回退默认），保证健壮性；
 * - presetKey 必须命中已注册预设，否则回退默认，避免写入无效 key。
 */
export function readPersistedTheme(): PersistedTheme {
  const fallback: PersistedTheme = { mode: DEFAULT_MODE, presetKey: DEFAULT_PRESET_KEY };
  if (typeof localStorage === 'undefined') return fallback;

  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as Partial<PersistedTheme>;
    const mode: ThemeMode = parsed.mode === 'dark' ? 'dark' : 'light';
    const presetKey =
      parsed.presetKey && findPreset(parsed.presetKey) ? parsed.presetKey : DEFAULT_PRESET_KEY;
    return { mode, presetKey };
  } catch {
    // 数据损坏：静默回退默认，不让主题系统阻塞渲染
    return fallback;
  }
}

/**
 * 主题 Store —— 主题系统的「状态中枢」。
 *
 * 职责边界（重要）：
 * - 本 store 只负责「状态管理 + 持久化」；
 * - 不直接操作 DOM（写 CSS 变量、注入样式等副作用由 ThemeProvider 统一承担），
 *   以保证 store 纯净、可单测、副作用可追踪。
 *
 * immutability：currentTokens 为 computed 派生，每次返回新对象（展开生成），
 * 任何对返回值的修改都不会影响内部状态。
 */
export const useThemeStore = defineStore('theme', () => {
  // 初始状态：从持久化恢复（mount 前首屏应用与 store 首次取值读取同一来源，保持一致）
  const persisted = readPersistedTheme();
  const mode = ref<ThemeMode>(persisted.mode);
  const presetKey = ref<string>(persisted.presetKey);

  /**
   * 当前生效的完整 Token 集合。
   * 派生逻辑：基础模式 Token（亮 / 暗）+ 预设覆盖（primary 必覆盖，其余按需）。
   * 合并逻辑抽到 applyPreset 纯函数，与 setupTheme 首屏预应用共用，保证前后一致。
   */
  const currentTokens = computed<ThemeTokens>(() =>
    applyPreset(getTokensByMode(mode.value), findPreset(presetKey.value)),
  );

  /** 是否暗色模式（便捷派生） */
  const isDark = computed(() => mode.value === 'dark');

  /** 写入持久化（私有副作用） */
  function persist(): void {
    if (typeof localStorage === 'undefined') return;
    const payload: PersistedTheme = { mode: mode.value, presetKey: presetKey.value };
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(payload));
  }

  /** 设置模式（亮 / 暗）并持久化 */
  function setMode(next: ThemeMode): void {
    mode.value = next;
    persist();
  }

  /** 切换亮 / 暗（便捷方法） */
  function toggleMode(): void {
    setMode(mode.value === 'dark' ? 'light' : 'dark');
  }

  /** 设置品牌预设；仅接受已注册 key，避免写入无效值 */
  function setPreset(key: string): void {
    if (!findPreset(key)) return;
    presetKey.value = key;
    persist();
  }

  return { mode, presetKey, currentTokens, isDark, setMode, toggleMode, setPreset };
});
