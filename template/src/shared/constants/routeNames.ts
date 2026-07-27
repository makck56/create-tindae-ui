/**
 * 🔒 自动生成的路由名称常量
 * ⚠️ 请勿手动修改，修改 src/pages 下的 *.routes.ts 后会自动更新
 * 🕒 生成时间: 2026/7/24 17:10:19
 */

export const ROUTE_NAMES = {
  Error: {
    FORBIDDEN: "Forbidden",
    NOT_FOUND: "NotFound",
  },
  Login: {
    LOGIN: "Login",
  },
  Readme: {
    /** 项目文档 */
    README: "Readme",
  },
  ThemePreview: {
    /** 主题预览 */
    THEME_PREVIEW: "ThemePreview",
  },
  UserManagement: {
    /** 用户管理 */
    USER_MANAGEMENT: "UserManagement",
    /** 角色管理 */
    ROLE_MANAGEMENT: "RoleManagement",
  },
} as const;

// 导出类型以便在代码中使用
export type RouteNameKey = keyof typeof ROUTE_NAMES;
