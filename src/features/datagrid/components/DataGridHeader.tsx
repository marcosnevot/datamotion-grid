// src/features/datagrid/components/DataGridHeader.tsx
import { motion } from 'framer-motion';
import type { Table, Column } from '@tanstack/react-table';
import type {
  GridRow,
  GridColumnMeta,
  GridColumnAlign,
} from '../types/gridTypes';
import { createMotionTransition } from '../config/motionSettings';

type DataGridHeaderProps = {
  table: Table<GridRow>;
};

const getAlignClass = (align?: GridColumnAlign): string => {
  if (align === 'right') return 'text-right';
  if (align === 'center') return 'text-center';
  return 'text-left';
};

const getJustifyClass = (alignClass: string): string => {
  if (alignClass === 'text-right') return 'justify-end';
  if (alignClass === 'text-center') return 'justify-center';
  return 'justify-start';
};

const renderFilterControl = (column: Column<GridRow, unknown>) => {
  if (!column.getCanFilter()) {
    return null;
  }

  const meta = column.columnDef.meta as GridColumnMeta | undefined;
  const filterType = meta?.filterType;
  const filterValue = column.getFilterValue() ?? '';

  const commonInputClasses =
    'mt-1 w-full rounded-md border border-slate-200 bg-white/60 px-2 py-1 text-xs outline-none transition focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900/70';

  if (filterType === 'select') {
    const value =
      typeof filterValue === 'string' ? filterValue : String(filterValue);
    const options = ['Active', 'Pending', 'Inactive'];

    return (
      <select
        className={commonInputClasses}
        value={value}
        onChange={(event) => {
          const next = event.target.value || undefined;
          column.setFilterValue(next);
        }}
      >
        <option value="">All</option>
        {options.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    );
  }

  if (filterType === 'number') {
    const value =
      typeof filterValue === 'number'
        ? String(filterValue)
        : (filterValue as string);

    return (
      <input
        type="number"
        className={commonInputClasses}
        value={value}
        placeholder="Min"
        onChange={(event) => {
          const next = event.target.value;
          column.setFilterValue(next === '' ? undefined : next);
        }}
      />
    );
  }

  if (filterType === 'date') {
    const value = filterValue as string;

    return (
      <input
        type="date"
        className={commonInputClasses}
        value={value}
        onChange={(event) => {
          const next = event.target.value;
          column.setFilterValue(next === '' ? undefined : next);
        }}
      />
    );
  }

  // default text filter
  const value = filterValue as string;

  return (
    <input
      type="text"
      className={commonInputClasses}
      value={value}
      placeholder="Filter..."
      onChange={(event) => {
        column.setFilterValue(event.target.value);
      }}
    />
  );
};

const HEADER_TRANSITION = createMotionTransition('fast');
const SORT_ICON_TRANSITION = createMotionTransition('fast');

export const DataGridHeader = ({ table }: DataGridHeaderProps) => {
  const headerGroups = table.getHeaderGroups();

  return (
    <motion.thead
      className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur dark:bg-slate-900/90"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={HEADER_TRANSITION}
    >
      {headerGroups.map((headerGroup) => (
        <tr
          key={headerGroup.id}
          className="border-b border-slate-200 text-xs dark:border-slate-800"
        >
          {headerGroup.headers.map((header) => {
            if (header.isPlaceholder) {
              return <th key={header.id} className="px-3 py-2" />;
            }

            const meta = header.column.columnDef.meta as GridColumnMeta | undefined;
            const alignClass = getAlignClass(meta?.align);
            const justifyClass = getJustifyClass(alignClass);
            const canSort = header.column.getCanSort();
            const sortedState = header.column.getIsSorted(); // false | 'asc' | 'desc'

            const ariaSort =
              sortedState === 'asc'
                ? 'ascending'
                : sortedState === 'desc'
                ? 'descending'
                : undefined;

            return (
              <th
                key={header.id}
                colSpan={header.colSpan}
                className={`px-3 py-2 align-top ${alignClass}`}
                aria-sort={ariaSort}
              >
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    disabled={!canSort}
                    onClick={
                      canSort ? header.column.getToggleSortingHandler() : undefined
                    }
                    className={`flex w-full items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 ${justifyClass} ${
                      canSort
                        ? 'cursor-pointer hover:text-slate-900 dark:hover:text-white'
                        : 'cursor-default'
                    }`}
                  >
                    <span>{header.column.columnDef.header as string}</span>
                    {canSort && (
                      <motion.span
                        className="text-[9px] opacity-80"
                        animate={
                          sortedState === 'asc'
                            ? { opacity: 1, y: -1 }
                            : sortedState === 'desc'
                            ? { opacity: 1, y: 1 }
                            : { opacity: 0.7, y: 0 }
                        }
                        transition={SORT_ICON_TRANSITION}
                      >
                        {sortedState === 'asc' && '▲'}
                        {sortedState === 'desc' && '▼'}
                        {!sortedState && '▽'}
                      </motion.span>
                    )}
                  </button>

                  {renderFilterControl(header.column)}
                </div>
              </th>
            );
          })}
        </tr>
      ))}
    </motion.thead>
  );
};
