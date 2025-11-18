// src/features/datagrid/components/DataGridVirtualBody.tsx
import type { RefObject } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Table } from '@tanstack/react-table';
import { DEFAULT_ROW_HEIGHT, VIRTUALIZED_OVERSCAN } from '../config/gridSettings';
import type { GridRow } from '../types/gridTypes';
import { DataGridRow } from './DataGridRow';

type DataGridVirtualBodyProps = {
  table: Table<GridRow>;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
};

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

  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;

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

        return (
          <DataGridRow
            key={row.id}
            row={row}
            table={table}
            virtualIndex={virtualRow.index}
          />
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
