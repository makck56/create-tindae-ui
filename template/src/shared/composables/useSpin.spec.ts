import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSpin } from './useSpin';

describe('useSpin', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initial spinning is false', () => {
    const { spinning } = useSpin();
    expect(spinning.value).toBe(false);
  });

  it('fast request (< delay) does not show loading', () => {
    const { spinning, start, stop } = useSpin({ delay: 300 });

    start();
    expect(spinning.value).toBe(false);

    // Complete before delay elapses
    vi.advanceTimersByTime(200);
    stop();
    expect(spinning.value).toBe(false);

    // Advance past the delay — no spinner should appear
    vi.advanceTimersByTime(200);
    expect(spinning.value).toBe(false);
  });

  it('after delay, loading shows', () => {
    const { spinning, start } = useSpin({ delay: 300 });

    start();
    expect(spinning.value).toBe(false);

    vi.advanceTimersByTime(300);
    expect(spinning.value).toBe(true);
  });

  it('after showing, minimum display duration enforced', () => {
    const { spinning, start, stop } = useSpin({ delay: 200, minDuration: 500 });

    start();
    vi.advanceTimersByTime(200); // delay → SPINNING
    expect(spinning.value).toBe(true);

    stop();

    // Still spinning due to LINGERING state
    vi.advanceTimersByTime(400);
    expect(spinning.value).toBe(true);

    // After full minDuration elapses, returns to IDLE
    vi.advanceTimersByTime(100);
    expect(spinning.value).toBe(false);
  });

  it('PENDING state stop returns directly to IDLE', () => {
    const { spinning, start, stop } = useSpin({ delay: 300 });

    start();
    expect(spinning.value).toBe(false); // in PENDING

    stop();
    expect(spinning.value).toBe(false); // back to IDLE

    // Delay timer should be cleared — no state change
    vi.advanceTimersByTime(500);
    expect(spinning.value).toBe(false);
  });

  it('default parameters work (delay 300, minDuration 500)', () => {
    const { spinning, start, stop } = useSpin();

    start();
    vi.advanceTimersByTime(299);
    expect(spinning.value).toBe(false);

    vi.advanceTimersByTime(1);
    expect(spinning.value).toBe(true);

    stop();
    vi.advanceTimersByTime(499);
    expect(spinning.value).toBe(true);

    vi.advanceTimersByTime(1);
    expect(spinning.value).toBe(false);
  });

  it('multiple start() calls have no side effects', () => {
    const { spinning, start, stop } = useSpin({ delay: 200, minDuration: 300 });

    start();
    start();
    start();

    vi.advanceTimersByTime(200);
    expect(spinning.value).toBe(true);

    stop();
    vi.advanceTimersByTime(300);
    expect(spinning.value).toBe(false);
  });

  it('SPINNING state stop enters LINGERING', () => {
    const { spinning, start, stop } = useSpin({ delay: 100, minDuration: 400 });

    start();
    vi.advanceTimersByTime(100); // → SPINNING
    expect(spinning.value).toBe(true);

    stop(); // → LINGERING
    expect(spinning.value).toBe(true);

    // minDuration hasn't fully elapsed
    vi.advanceTimersByTime(399);
    expect(spinning.value).toBe(true);

    // minDuration fully elapsed
    vi.advanceTimersByTime(1);
    expect(spinning.value).toBe(false);
  });

  it('LINGERING state ignores start() and stop()', () => {
    const { spinning, start, stop } = useSpin({ delay: 100, minDuration: 500 });

    start();
    vi.advanceTimersByTime(100); // → SPINNING
    stop(); // → LINGERING

    // These should be no-ops during LINGERING
    start();
    stop();
    start();

    // Still in LINGERING — minDuration timer unaffected
    vi.advanceTimersByTime(499);
    expect(spinning.value).toBe(true);

    vi.advanceTimersByTime(1);
    expect(spinning.value).toBe(false);
  });
});
