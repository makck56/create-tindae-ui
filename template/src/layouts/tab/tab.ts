import { defineStore } from 'pinia';
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router';
import { SPIN_MIN_DURATION } from '@/shared/constants/spin';

export interface TabItem {
  key: string;
  name: string;
  path: string;
  title: string;
  keepAlive: boolean;
}

export const useTabStore = defineStore('tab', {
  state: (): {
    tabs: TabItem[];
    activeTab: string;
    _excludeCache: string[];
    visitedOrder: string[];
  } => ({
    tabs: [],
    activeTab: '',
    _excludeCache: [],
    visitedOrder: [],
  }),

  getters: {
    cachedNames(state): string[] {
      return state.tabs
        .filter((tab) => tab.keepAlive && !state._excludeCache.includes(tab.name))
        .map((tab) => tab.name);
    },
    activeKeepAlive(): boolean {
      return this.tabs.find((t) => t.key === this.activeTab)?.keepAlive ?? false;
    },
    isExcluded(state): (name: string) => boolean {
      return (name: string) => state._excludeCache.includes(name);
    },
  },

  actions: {
    addTab(route: RouteLocationNormalizedLoaded) {
      if (typeof route.name !== 'string') return;

      const key = route.path;
      const existing = this.tabs.find((t) => t.key === key);
      if (!existing) {
        this.tabs.push({
          key,
          name: route.name,
          path: route.fullPath,
          title: (route.query._tabTitle as string) || (route.meta.title as string) || route.name,
          keepAlive: route.meta.keepAlive === true,
        });
      } else {
        existing.path = route.fullPath;
      }

      this.activeTab = key;
      this.visitedOrder = this.visitedOrder.filter((k) => k !== key);
      this.visitedOrder.push(key);
    },

    closeTab(key: string, router: Router) {
      const index = this.tabs.findIndex((t) => t.key === key);
      if (index === -1) return;

      this.tabs.splice(index, 1);
      this.visitedOrder = this.visitedOrder.filter((k) => k !== key);

      if (this.activeTab === key) {
        let targetKey: string | undefined;
        for (let i = this.visitedOrder.length - 1; i >= 0; i--) {
          if (this.tabs.some((t) => t.key === this.visitedOrder[i])) {
            targetKey = this.visitedOrder[i];
            break;
          }
        }
        if (targetKey) {
          const target = this.tabs.find((t) => t.key === targetKey)!;
          this.activeTab = targetKey;
          router.push(target.path);
        } else {
          router.push('/');
        }
      }
    },

    closeLeftTabs(key: string, router: Router) {
      const index = this.tabs.findIndex((t) => t.key === key);
      if (index === -1) return;
      const removed = this.tabs.splice(0, index);
      const removedKeys = new Set(removed.map((t) => t.key));
      this.visitedOrder = this.visitedOrder.filter((k) => !removedKeys.has(k));
      if (removedKeys.has(this.activeTab)) {
        this.activeTab = key;
        router.push(this.tabs.find((t) => t.key === key)!.path);
      }
    },

    closeRightTabs(key: string, router: Router) {
      const index = this.tabs.findIndex((t) => t.key === key);
      if (index === -1) return;
      const removed = this.tabs.splice(index + 1);
      const removedKeys = new Set(removed.map((t) => t.key));
      this.visitedOrder = this.visitedOrder.filter((k) => !removedKeys.has(k));
      if (removedKeys.has(this.activeTab)) {
        this.activeTab = key;
        router.push(this.tabs.find((t) => t.key === key)!.path);
      }
    },

    closeOtherTabs(key: string, router: Router) {
      const wasOtherTab = this.activeTab !== key;
      this.tabs = this.tabs.filter((t) => t.key === key);
      this.visitedOrder = this.visitedOrder.filter((k) => k === key);
      this.activeTab = key;
      if (wasOtherTab) {
        router.push(this.tabs.find((t) => t.key === key)!.path);
      }
    },

    closeAllTabs(router: Router) {
      this.tabs = [];
      this.visitedOrder = [];
      router.push('/');
    },

    async refreshTab(key: string) {
      const tab = this.tabs.find((t) => t.key === key);
      if (!tab) return;
      this._excludeCache.push(tab.name);
      await new Promise((r) => setTimeout(r, SPIN_MIN_DURATION));
      this._excludeCache = this._excludeCache.filter((n) => n !== tab.name);
    },
  },
});

export function setupTab(router: Router): void {
  const store = useTabStore();

  router.afterEach((to) => {
    if (typeof to.name === 'string' && to.meta.title) {
      store.addTab(to);
    }
  });
}
