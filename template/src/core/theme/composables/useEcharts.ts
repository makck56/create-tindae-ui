import { onBeforeUnmount, onMounted, shallowRef, watch } from 'vue';
import type { Ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useThemeStore } from '../stores/theme.store';
import {
  ECHARTS_THEME_NAME,
  registerAppEChartsTheme,
} from '../bridges/echarts';
import type { EChartsInstance, EChartsRuntime } from '../bridges/echarts';

/**
 * ECharts 业务封装：主题注入 + 容器自适应 resize + 切主题自动刷新。
 *
 * 为什么 core/theme 不直接 import echarts：
 * - echarts 体积大，模板项目约定「按需由业务 import」，主题模块若强依赖会被打进主包；
 * - 因此本 composable 接收业务传入的 echarts 运行时，保持主题模块零 echarts 依赖。
 *
 * 典型用法：
 *   import * as echarts from 'echarts';
 *   const el = ref<HTMLElement>();
 *   const { setOption } = useEcharts(el, echarts);
 *   onMounted(() => setOption({ series: [...] })); // 注意：el 挂载后调用
 *
 * 设计要点：
 * - 实例用 shallowRef 持有：echarts 是命令式对象，避免被 Vue 深度响应式包裹影响性能；
 * - 缓存最近一次 option，主题切换时 dispose → init(新主题) → 回放 option，配色无缝切换；
 * - ResizeObserver 自动响应容器尺寸，无需业务手动 resize。
 *
 * @param el      图表容器 ref（绑定到模板的 <div ref="el">）
 * @param echarts 业务按需 import 的 echarts 运行时
 */
export function useEcharts(
  el: Ref<HTMLElement | undefined>,
  echarts: EChartsRuntime,
) {
  const themeStore = useThemeStore();
  const { currentTokens } = storeToRefs(themeStore);

  // shallowRef：echarts 实例为命令式对象，不应被深度代理
  const instance = shallowRef<EChartsInstance | null>(null);
  // 最近一次 setOption 的参数缓存，供切主题后回放
  const lastOption = shallowRef<Record<string, unknown> | null>(null);
  let resizeObserver: ResizeObserver | null = null;

  /** 懒初始化实例（首次调用时创建，并注入当前主题） */
  function ensureInstance(): EChartsInstance | null {
    const node = el.value;
    if (!node) return null;
    if (instance.value) return instance.value;

    // 先确保 echarts 主题表中有当前 token 对应的主题
    registerAppEChartsTheme(echarts, themeStore.currentTokens);
    const inst = echarts.init(node, ECHARTS_THEME_NAME);
    instance.value = inst;
    return inst;
  }

  /**
   * 设置图表 option（透传 echarts setOption）。
   * 同时缓存本次 option，用于主题切换后回放，保证换肤不丢图表内容。
   *
   * 注意：请在 el 挂载后（onMounted / onActivated）调用；setup 同步期 el 尚未挂载会被跳过。
   */
  function setOption(option: Record<string, unknown>): void {
    const inst = ensureInstance();
    if (!inst) return;
    lastOption.value = option;
    inst.setOption(option);
  }

  /** 主动 resize（ResizeObserver 已自动处理，多数场景无需手动调用） */
  function resize(): void {
    instance.value?.resize();
  }

  /** 获取底层 echarts 实例（业务做 dispatchAction 等低级操作时使用） */
  function getInstance(): EChartsInstance | null {
    return instance.value;
  }

  onMounted(() => {
    const node = el.value;
    if (!node) return;

    // 初始化实例（注入主题）
    ensureInstance();

    // 容器尺寸自适应：observe 到变化即 resize，无需手动监听 window resize
    resizeObserver = new ResizeObserver(() => {
      instance.value?.resize();
    });
    resizeObserver.observe(node);
  });

  // 主题变化：重新注册主题 → 重建实例 → 回放 option，使配色立即生效。
  // dispose 是必要的：echarts 的主题在 init 时定型，无法热更新，需重建实例。
  watch(currentTokens, () => {
    const node = el.value;
    if (!node) return;

    registerAppEChartsTheme(echarts, themeStore.currentTokens);
    instance.value?.dispose();

    const inst = echarts.init(node, ECHARTS_THEME_NAME);
    instance.value = inst;

    // 回放最近一次 option，避免主题切换后图表空白
    if (lastOption.value) {
      inst.setOption(lastOption.value);
    }
  });

  onBeforeUnmount(() => {
    // 清理：断开 observer + 释放 echarts 实例，避免内存泄漏
    resizeObserver?.disconnect();
    resizeObserver = null;
    instance.value?.dispose();
    instance.value = null;
  });

  return { setOption, resize, getInstance };
}
