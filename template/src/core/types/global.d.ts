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
  }
}
