// src/features/datagrid/components/ColumnVisibilityPanel.tsx
import { useMemo } from 'react';
import { gridColumns } from '../config/columnsDefinition';
import type { GridColumnId } from '../types/gridTypes';
import { useGridStore } from '../store/gridStore';
import { ColumnOrderingPanel } from './ColumnOrderingPanel';

interface ColumnVisibilityPanelProps {
  onClose?: () => void;
}

export const ColumnVisibilityPanel: React.FC<ColumnVisibilityPanelProps> = () => {
  const columnVisibility = useGridStore((state) => state.columnVisibility);
  const toggleColumnVisibility = useGridStore(
    (state) => state.toggleColumnVisibility,
  );
  const resetColumnVisibility = useGridStore(
    (state) => state.resetColumnVisibility,
  );

  const columns = useMemo(
    () =>
      gridColumns.map((column) => ({
        id: column.id as GridColumnId,
        label: column.meta?.label ?? String(column.id),
      })),
    [],
  );

  const visibleCount = useMemo(() => {
    return columns.reduce((count, column) => {
      const value = columnVisibility[column.id];
      const isVisible = value !== false; // undefined / true => visible
      return isVisible ? count + 1 : count;
    }, 0);
  }, [columns, columnVisibility]);

  const handleToggle = (columnId: GridColumnId) => {
    const value = columnVisibility[columnId];
    const isVisible = value !== false;

    // Nunca permitir 0 columnas visibles
    if (isVisible && visibleCount <= 1) {
      return;
    }

    toggleColumnVisibility(columnId);
  };

  const handleReset = () => {
    resetColumnVisibility();
  };

  return (
    <div
      role="dialog"
      aria-label="Column configuration"
      className="w-64 rounded-md border border-slate-200 bg-white/95 p-2 text-xs shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95"
    >
      {/* VISIBILITY */}
      <div className="mb-1 flex items-center justify-between">
        <span className="font-semibold text-slate-700 dark:text-slate-100">
          Columns visibility
        </span>
        <button
          type="button"
          onClick={handleReset}
          className="text-[11px] font-medium text-sky-600 hover:underline disabled:opacity-50"
        >
          Reset
        </button>
      </div>

      <div
        className="max-h-40 space-y-1 overflow-auto"
        role="list"
        aria-label="Toggle column visibility"
      >
        {columns.map((column) => {
          const value = columnVisibility[column.id];
          const isVisible = value !== false;
          const isOnlyVisible = isVisible && visibleCount <= 1;

          return (
            <div
              key={column.id}
              role="listitem"
              className="flex items-center justify-between rounded px-1 py-0.5 hover:bg-slate-50 dark:hover:bg-slate-800/70"
            >
              <label className="flex flex-1 cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={isVisible}
                  disabled={isOnlyVisible}
                  onChange={() => handleToggle(column.id)}
                  className="h-3 w-3 cursor-pointer"
                  aria-label={`Toggle visibility for ${column.label}`}
                />
                <span className="truncate text-[11px] text-slate-700 dark:text-slate-100">
                  {column.label}
                </span>
              </label>
              {isOnlyVisible && (
                <span className="ml-1 text-[10px] text-slate-400 dark:text-slate-500">
                  required
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
        At least one column must remain visible.
      </p>

      {/* ORDERING */}
      <ColumnOrderingPanel />
    </div>
  );
};
