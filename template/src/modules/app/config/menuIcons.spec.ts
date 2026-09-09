import { describe, expect, it } from 'vitest';
import { AppstoreOutlined, TeamOutlined } from '@ant-design/icons-vue';
import { resolveMenuIcon, resolveRootMenuIcon } from './menuIcons';

describe('resolveMenuIcon', () => {
  it('按注册表名字解析为图标组件', () => {
    expect(resolveMenuIcon('TeamOutlined')).toBe(TeamOutlined);
  });

  it('未配置或未知名字返回 undefined（严格解析，不兜底）', () => {
    expect(resolveMenuIcon(undefined)).toBeUndefined();
    expect(resolveMenuIcon('NotRegisteredIcon')).toBeUndefined();
  });
});

describe('resolveRootMenuIcon', () => {
  it('未配置或未知名字回退默认图标，保证折叠态文字可被隐藏', () => {
    expect(resolveRootMenuIcon(undefined)).toBe(AppstoreOutlined);
    expect(resolveRootMenuIcon('NotRegisteredIcon')).toBe(AppstoreOutlined);
  });

  it('已注册的名字优先于默认图标', () => {
    expect(resolveRootMenuIcon('TeamOutlined')).toBe(TeamOutlined);
  });
});
