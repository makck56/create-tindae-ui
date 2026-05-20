import type { App } from 'vue';
import VXETable from 'vxe-table/es/v-x-e-table';
import zhCN from 'vxe-table/es/locale/lang/zh-CN';
import Grid from 'vxe-table/es/grid';
import Table from 'vxe-table/es/table';
import Column from 'vxe-table/es/column';
import Checkbox from 'vxe-table/es/checkbox';
import Toolbar from 'vxe-table/es/toolbar';
import Pager from 'vxe-table/es/vxe-pager';
import Modal from 'vxe-table/es/vxe-modal';
import Tooltip from 'vxe-table/es/tooltip';

import 'vxe-table/es/grid/style.css';
import 'vxe-table/es/table/style.css';
import 'vxe-table/es/column/style.css';
import 'vxe-table/es/vxe-pager/style.css';
import 'vxe-table/es/checkbox/style.css';
import 'vxe-table/es/toolbar/style.css';
import 'vxe-table/es/vxe-modal/style.css';
import 'vxe-table/es/tooltip/style.css';

const messages = (zhCN as any).default ?? zhCN

function getNestedValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

export function setupVxeTable(app: App): void {
  VXETable.setup({ i18n: (key: string) => getNestedValue(messages, key) || key });
  app.component(Grid.name!, Grid);
  app.component(Table.name!, Table);
  app.component(Column.name!, Column);
  app.component(Checkbox.name!, Checkbox);
  app.component(Toolbar.name!, Toolbar);
  app.component(Pager.name!, Pager);
  app.component(Modal.name!, Modal);
  app.component(Tooltip.name!, Tooltip);
}
