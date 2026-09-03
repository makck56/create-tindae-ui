import type { ThemeTokens, ThemeMode } from './types';
import { getTokensByMode } from './tokens';
import { applyPreset, findPreset } from './presets';
import { applyTokensToRoot } from './bridges/cssVariables';
import { injectThemeOverrideStyles } from './bridges/injectStyle';
import { readPersistedTheme } from './stores/theme.store';

// ============ 公开 API 重新导出 ============
// 组合式 API / store
export { useTheme } from './composables/useTheme';
export { useThemeStore, readPersistedTheme, THEME_STORAGE_KEY } from './stores/theme.store';
// 预设与 Token 数据
export { THEME_PRESETS, DEFAULT_PRESET_KEY, findPreset } from './presets';
export { lightTokens, darkTokens, getTokensByMode } from './tokens';
// ECharts 主题桥接（纯函数，不依赖 echarts 运行时；由 shared/components/BaseChart 消费）
export { buildEChartsTheme } from './bridges/echarts';
// Ant Design Vue v4 ConfigProvider token 映射。
export { buildAntDesignVueTheme } from './bridges/antDesignVue';
// Provider 组件
export { default as ThemeProvider } from './ThemeProvider.vue';
// 类型
export type {
  ThemeMode,
  ThemeTokens,
  ThemePreset,
  ThemeState,
  ColorScale,
  TextTokens,
  BgTokens,
  BorderTokens,
  RadiusTokens,
  LayoutTokens,
  CustomThemeTokens,
  CustomThemeTokenValue,
  CustomThemeTokenOverrides,
} from './types';

/**
 * 计算首屏初始 Token：基础模式 Token + 预设覆盖（不可变派生）。
 * 复用 applyPreset（与 store currentTokens 同一逻辑），确保 mount 前后主题不抖动。
 */
function resolveInitialTokens(): { tokens: ThemeTokens; mode: ThemeMode } {
  const { mode, presetKey } = readPersistedTheme();
  const tokens = applyPreset(getTokensByMode(mode), findPreset(presetKey));
  return { tokens, mode };
}

/**
 * 主题系统初始化：在 app.mount 之前调用。
 *
 * 为何独立这一步（而不全靠 ThemeProvider）：
 * - ThemeProvider 的副作用在组件 onMounted 触发，已晚于首屏 HTML 渲染，会有主题闪烁（FOUC）；
 * - 在 mount 前提前应用持久化主题到 :root，可让首屏即正确配色，避免视觉跳变。
 *
 * 不依赖 pinia（mount 前 pinia 尚未 active），直接读 localStorage + 操作 DOM，纯函数式。
 *
 * 典型接入（core/bootstrap/index.ts）：
 *   app.use(createPinia());
 *   setupTheme();        // ← mount 前预应用主题
 *   setupVxeTable(app);
 *   app.mount('#app');
 */
export function setupTheme(): void {
  if (typeof document === 'undefined') return; // SSR 守卫
  const { tokens, mode } = resolveInitialTokens();
  applyTokensToRoot(tokens, mode);
  injectThemeOverrideStyles();
}
