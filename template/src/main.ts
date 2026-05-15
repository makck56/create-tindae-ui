import { setupApp } from './core/bootstrap';

if (import.meta.env.DEV) {
  import('@/mock/browser').then(({ worker }) => {
    worker.start({ onUnhandledRequest: 'bypass' }).then(setupApp);
  });
} else {
  setupApp();
}
