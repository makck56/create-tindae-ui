import type { App } from 'vue';
import VxeUITable from 'vxe-table';
import 'vxe-table/lib/style.css';

export function setupVxeTable(app: App): void {
  app.use(VxeUITable);
}
