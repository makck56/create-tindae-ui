import { storeToRefs } from 'pinia';
import { useThemeStore } from '../stores/theme.store';
import { THEME_PRESETS } from '../presets';

/**
 * 主题业务 API（composable）。
 *
 * 对 store 的薄封装：把状态以只读 ref 暴露、把 action 透传，
 * 同时附带预设清单，供主题切换 UI 直接遍历渲染。
 *
 * 业务组件统一通过 `const { isDark, toggleMode, setPreset, presets } = useTheme()` 使用，
 * 不直接依赖 store 实现，便于后续替换或扩展（如接远程主题配置）。
 */
export function useTheme() {
  const store = useThemeStore();

  // storeToRefs：把 state / getter 转为 ref，保持响应性（action 不在此列，直接取）
  const { mode, presetKey, currentTokens, isDark } = storeToRefs(store);

  return {
    // —— 状态（只读 ref）——
    /** 当前模式 'light' | 'dark' */
    mode,
    /** 当前预设 key */
    presetKey,
    /** 当前生效的完整 Token（含预设主色覆盖） */
    currentTokens,
    /** 是否暗色模式 */
    isDark,
    /** 可选预设清单（供 UI 渲染色板） */
    presets: THEME_PRESETS,

    // —— 操作 ——
    /** 切换亮 / 暗模式 */
    toggleMode: store.toggleMode,
    /** 直接设置模式 */
    setMode: store.setMode,
    /** 设置品牌预设（传 key） */
    setPreset: store.setPreset,
  };
}
