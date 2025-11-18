// src/features/datagrid/components/DataGridStatsBar.tsx
import { motion } from 'framer-motion';
import type { Table, TableState } from '@tanstack/react-table';
import type { GridRow } from '../types/gridTypes';
import { createMotionTransition } from '../config/motionSettings';

type DataGridStatsBarProps = {
  table: Table<GridRow>;
  totalRowCount: number;
};

const STATS_BAR_TRANSITION = createMotionTransition('fast');

export const DataGridStatsBar: React.FC<DataGridStatsBarProps> = ({
  table,
  totalRowCount,
}) => {
  const rowModel = table.getRowModel();
  const state = table.getState() as TableState;

  const filteredRowCount = rowModel.rows.length;
  const columnFilters = state.columnFilters ?? [];
  const globalFilter =
    typeof state.globalFilter === 'string' ? state.globalFilter : '';
  const sorting = state.sorting ?? [];

  const filterCount =
    columnFilters.length + (globalFilter.trim().length > 0 ? 1 : 0);

  const hasFilters = filterCount > 0;
  const hasSorting = Array.isArray(sorting) && sorting.length > 0;

  const mainLabel =
    filteredRowCount === totalRowCount
      ? `Showing ${totalRowCount.toLocaleString('en-US')} rows`
      : `Showing ${filteredRowCount.toLocaleString(
          'en-US',
        )} of ${totalRowCount.toLocaleString('en-US')} rows`;

  const filtersLabel = hasFilters ? `Filters: ${filterCount}` : 'Filters: none';
  const sortingLabel = hasSorting
    ? `Sorting: ${sorting.length} column${sorting.length > 1 ? 's' : ''}`
    : 'Sorting: none';

  return (
    <motion.div
      role="status"
      aria-live="polite"
      className="mb-2 border-b border-slate-200 bg-slate-50/80 px-3 py-2 text-[11px] text-slate-600 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-300 sm:flex sm:items-center sm:justify-between"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={STATS_BAR_TRANSITION}
    >
      <div className="font-medium text-slate-700 dark:text-slate-200">
        {mainLabel}
      </div>
      <div className="mt-1 flex flex-wrap gap-3 sm:mt-0">
        <span className="text-slate-500 dark:text-slate-400">
          {filtersLabel}
        </span>
        <span className="text-slate-500 dark:text-slate-400">
          {sortingLabel}
        </span>
      </div>
    </motion.div>
  );
};
