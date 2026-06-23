/**
 * 运行时浏览器最低支持版本（A 方案：不达标只提示、不降级）。
 *
 * - 检测命中已知浏览器且主版本号 < 此处对应值 → 渲染「请升级浏览器」整页提示，不挂载应用；
 * - 检测不到已知浏览器（UA 无法识别）→ 默认放行，避免误伤非常规 / 嵌入式 / 新版浏览器。
 *
 * 【维护约定】此处的下限需与 package.json 的 `browserslist` 语义保持一致：
 *   - browserslist 是「构建期」声明，驱动 autoprefixer 加 CSS 前缀；
 *   - 本配置是「运行时」判定源（isBrowserSupported 读取它）。
 *   调整下限时请两处同步，否则会出现「构建按旧范围加前缀、运行时按新范围拦截」的口径错位。
 *
 * 【关于 color-mix】代码已使用 CSS color-mix()（Safari ≥16.2 / Chrome ≥111 / Firefox ≥113）。
 * 本下限偏宽松（覆盖近 ~3 年主流浏览器），color-mix 在略旧浏览器上会优雅降级
 * （声明被忽略、回退到无该样式的状态），不阻断使用；如需严格对齐 color-mix 的支持线，
 * 请相应上调 safari / chrome / firefox。
 */
export const MIN_BROWSER_VERSIONS = {
  chrome: 100,
  edge: 100,
  firefox: 100,
  safari: 15,
} as const;

/** 受支持的浏览器名（与 MIN_BROWSER_VERSIONS 的键对齐）。 */
export type BrowserName = keyof typeof MIN_BROWSER_VERSIONS;
