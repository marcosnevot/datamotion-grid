// src/utils/performance.ts

export interface PerformanceSample {
    label: string;
    durationMs: number;
}

function nowMs(): number {
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        return performance.now();
    }

    return Date.now();
}

export interface MeasureSyncOptions {
    log?: boolean;
}

/**
 * measureSync
 * Small utility to measure the duration of a synchronous function.
 * It optionally logs to the console when `log` is true.
 */
export function measureSync<T>(
    label: string,
    fn: () => T,
    options?: MeasureSyncOptions,
): { result: T; sample: PerformanceSample } {
    const start = nowMs();
    const result = fn();
    const end = nowMs();

    const sample: PerformanceSample = {
        label,
        durationMs: end - start,
    };

    if (options?.log) {
        console.debug(
            `[perf] ${sample.label}: ${sample.durationMs.toFixed(2)}ms`,
        );
    }

    return { result, sample };
}
