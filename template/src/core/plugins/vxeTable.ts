import type { App } from 'vue';
import VXETable, { VxeUI } from 'vxe-table';
// vxe-pc-ui 的默认导出是带 install 的插件对象（namespace），故用默认导入。
import VxeUIPcUi from 'vxe-pc-ui';
import vxeTableZhCN from 'vxe-table/es/locale/lang/zh-CN';
import vxePcUiZhCN from 'vxe-pc-ui/es/language/zh-CN';

import 'vxe-table/es/style.css';
import 'vxe-pc-ui/es/style.css';

// vxe-table 4.6+ 将 VxePager / VxeForm 等 PC UI 组件拆分到独立的 vxe-pc-ui 包，
// 两个包各自维护一份中文文案，这里合并后再写入共享的 VxeUI，
// 确保表格（空数据、排序提示等）与分页器（上一页 / 跳转等）文案都完整。
const tableMessages =
  (vxeTableZhCN as { default?: Record<string, unknown> }).default ?? vxeTableZhCN;
const pcUiMessages = (vxePcUiZhCN as { default?: Record<string, unknown> }).default ?? vxePcUiZhCN;
const messages: Record<string, unknown> = { ...pcUiMessages, ...tableMessages };

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  // 支持 "a.b.c" 形式的嵌套 key 取值，用于自定义 i18n 查找。
  const value = path.split('.').reduce<unknown>((acc, key) => {
    if (typeof acc !== 'object' || acc === null) return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);

  return typeof value === 'string' ? value : undefined;
}

export function setupVxeTable(app: App): void {
  // 统一走包级安装：先注册 vxe-pc-ui，提供 VxePager / VxeForm 等 grid 依赖的组件，
  // 否则 pagerConfig 会触发 "缺少组件" 警告且分页器不会渲染；再注册 vxe-table 表格核心。
  VxeUI.setI18n('zh-CN', messages);
  VxeUI.setLanguage('zh-CN');
  VxeUI.setConfig({
    i18n: (key: string) => getNestedValue(messages, key) || key,
    grid: {
      // 本模板的列表页只使用表格、分页与 proxy 查询，不使用 VXE 内置查询表单和工具栏。
      // vxe-table 4.20.x 的全局默认值会启用 form/toolbar，某些按需渲染路径会继续查找空 renderer，
      // 进而抛出 "Renderer 'undefined' is not imported"。这里全局关闭未使用能力，避免页面显式配置遗漏。
      formConfig: { enabled: false },
      toolbarConfig: { enabled: false },
    },
  });
  app.use(VxeUIPcUi);
  app.use(VXETable);
}
