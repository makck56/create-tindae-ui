/**
 * Ant Design Vue v4 主题桥接说明。
 *
 * v4 已提供 ConfigProvider theme token 运行时能力，因此项目不再把 Ant 主题建立在
 * v3 的 `.ant-*` selector 密集覆盖上。实际 token 映射见 `antDesignVue.ts`，此文件仅保留
 * `ANTD_THEME_CSS` 导出，避免注入器和未来 v4-specific fallback 的扩展点频繁改名。
 */
export const ANTD_THEME_CSS = '';
