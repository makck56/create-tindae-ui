import type { App } from 'vue';
import VXETable from 'vxe-table/es/v-x-e-table';
import zhCN from 'vxe-table/es/locale/lang/zh-CN';
import Grid from 'vxe-table/es/grid';
import Table from 'vxe-table/es/table';
import Column from 'vxe-table/es/column';
import Checkbox from 'vxe-table/es/checkbox';
// 列筛选模块：vxe-grid 的 commitProxy('query') 内部会无条件调用
// $xetable.getCheckedFilters()（无论业务是否使用列筛选），该方法由 filter 模块提供。
// 若不注册，触发查询（如点击搜索、分页、reload）会报 "getCheckedFilters is not a function"。
import Filter from 'vxe-table/es/filter';
import Toolbar from 'vxe-table/es/toolbar';
import Pager from 'vxe-table/es/vxe-pager';
import Modal from 'vxe-table/es/vxe-modal';
import Tooltip from 'vxe-table/es/tooltip';

import 'vxe-table/es/grid/style.css';
import 'vxe-table/es/table/style.css';
import 'vxe-table/es/column/style.css';
import 'vxe-table/es/vxe-pager/style.css';
import 'vxe-table/es/checkbox/style.css';
import 'vxe-table/es/filter/style.css';
import 'vxe-table/es/toolbar/style.css';
import 'vxe-table/es/vxe-modal/style.css';
import 'vxe-table/es/tooltip/style.css';

const messages = (zhCN as any).default ?? zhCN

function getNestedValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

export function setupVxeTable(app: App): void {
  VXETable.setup({ i18n: (key: string) => getNestedValue(messages, key) || key });
  // 先注册 filter 模块：install 内部执行 VXETable.hooks.add('$tableFilter', ...)，
  // 必须早于 grid 组件首次实例化，grid 实例才能拿到 getCheckedFilters 等方法。
  app.use(Filter as any);
  app.component(Grid.name!, Grid);
  app.component(Table.name!, Table);
  app.component(Column.name!, Column);
  app.component(Checkbox.name!, Checkbox);
  app.component(Toolbar.name!, Toolbar);
  app.component(Pager.name!, Pager);
  app.component(Modal.name!, Modal);
  app.component(Tooltip.name!, Tooltip);
}
