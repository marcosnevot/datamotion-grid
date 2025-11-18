// src/tests/unit/performance.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { measureSync } from '../../utils/performance';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny = globalThis as any;
const originalPerformance = globalAny.performance;

afterEach(() => {
  globalAny.performance = originalPerformance;
  vi.restoreAllMocks();
});

describe('measureSync', () => {
  it('measures duration using performance.now when available', () => {
    let call = 0;

    globalAny.performance = {
      now: vi.fn(() => {
        call += 1;
        return call === 1 ? 100 : 130;
      }),
    };

    const { result, sample } = measureSync('test-label', () => 42);

    expect(result).toBe(42);
    expect(sample.label).toBe('test-label');
    expect(sample.durationMs).toBe(30);
    expect(globalAny.performance.now).toHaveBeenCalledTimes(2);
  });

  it('falls back to Date.now when performance is not available', () => {
    globalAny.performance = undefined;

    let call = 0;
    vi.spyOn(Date, 'now').mockImplementation(() => {
      call += 1;
      return call === 1 ? 10_000 : 10_050;
    });

    const { result, sample } = measureSync('fallback', () => 'ok');

    expect(result).toBe('ok');
    expect(sample.label).toBe('fallback');
    expect(sample.durationMs).toBe(50);
    expect(Date.now).toHaveBeenCalledTimes(2);
  });

  it('logs debug info when log option is true', () => {
    globalAny.performance = {
      now: vi
        .fn()
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(5),
    };

    const debugSpy = vi
      .spyOn(console, 'debug')
      .mockImplementation(() => {});

    const { sample } = measureSync('logged', () => null, { log: true });

    expect(debugSpy).toHaveBeenCalledTimes(1);
    const [message] = debugSpy.mock.calls[0];
    expect(String(message)).toContain('[perf]');
    expect(String(message)).toContain('logged');
    expect(sample.durationMs).toBe(5);
  });
});
