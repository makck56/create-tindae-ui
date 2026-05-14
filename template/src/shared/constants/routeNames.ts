/**
 * 🔒 自动生成的路由名称常量
 * ⚠️ 请勿手动修改，修改 src/pages 下的 *.routes.ts 后会自动更新
 * 🕒 生成时间: 5/13/2026, 11:49:27 PM
 */

export const ROUTE_NAMES = {
  Error: {
    FORBIDDEN: "Forbidden",
  },
  Login: {
    LOGIN: "Login",
  },
  UserManagement: {
    USER_MANAGEMENT: "UserManagement",
  },
} as const;

// 导出类型以便在代码中使用
export type RouteNameKey = keyof typeof ROUTE_NAMES;
