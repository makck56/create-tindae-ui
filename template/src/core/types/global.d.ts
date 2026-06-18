export {};

declare module 'vue' {
  function defineRender(fn: () => JSX.Element): void;
}

declare global {
  // Global type augmentations go here
}

declare module 'vue-router' {
  interface RouteMeta {
    code?: string;
    keepAlive?: boolean;
    title?: string;
    /** 是否公共路由（匿名可访问，如登录 / 403 / 404）。守卫据此跳过登录与权限校验 */
    public?: boolean;
  }
}
