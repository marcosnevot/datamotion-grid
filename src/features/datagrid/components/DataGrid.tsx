// src/features/datagrid/components/DataGrid.tsx

import { useRef } from 'react';
import { useDataGrid } from '../hooks/useDataGrid';
import { DataGridVirtualBody } from './DataGridVirtualBody';
import { DataGridHeader } from './DataGridHeader';
import { DataGridToolbar } from './DataGridToolbar';
import { DataGridStatsBar } from './DataGridStatsBar';

export function DataGrid() {
  const { table, rowCount, isLoading, error } = useDataGrid();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <section
      aria-label="Data grid"
      className="flex flex-col gap-4"
    >
      <header className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">
            Massive dataset (Phase 3 – sorting & filtering)
          </h2>
          <p className="text-xs text-slate-400">
            Column sorting, per-column filters and global search on top of the
            virtualized body for large datasets.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          {isLoading && (
            <span className="animate-pulse text-slate-300">
              Loading dataset…
            </span>
          )}
          {!isLoading && (
            <span>
              <span className="font-mono text-slate-100">
                {rowCount.toLocaleString('en-US')}
              </span>{' '}
              rows
            </span>
          )}
        </div>
      </header>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-sm">
        {error ? (
          <div className="flex h-full items-center justify-center px-4 py-8 text-sm text-red-300">
            Failed to load dataset: {error.message}
          </div>
        ) : (
          <>
            <DataGridToolbar />
            <DataGridStatsBar table={table} totalRowCount={rowCount} />

            <div
              ref={scrollContainerRef}
              className="max-h-[calc(100vh-260px)] overflow-auto"
            >
              <table
                className="min-w-full text-left text-sm"
                role="table"
              >
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
    </section>
  );
}

export default DataGrid;
