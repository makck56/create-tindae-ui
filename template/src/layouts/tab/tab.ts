import { defineStore } from 'pinia';
import { nextTick } from 'vue';
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router';

export interface TabItem {
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
  } => ({
    tabs: [],
    activeTab: '',
    _excludeCache: [],
  }),

  getters: {
    cachedNames(state): string[] {
      return state.tabs
        .filter((tab) => tab.keepAlive && !state._excludeCache.includes(tab.name))
        .map((tab) => tab.name);
    },
    activeKeepAlive(): boolean {
      return this.tabs.find((t) => t.name === this.activeTab)?.keepAlive ?? false;
    },
  },

  actions: {
    addTab(route: RouteLocationNormalizedLoaded) {
      if (typeof route.name !== 'string') return;

      const existing = this.tabs.find((t) => t.name === route.name);
      if (!existing) {
        this.tabs.push({
          name: route.name,
          path: route.fullPath,
          title: route.meta.title || route.name,
          keepAlive: route.meta.keepAlive === true,
        });
      } else {
        existing.path = route.fullPath;
      }

      this.activeTab = route.name;
    },

    closeTab(name: string, router: Router) {
      const index = this.tabs.findIndex((t) => t.name === name);
      if (index === -1) return;

      this.tabs.splice(index, 1);

      if (this.activeTab === name) {
        const target = this.tabs[Math.max(0, index - 1)];
        if (target) {
          this.activeTab = target.name;
          router.push(target.path);
        }
      }
    },

    closeOtherTabs(name: string) {
      this.tabs = this.tabs.filter((t) => t.name === name);
      this.activeTab = name;
    },

    closeAllTabs(router: Router) {
      this.tabs = [];
      router.push('/');
    },

    async refreshTab(name: string) {
      this._excludeCache.push(name);
      await nextTick();
      this._excludeCache = this._excludeCache.filter((n) => n !== name);
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
