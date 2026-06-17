/**
 * 脚手架共享常量：注入锚点 + 项目内文件路径。
 *
 * 注入锚点的字符串必须与模板文件中的注释逐字一致（含缩进），
 * 集中在此单一管理，避免散落在多个 manager 中靠人脑同步导致漂移
 * （此前 import 方向 bug 即因锚点逻辑分散而潜伏）。
 */

// —— 注入锚点（与模板文件注释逐字一致，含缩进）——

/** router.ts 中，新域路由 import 在此锚点【上方】插入 */
export const DOMAIN_IMPORT_ANCHOR = "// @scaffold:domain-import";
/** router.ts 中，新域路由展开 `...xRoutes` 在此锚点【上方】插入 */
export const DOMAIN_ROUTE_ANCHOR = "      // @scaffold:domain-route";
/** menu.config.ts 中，新根级菜单在此锚点【上方】插入 */
export const MENU_ROOT_ANCHOR = "  // @scaffold:menu";
/** mock/handlers/auth.ts 中，新 mock 菜单在此锚点【上方】插入 */
export const MOCK_MENU_ANCHOR = "  // @scaffold:mock-menu";

// —— 项目内文件相对路径（相对项目根）——

export const PROJECT_PATHS = {
  /** 根路由聚合文件 */
  router: "src/core/bootstrap/router.ts",
  /** 侧边栏菜单配置 */
  menuConfig: "src/modules/app/config/menu.config.ts",
  /** mock 登录 / 权限 */
  mockAuth: "src/mock/handlers/auth.ts",
  /** 业务域页面根目录 */
  pagesDir: "src/pages",
} as const;
