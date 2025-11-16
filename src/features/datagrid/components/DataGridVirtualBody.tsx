// src/features/datagrid/components/DataGridVirtualBody.tsx

import type { RefObject } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Table } from '@tanstack/react-table';
import type { DatasetStatus } from '../../dataset/types/datasetTypes';
import { DEFAULT_ROW_HEIGHT, VIRTUALIZED_OVERSCAN } from '../config/gridSettings';
import type { GridRow } from '../types/gridTypes';

type DataGridVirtualBodyProps = {
  table: Table<GridRow>;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
};


function getStatusClasses(status: DatasetStatus): string {
  switch (status) {
    case 'Active':
      return 'bg-emerald-950 text-emerald-300 border border-emerald-500/30';
    case 'Pending':
      return 'bg-amber-950 text-amber-300 border border-amber-500/30';
    case 'Inactive':
    default:
      return 'bg-slate-900 text-slate-300 border border-slate-600/40';
  }
}

interface StatusBadgeProps {
  status: DatasetStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClasses(
        status,
      )}`}
    >
      {status}
    </span>
  );
}

export function DataGridVirtualBody({
  table,
  scrollContainerRef,
}: DataGridVirtualBodyProps) {
  const rowModel = table.getRowModel();
  const rows = rowModel.rows;
  const visibleColumnCount = table.getVisibleLeafColumns().length;

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => DEFAULT_ROW_HEIGHT,
    overscan: VIRTUALIZED_OVERSCAN,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const paddingTop =
    virtualItems.length > 0 ? virtualItems[0].start : 0;

  const paddingBottom =
    virtualItems.length > 0
      ? totalSize - virtualItems[virtualItems.length - 1].end
      : 0;

  return (
    <tbody>
      {paddingTop > 0 && (
        <tr aria-hidden="true">
          <td
            className="p-0"
            style={{ height: `${paddingTop}px` }}
            colSpan={visibleColumnCount}
          />
        </tr>
      )}

      {virtualItems.map((virtualRow) => {
        const row = rows[virtualRow.index];
        const original = row.original;

        return (
          <tr
            key={row.id}
            className="border-b border-slate-800/70 odd:bg-slate-950/40 even:bg-slate-900/40 hover:bg-slate-800/50"
            data-index={virtualRow.index}
          >
            <td className="px-4 py-2 font-mono text-xs text-slate-300">
              {original.id}
            </td>
            <td className="max-w-[200px] px-4 py-2 text-slate-50">
              <span className="line-clamp-1">{original.name}</span>
            </td>
            <td className="max-w-[260px] px-4 py-2 text-slate-300">
              <span className="line-clamp-1">{original.email}</span>
            </td>
            <td className="px-4 py-2">
              <StatusBadge status={original.status} />
            </td>
            <td className="px-4 py-2 text-slate-200">
              {original.country}
            </td>
            <td className="px-4 py-2 text-slate-300">
              {original.createdAt.slice(0, 10)}
            </td>
            <td className="px-4 py-2 text-right font-mono text-xs text-slate-100">
              {original.amount.toFixed(2)}
            </td>
          </tr>
        );
      })}

      {paddingBottom > 0 && (
        <tr aria-hidden="true">
          <td
            className="p-0"
            style={{ height: `${paddingBottom}px` }}
            colSpan={visibleColumnCount}
          />
        </tr>
      )}
    </tbody>
  );
}
