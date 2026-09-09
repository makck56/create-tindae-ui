import { describe, expect, it } from 'vitest';
import { createMenuConfig } from './menu.config';
import { resolveMenuIcon } from './menuIcons';

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

  it('菜单声明过的 icon 必须在注册表中可解析', () => {
    // 契约背景：antd 折叠态靠 `.ant-menu-item-icon + span { opacity: 0 }` 隐藏文字，
    // 根级菜单运行时虽有默认图标兜底，但配置里的图标名写错会静默退化为通用图标。
    const declared = createMenuConfig(true).filter((item) => item.icon !== undefined);

    expect(declared.length).toBeGreaterThan(0);
    for (const item of declared) {
      expect(resolveMenuIcon(item.icon), `${item.label} 的图标 ${item.icon} 未注册`).toBeDefined();
    }
  });
});
