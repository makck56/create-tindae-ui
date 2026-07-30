/// <reference types="vite/client" />
/// <reference types="vue/jsx" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

// 项目自定义环境变量类型声明。Vite 只会把 VITE_ 前缀变量暴露给前端代码。
interface ImportMetaEnv {
  /** Mock 接口签发的 access token 有效期，单位秒；用于演示 Token 无感续期，默认 120。 */
  readonly VITE_MOCK_ACCESS_TTL_SEC?: string;
  /** 是否开启 Token 续期 DEV 观察面板；设置为 'true' 开启，默认关闭，仅开发环境生效。 */
  readonly VITE_DEV_TOKEN_PANEL?: string;
  /** 是否启用 legacy 降级构建；需要额外安装 @vitejs/plugin-legacy 和 terser。 */
  readonly VITE_LEGACY_BUILD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
