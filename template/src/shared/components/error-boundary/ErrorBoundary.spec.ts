import { defineComponent, h } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter, RouterView } from 'vue-router';
import ErrorBoundary from './ErrorBoundary.vue';

describe('ErrorBoundary', () => {
  it('路由切换后会清空旧页面错误态并渲染新页面', async () => {
    const originalConsoleError = console.error;
    console.error = vi.fn();

    const BrokenPage = defineComponent({
      name: 'BrokenPage',
      setup() {
        throw new Error('broken page');
      },
      render: () => null,
    });

    const HealthyPage = defineComponent({
      name: 'HealthyPage',
      render: () => h('div', 'healthy page'),
    });

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/broken', component: BrokenPage },
        { path: '/healthy', component: HealthyPage },
      ],
    });

    const AppShell = defineComponent({
      name: 'AppShell',
      components: { ErrorBoundary, RouterView },
      template: `
        <ErrorBoundary>
          <RouterView />
        </ErrorBoundary>
      `,
    });

    try {
      // 先进入会抛错的页面，验证错误边界进入 fallback 状态。
      await router.push('/broken');
      await router.isReady();

      const wrapper = mount(AppShell, {
        global: {
          plugins: [router],
          stubs: {
            AResult: {
              props: ['title'],
              template:
                '<section data-test="error-result">{{ title }}<slot name="extra" /></section>',
            },
            AButton: {
              template: '<button><slot /></button>',
            },
          },
        },
      });
      await flushPromises();

      expect(wrapper.find('[data-test="error-result"]').exists()).toBe(true);

      // 再切到正常页面。ErrorBoundary 位于布局层不会被卸载，
      // 所以这里专门验证它会根据 route.fullPath 变化主动清掉旧 error。
      await router.push('/healthy');
      await flushPromises();

      expect(wrapper.find('[data-test="error-result"]').exists()).toBe(false);
      expect(wrapper.text()).toContain('healthy page');
    } finally {
      console.error = originalConsoleError;
    }
  });
});
