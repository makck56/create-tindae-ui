export {};

declare global {
  // Global type augmentations go here
}

declare module 'vue-router' {
  interface RouteMeta {
    code?: string;
  }
}
