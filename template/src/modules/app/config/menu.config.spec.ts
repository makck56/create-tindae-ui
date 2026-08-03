import { describe, expect, it } from 'vitest';
import { createMenuConfig } from './menu.config';

const devOnlyCodes = ['ThemePreview', 'Readme'];

describe('createMenuConfig', () => {
  it('开发态保留模板预览和文档菜单', () => {
    const codes = createMenuConfig(true).map((item) => item.code);

    expect(codes).toEqual(expect.arrayContaining(devOnlyCodes));
  });

  it('生产态隐藏仅开发态注册路由的菜单', () => {
    const codes = createMenuConfig(false).map((item) => item.code);

    // 生产构建不会注册 theme-preview/readme 路由，因此菜单源头也必须过滤掉这些入口。
    expect(codes).not.toEqual(expect.arrayContaining(devOnlyCodes));
    expect(codes).toEqual(expect.arrayContaining(['UserManagement', 'RoleManagement']));
  });
});
