// src/features/datagrid/components/DataGridRow.tsx
import { motion } from 'framer-motion';
import type { Row } from '@tanstack/react-table';
import type { DatasetStatus } from '../../dataset/types/datasetTypes';
import type { GridRow } from '../types/gridTypes';
import {
  MOTION_ELEVATION_TRANSLATE_Y,
  createMotionTransition,
} from '../config/motionSettings';
import { DataGridCell } from './DataGridCell';

type DataGridRowProps = {
  row: Row<GridRow>;
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

export function DataGridRow({ row, virtualIndex }: DataGridRowProps) {
  const original = row.original;

  return (
    <motion.tr
      className="border-b border-slate-800/70 odd:bg-slate-950/40 even:bg-slate-900/40 hover:bg-slate-800/50"
      data-index={virtualIndex}
      whileHover={{
        y: MOTION_ELEVATION_TRANSLATE_Y,
      }}
      transition={ROW_HOVER_TRANSITION}
    >
      <DataGridCell className="px-4 py-2 font-mono text-xs text-slate-300">
        {original.id}
      </DataGridCell>

      <DataGridCell className="max-w-[200px] px-4 py-2 text-slate-50">
        <span className="line-clamp-1">{original.name}</span>
      </DataGridCell>

      <DataGridCell className="max-w-[260px] px-4 py-2 text-slate-300">
        <span className="line-clamp-1">{original.email}</span>
      </DataGridCell>

      <DataGridCell className="px-4 py-2">
        <StatusBadge status={original.status as DatasetStatus} />
      </DataGridCell>

      <DataGridCell className="px-4 py-2 text-slate-200">
        {original.country}
      </DataGridCell>

      <DataGridCell className="px-4 py-2 text-slate-300">
        {original.createdAt.slice(0, 10)}
      </DataGridCell>

      <DataGridCell className="px-4 py-2 text-right font-mono text-xs text-slate-100">
        {original.amount.toFixed(2)}
      </DataGridCell>
    </motion.tr>
  );
}
