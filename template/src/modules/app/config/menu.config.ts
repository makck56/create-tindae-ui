import type { MenuConfig } from './menuTypes';

export const menuConfig: MenuConfig = [
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
  {
    label: '主题预览',
    code: 'ThemePreview',
    routeName: 'ThemePreview',
  },
  // @scaffold:menu ← 新根级菜单在此行上方插入（由 scaffold:domain 自动维护，请勿删除）
];
