// This file is excluded from tsconfig (vue-tsc) but used by Vite dev server.
// Import from bootstrap via dynamic import('@/mock/start').
import { worker } from '@/mock/browser'

export async function startMockServiceWorker() {
  await worker.start({ onUnhandledRequest: 'bypass' })
}
