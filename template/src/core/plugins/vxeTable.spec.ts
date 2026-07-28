import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { App } from 'vue';
import { setupVxeTable } from './vxeTable';
import VXETable, { VxeUI } from 'vxe-table';
import VxeUIPcUi from 'vxe-pc-ui';

// 样式导入在测试环境里是空对象，避免 vitest 解析真实 CSS。
vi.mock('vxe-table/es/style.css', () => ({}));
vi.mock('vxe-pc-ui/es/style.css', () => ({}));

// 提供最小中文文案片段，用于验证 locale 合并与回退逻辑。
vi.mock('vxe-table/es/locale/lang/zh-CN', () => ({
  default: {
    table: {
      emptyText: '暂无数据',
    },
  },
}));

vi.mock('vxe-pc-ui/es/language/zh-CN', () => ({
  default: {
    pager: {
      goto: '跳转',
    },
  },
}));

vi.mock('vxe-table', () => {
  const install = vi.fn();
  return {
    default: install,
    VxeUI: {
      setI18n: vi.fn(),
      setLanguage: vi.fn(),
      setConfig: vi.fn(),
    },
  };
});

// vxe-pc-ui 默认导出是带 install 的插件对象，这里只模拟 install 行为。
vi.mock('vxe-pc-ui', () => ({
  default: { install: vi.fn() },
}));

describe('setupVxeTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('先注册 vxe-pc-ui，再注册 vxe-table，并设置中文 locale', () => {
    const app = {
      use: vi.fn(),
    } as unknown as App;

    setupVxeTable(app);

    expect(VxeUI.setI18n).toHaveBeenCalledWith(
      'zh-CN',
      expect.objectContaining({
        // 两份 locale 合并后，表格与分页器文案都应存在
        table: expect.objectContaining({
          emptyText: '暂无数据',
        }),
        pager: expect.objectContaining({
          goto: '跳转',
        }),
      }),
    );
    expect(VxeUI.setLanguage).toHaveBeenCalledWith('zh-CN');
    expect(VxeUI.setConfig).toHaveBeenCalledWith({
      i18n: expect.any(Function),
      grid: {
        // 模板默认不启用 VXE 内置查询表单和工具栏，避免未注册 renderer 的运行时异常。
        formConfig: { enabled: false },
        toolbarConfig: { enabled: false },
      },
    });
    // PC UI 组件必须先于表格核心注册，grid 才能取到 VxePager 等依赖组件
    expect(app.use).toHaveBeenNthCalledWith(1, VxeUIPcUi);
    expect(app.use).toHaveBeenNthCalledWith(2, VXETable);
  });

  it('找不到翻译键时回退原始 key', () => {
    const app = {
      use: vi.fn(),
    } as unknown as App;

    setupVxeTable(app);

    const configArg = vi.mocked(VxeUI.setConfig).mock.calls[0]?.[0];
    const i18n = configArg?.i18n as (key: string) => string;

    expect(i18n('table.emptyText')).toBe('暂无数据');
    expect(i18n('table.not-found')).toBe('table.not-found');
  });
});
