import { ref, computed, onUnmounted, getCurrentInstance, type Ref } from 'vue';
import { SPIN_DELAY, SPIN_MIN_DURATION } from '@/shared/constants/spin';

type SpinState = 'IDLE' | 'PENDING' | 'SPINNING' | 'LINGERING';

export interface UseSpinOptions {
  delay?: number;
  minDuration?: number;
}

export function useSpin(options: UseSpinOptions = {}) {
  const delay = options.delay ?? SPIN_DELAY;
  const minDuration = options.minDuration ?? SPIN_MIN_DURATION;

  const state = ref<SpinState>('IDLE');
  let delayTimer: ReturnType<typeof setTimeout> | null = null;
  let lingerTimer: ReturnType<typeof setTimeout> | null = null;
  let spinStartTime = 0;

  const spinning: Readonly<Ref<boolean>> = computed(
    () => state.value === 'SPINNING' || state.value === 'LINGERING',
  );

  function clearTimers() {
    if (delayTimer !== null) {
      clearTimeout(delayTimer);
      delayTimer = null;
    }
    if (lingerTimer !== null) {
      clearTimeout(lingerTimer);
      lingerTimer = null;
    }
  }

  function start() {
    if (state.value !== 'IDLE') return;

    state.value = 'PENDING';
    delayTimer = setTimeout(() => {
      delayTimer = null;
      state.value = 'SPINNING';
      spinStartTime = Date.now();
    }, delay);
  }

  function stop() {
    if (state.value === 'PENDING') {
      clearTimers();
      state.value = 'IDLE';
      return;
    }

    if (state.value === 'SPINNING') {
      const elapsed = Date.now() - spinStartTime;
      const remaining = minDuration - elapsed;

      if (remaining > 0) {
        state.value = 'LINGERING';
        lingerTimer = setTimeout(() => {
          lingerTimer = null;
          state.value = 'IDLE';
        }, remaining);
      } else {
        state.value = 'IDLE';
      }
    }

    // IDLE and LINGERING: no-op
  }

  if (getCurrentInstance()) {
    onUnmounted(clearTimers);
  }

  return { spinning, start, stop };
}
