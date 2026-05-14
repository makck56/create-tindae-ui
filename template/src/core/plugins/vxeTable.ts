import type { App } from 'vue';
import { defineAsyncComponent } from 'vue';

const vxeLoaders = {
  grid: () => import('vxe-table/es/grid'),
  table: () => import('vxe-table/es/table'),
  column: () => import('vxe-table/es/column'),
  toolbar: () => import('vxe-table/es/toolbar'),
  pager: () => import('vxe-table/es/vxe-pager'),
  modal: () => import('vxe-table/es/vxe-modal'),
  tooltip: () => import('vxe-table/es/tooltip'),
};

export function setupVxeTable(app: App): void {
  // 同步注册：Vue mount 时组件已存在，首次渲染不会缺组件
  app.component('VxeGrid', defineAsyncComponent(vxeLoaders.grid));
  app.component('VxeTable', defineAsyncComponent(vxeLoaders.table));
  app.component('VxeColumn', defineAsyncComponent(vxeLoaders.column));
  app.component('VxeToolbar', defineAsyncComponent(vxeLoaders.toolbar));
  app.component('VxePager', defineAsyncComponent(vxeLoaders.pager));
  app.component('VxeModal', defineAsyncComponent(vxeLoaders.modal));
  app.component('VxeTooltip', defineAsyncComponent(vxeLoaders.tooltip));

  // 空闲预加载：提前拉取 chunk + CSS，ES module 缓存保证只下载一次
  const schedule = typeof requestIdleCallback !== 'undefined'
    ? requestIdleCallback
    : (cb: () => void) => setTimeout(cb, 1);

  schedule(async () => {
    await Promise.all([
      import('vxe-table/es/v-x-e-table'),
      ...Object.values(vxeLoaders).map((loader) => loader()),
      import('vxe-table/es/grid/style.css'),
      import('vxe-table/es/table/style.css'),
      import('vxe-table/es/column/style.css'),
    ]);
  });
}
