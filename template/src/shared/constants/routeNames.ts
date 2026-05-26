/**
 * 🔒 自动生成的路由名称常量
 * ⚠️ 请勿手动修改，修改 src/pages 下的 *.routes.ts 后会自动更新
 * 🕒 生成时间: 5/26/2026, 2:10:45 AM
 */

export const ROUTE_NAMES = {
  Error: {
    FORBIDDEN: "Forbidden",
  },
  Login: {
    LOGIN: "Login",
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
