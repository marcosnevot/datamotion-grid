// src/components/layout/AppFooter.tsx
import { useEffect, useState } from 'react';

function useFpsMeter() {
  const [fps, setFps] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.requestAnimationFrame === 'undefined') {
      return;
    }

    let frameCount = 0;
    let lastTime = performance.now();
    let rafId: number;

    const loop = (now: number) => {
      frameCount += 1;
      const delta = now - lastTime;

      if (delta >= 500) {
        const currentFps = (frameCount * 1000) / delta;
        setFps(Math.round(currentFps));
        frameCount = 0;
        lastTime = now;
      }

      rafId = window.requestAnimationFrame(loop);
    };

    rafId = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  return fps;
}

export function AppFooter() {
  const fps = useFpsMeter();

  return (
    <div className="flex items-center justify-between px-4 py-2 text-xs text-slate-500">
      <span>DataMotion Grid · Internal prototype</span>

      <div className="flex items-center gap-4">
        <span>Phase 6 – testing, performance and cleanup</span>

        <div className="hidden items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-2 py-1 text-[11px] text-slate-300 sm:flex">
          <span className="font-mono text-[10px] text-slate-400">Perf</span>
          <span className="h-3 w-px bg-slate-700" aria-hidden="true" />
          <span>
            FPS:{' '}
            <span className="font-mono">
              {fps !== null ? fps : 'measuring…'}
            </span>
          </span>
          <span className="hidden md:inline">
            · Virtualized rows up to 50k
          </span>
        </div>
      </div>
    </div>
  );
}
