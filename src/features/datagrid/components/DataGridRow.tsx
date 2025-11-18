// src/features/datagrid/components/DataGridRow.tsx
import { motion, AnimatePresence } from 'framer-motion';
import type { Row, Table } from '@tanstack/react-table';
import type { MouseEvent } from 'react';
import type { DatasetStatus } from '../../dataset/types/datasetTypes';
import type { GridRow, GridColumnId } from '../types/gridTypes';
import {
  MOTION_ELEVATION_TRANSLATE_Y,
  createMotionTransition,
} from '../config/motionSettings';
import { DataGridCell } from './DataGridCell';

type DataGridRowProps = {
  row: Row<GridRow>;
  table: Table<GridRow>;
  virtualIndex: number;
};

const ROW_HOVER_TRANSITION = createMotionTransition('fast');

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

export function DataGridRow({ row, table, virtualIndex }: DataGridRowProps) {
  const original = row.original;
  const visibleCells = row.getVisibleCells();
  const isSelected = row.getIsSelected();

  const handleRowClick = (event: MouseEvent<HTMLTableRowElement>) => {
    // Ctrl / Cmd → toggle (multi-select futuro)
    if (event.ctrlKey || event.metaKey) {
      row.toggleSelected();
      return;
    }

    // Single-select
    if (isSelected) {
      table.setRowSelection({});
    } else {
      table.setRowSelection({
        [row.id]: true,
      });
    }
  };

  const rowClasses =
    [
      'border-b border-slate-800/70',
      'odd:bg-slate-950/40 even:bg-slate-900/40',
      'hover:bg-slate-800/50',
      'cursor-pointer',
      // Overrides when selected 
      'data-[selected=true]:bg-sky-950/60',
      'data-[selected=true]:hover:bg-sky-900/70',
    ].join(' ');

  return (
    <motion.tr
      className={rowClasses}
      data-index={virtualIndex}
      data-selected={isSelected ? 'true' : 'false'}
      whileHover={{
        y: MOTION_ELEVATION_TRANSLATE_Y,
      }}
      transition={ROW_HOVER_TRANSITION}
      onClick={handleRowClick}
    >
      <AnimatePresence initial={false}>
        {visibleCells.map((cell) => {
          const columnId = cell.column.id as GridColumnId;

          switch (columnId) {
            case 'id':
              return (
                <DataGridCell
                  key={cell.id}
                  className="px-4 py-2 font-mono text-xs text-slate-300"
                >
                  {original.id}
                </DataGridCell>
              );

            case 'name':
              return (
                <DataGridCell
                  key={cell.id}
                  className="max-w-[200px] px-4 py-2 text-slate-50"
                >
                  <span className="line-clamp-1">{original.name}</span>
                </DataGridCell>
              );

            case 'email':
              return (
                <DataGridCell
                  key={cell.id}
                  className="max-w-[260px] px-4 py-2 text-slate-300"
                >
                  <span className="line-clamp-1">{original.email}</span>
                </DataGridCell>
              );

            case 'status':
              return (
                <DataGridCell key={cell.id} className="px-4 py-2">
                  <StatusBadge status={original.status as DatasetStatus} />
                </DataGridCell>
              );

            case 'country':
              return (
                <DataGridCell
                  key={cell.id}
                  className="px-4 py-2 text-slate-200"
                >
                  {original.country}
                </DataGridCell>
              );

            case 'createdAt':
              return (
                <DataGridCell
                  key={cell.id}
                  className="px-4 py-2 text-slate-300"
                >
                  {original.createdAt.slice(0, 10)}
                </DataGridCell>
              );

            case 'amount':
              return (
                <DataGridCell
                  key={cell.id}
                  className="px-4 py-2 text-right font-mono text-xs text-slate-100"
                >
                  {original.amount.toFixed(2)}
                </DataGridCell>
              );

            default:
              return (
                <DataGridCell
                  key={cell.id}
                  className="px-4 py-2 text-slate-200"
                >
                  {String(cell.getValue() ?? '')}
                </DataGridCell>
              );
          }
        })}
      </AnimatePresence>
    </motion.tr>
  );
}
