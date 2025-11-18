// src/features/datagrid/components/ColumnOrderingPanel.tsx
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGridStore } from '../store/gridStore';
import { gridColumns } from '../config/columnsDefinition';
import { createMotionTransition } from '../config/motionSettings';

const ITEM_TRANSITION = createMotionTransition('fast');

export function ColumnOrderingPanel() {
  // Small panel, we can subscribe to the full slice without issues
  const { columnOrder, columnVisibility, setColumnOrder, resetColumnOrder } =
    useGridStore();

  const orderedColumns = useMemo(() => {
    // Work with string keys to avoid over-constraining types
    const byId = new Map<string, (typeof gridColumns)[number]>(
      gridColumns.map((col) => [String(col.id), col]),
    );
    const resolved: typeof gridColumns = [];

    if (columnOrder && columnOrder.length > 0) {
      columnOrder.forEach((id) => {
        const key = String(id);
        const col = byId.get(key);
        if (col) {
          resolved.push(col);
          byId.delete(key);
        }
      });
    }

    // Add missing columns in their original order
    gridColumns.forEach((col) => {
      const key = String(col.id);
      if (byId.has(key)) {
        resolved.push(col);
        byId.delete(key);
      }
    });

    return resolved;
  }, [columnOrder]);

  const handleMove = (columnId: string, direction: 'up' | 'down') => {
    // Base: if there is no custom columnOrder, use default order
    const baseOrder =
      columnOrder && columnOrder.length > 0
        ? [...columnOrder]
        : gridColumns.map((col) => String(col.id));

    const currentIndex = baseOrder.indexOf(columnId);
    if (currentIndex === -1) return;

    const targetIndex =
      direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= baseOrder.length) {
      return;
    }

    const [removed] = baseOrder.splice(currentIndex, 1);
    baseOrder.splice(targetIndex, 0, removed);

    setColumnOrder(baseOrder);
  };

  const hasCustomOrder = !!(columnOrder && columnOrder.length > 0);

  return (
    <section
      aria-label="Column order"
      className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-800"
    >
      <header className="mb-2 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
          Column order
        </h3>
        <button
          type="button"
          onClick={resetColumnOrder}
          disabled={!hasCustomOrder}
          className="rounded-md border border-slate-300 bg-white/80 px-2 py-0.5 text-[10px] font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Reset
        </button>
      </header>

      <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-200" role="list">
        {orderedColumns.map((col, index) => {
          const isHidden =
            columnVisibility &&
            columnVisibility[String(col.id)] === false;

          const canMoveUp = index > 0;
          const canMoveDown = index < orderedColumns.length - 1;

          const itemTextClass = isHidden
            ? 'text-slate-500 dark:text-slate-500'
            : 'text-slate-800 dark:text-slate-100';

          return (
            <motion.li
              key={col.id}
              className={`flex items-center justify-between rounded-md px-2 py-1 ${itemTextClass} bg-slate-50 dark:bg-slate-900/40`}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={ITEM_TRANSITION}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-500">
                  {index + 1}
                </span>
                <span className="text-[11px]">
                  {(col.meta && col.meta.label) ||
                    (typeof col.header === 'string'
                      ? col.header
                      : col.id.toString())}
                </span>
                {isHidden && (
                  <span className="rounded-full border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    Hidden
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleMove(String(col.id), 'up')}
                  disabled={!canMoveUp}
                  aria-label={`Move ${col.id} up`}
                  className="rounded-md border border-slate-300 bg-white/80 px-1.5 py-0.5 text-[10px] text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(String(col.id), 'down')}
                  disabled={!canMoveDown}
                  aria-label={`Move ${col.id} down`}
                  className="rounded-md border border-slate-300 bg-white/80 px-1.5 py-0.5 text-[10px] text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  ↓
                </button>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
