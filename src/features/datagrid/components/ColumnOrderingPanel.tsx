// src/features/datagrid/components/ColumnOrderingPanel.tsx
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGridStore } from '../store/gridStore';
import { gridColumns } from '../config/columnsDefinition';
import type { GridColumnId } from '../types/gridTypes';
import { createMotionTransition } from '../config/motionSettings';

const ITEM_TRANSITION = createMotionTransition('fast');

export function ColumnOrderingPanel() {
  // Suscribimos al store completo (es un panel pequeño, no pasa nada)
  const { columnOrder, columnVisibility, setColumnOrder, resetColumnOrder } =
    useGridStore();

  const orderedColumns = useMemo(() => {
    const byId = new Map(gridColumns.map((col) => [col.id, col]));
    const resolved: typeof gridColumns = [];

    if (columnOrder && columnOrder.length > 0) {
      columnOrder.forEach((id) => {
        const col = byId.get(id);
        if (col) {
          resolved.push(col);
          byId.delete(id);
        }
      });
    }

    // Añadir columnas que falten en orden original
    gridColumns.forEach((col) => {
      if (byId.has(col.id)) {
        resolved.push(col);
        byId.delete(col.id);
      }
    });

    return resolved;
  }, [columnOrder]);

  const handleMove = (columnId: GridColumnId, direction: 'up' | 'down') => {
    // Base: si no hay columnOrder, usamos el orden por defecto
    const baseOrder: GridColumnId[] =
      columnOrder && columnOrder.length > 0
        ? [...columnOrder]
        : gridColumns.map((col) => col.id as GridColumnId);

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
      className="mt-3 border-t border-slate-800 pt-3"
    >
      <header className="mb-2 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Column order
        </h3>
        <button
          type="button"
          onClick={resetColumnOrder}
          disabled={!hasCustomOrder}
          className="rounded-md border border-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reset
        </button>
      </header>

      <ul className="space-y-1 text-xs" role="list">
        {orderedColumns.map((col, index) => {
          const isHidden =
            columnVisibility &&
            columnVisibility[col.id as GridColumnId] === false;
          const canMoveUp = index > 0;
          const canMoveDown = index < orderedColumns.length - 1;

          return (
            <motion.li
              key={col.id}
              className={`flex items-center justify-between rounded-md px-2 py-1 ${
                isHidden ? 'text-slate-500' : 'text-slate-100'
              }`}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={ITEM_TRANSITION}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-slate-500">
                  {index + 1}
                </span>
                <span className="text-[11px]">
                  {(col.meta && col.meta.label) ||
                    (typeof col.header === 'string'
                      ? col.header
                      : col.id.toString())}
                </span>
                {isHidden && (
                  <span className="rounded-full bg-slate-800 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-slate-400">
                    Hidden
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleMove(col.id as GridColumnId, 'up')}
                  disabled={!canMoveUp}
                  aria-label={`Move ${col.id} up`}
                  className="rounded-md border border-slate-700 px-1.5 py-0.5 text-[10px] hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(col.id as GridColumnId, 'down')}
                  disabled={!canMoveDown}
                  aria-label={`Move ${col.id} down`}
                  className="rounded-md border border-slate-700 px-1.5 py-0.5 text-[10px] hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
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
