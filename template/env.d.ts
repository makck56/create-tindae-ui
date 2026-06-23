/// <reference types="vite/client" />
/// <reference types="vue/jsx" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

// 项目自定义的环境变量类型声明（Vite 约定：仅 VITE_ 前缀变量会暴露给前端代码）。
// 与 vite/client 提供的基础 ImportMetaEnv 自动合并。
interface ImportMetaEnv {
  /** Mock 接口签发的 access token 有效期（秒），用于演示 Token 无感续期；默认 120 */
  readonly VITE_MOCK_ACCESS_TTL_SEC?: string;
  /** 是否开启「Token 续期」DEV 观测面板（右下角悬浮）；设 'true' 开启，默认关闭（不展示）。仅开发环境生效 */
  readonly VITE_DEV_TOKEN_PANEL?: string;
  /** 是否启用 legacy 降级（B 方案，兼容更老浏览器）。设 'true' 开启；需先 pnpm add -D @vitejs/plugin-legacy terser。默认关闭 */
  readonly VITE_LEGACY_BUILD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
