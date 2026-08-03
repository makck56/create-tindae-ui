import type { MenuConfig } from './menuTypes';

const businessMenus: MenuConfig = [
  {
    label: '用户管理',
    code: 'UserManagement',
    routeName: 'UserManagement',
  },
  {
    label: '角色管理',
    code: 'RoleManagement',
    routeName: 'RoleManagement',
  },
  // @scaffold:menu ← 新根级菜单在此行上方插入（由 scaffold:domain 自动维护，请勿删除）
];

const devOnlyMenus: MenuConfig = [
  {
    label: '主题预览',
    code: 'ThemePreview',
    routeName: 'ThemePreview',
  },
  {
    label: '项目文档',
    code: 'Readme',
    routeName: 'Readme',
  },
];

/**
 * 根据运行环境生成侧边栏菜单。
 *
 * `/theme-preview` 与 `/readme` 只在开发态注册路由；生产态如果继续暴露菜单，
 * 用户会看到不可访问入口。这里在配置源头按环境组合，确保 mock 登录、侧边栏
 * 和真实路由始终使用同一套可访问菜单。
 */
export function createMenuConfig(isDev: boolean): MenuConfig {
  return isDev ? [...businessMenus, ...devOnlyMenus] : [...businessMenus];
}

export const menuConfig: MenuConfig = createMenuConfig(import.meta.env.DEV);
