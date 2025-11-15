// src/features/datagrid/components/DataGrid.tsx

import { useRef } from 'react';
import { flexRender } from '@tanstack/react-table';
import { useDataGrid } from '../hooks/useDataGrid';
import { DataGridVirtualBody } from './DataGridVirtualBody';

export function DataGrid() {
  const { table, rowCount, isLoading, error } = useDataGrid();
  const headerGroups = table.getHeaderGroups();

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  return (
    <section
      aria-label="Data grid"
      className="flex flex-col gap-4"
    >
      <header className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">
            Massive dataset (Phase 2 – virtualized body)
          </h2>
          <p className="text-xs text-slate-400">
            TanStack Table + TanStack Virtual rendering only visible rows for
            smooth scrolling with large datasets.
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
          <div
            ref={scrollContainerRef}
            className="max-h-[calc(100vh-260px)] overflow-auto"
          >
            <table
              className="min-w-full text-left text-sm"
              role="table"
            >
              <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur">
                {headerGroups.map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-400"
                  >
                    {headerGroup.headers.map((header) => {
                      if (header.isPlaceholder) {
                        return (
                          <th
                            key={header.id}
                            className="px-4 py-2 font-medium"
                          />
                        );
                      }

                      const meta = header.column.columnDef.meta;
                      const align = meta?.align ?? 'left';

                      const alignClass =
                        align === 'right'
                          ? 'text-right'
                          : align === 'center'
                          ? 'text-center'
                          : 'text-left';

                      return (
                        <th
                          key={header.id}
                          className={`px-4 py-2 font-medium ${alignClass}`}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>

              <DataGridVirtualBody
                table={table}
                scrollContainerRef={scrollContainerRef}
              />
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default DataGrid;
