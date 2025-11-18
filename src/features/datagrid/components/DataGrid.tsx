// src/features/datagrid/components/DataGrid.tsx
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDataGrid } from '../hooks/useDataGrid';
import { DataGridVirtualBody } from './DataGridVirtualBody';
import { DataGridHeader } from './DataGridHeader';
import { DataGridToolbar } from './DataGridToolbar';
import { DataGridStatsBar } from './DataGridStatsBar';
import { createMotionTransition } from '../config/motionSettings';
import type { SelectedRowInfo } from '../types/gridTypes';

const GRID_SECTION_TRANSITION = createMotionTransition('medium');

export interface DataGridProps {
  onSelectionChange?: (info: SelectedRowInfo) => void;
}

export function DataGrid({ onSelectionChange }: DataGridProps) {
  const { table, rowCount, isLoading, error, selectedRowInfo } = useDataGrid();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedRowInfo);
    }
  }, [onSelectionChange, selectedRowInfo]);

  return (
    <motion.section
      aria-label="Data grid"
      className="flex flex-col gap-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={GRID_SECTION_TRANSITION}
    >
      <header className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Virtualized analytics grid
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            High-density, client-generated dataset rendered with TanStack Table and
            TanStack Virtual. Designed to stay responsive with 5k–50k rows while
            keeping sorting, filters, global search, column configuration and row
            selection fully client-side.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
          {isLoading && (
            <span className="animate-pulse text-slate-700 dark:text-slate-300">
              Loading dataset…
            </span>
          )}
          {!isLoading && (
            <span>
              <span className="font-mono text-slate-900 dark:text-slate-100">
                {rowCount.toLocaleString('en-US')}
              </span>{' '}
              rows
            </span>
          )}
        </div>
      </header>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        {error ? (
          <div className="flex h-full items-center justify-center bg-red-50 px-4 py-8 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
            Failed to load dataset: {error.message}
          </div>
        ) : (
          <>
            <DataGridToolbar />
            <DataGridStatsBar table={table} totalRowCount={rowCount} />

            <div
              ref={scrollContainerRef}
              className="max-h-[calc(100vh-300px)] overflow-auto"
            >
              <table className="min-w-full text-left text-sm" role="table">
                <DataGridHeader table={table} />
                <DataGridVirtualBody
                  table={table}
                  scrollContainerRef={scrollContainerRef}
                />
              </table>
            </div>
          </>
        )}
      </div>
    </motion.section>
  );
}

export default DataGrid;
