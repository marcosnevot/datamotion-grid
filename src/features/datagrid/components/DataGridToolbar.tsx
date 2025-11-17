// src/features/datagrid/components/DataGridToolbar.tsx
import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGridStore } from '../store/gridStore';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { createMotionTransition } from '../config/motionSettings';

const TOOLBAR_TRANSITION = createMotionTransition('fast');

export const DataGridToolbar: React.FC = () => {
  const globalFilter = useGridStore((state) => state.globalFilter);
  const setGlobalFilter = useGridStore((state) => state.setGlobalFilter);
  const resetFilters = useGridStore((state) => state.resetFilters);
  const hasColumnFilters = useGridStore(
    (state) => state.columnFilters.length > 0,
  );

  const [searchText, setSearchText] = useState(globalFilter ?? '');

  const debouncedSearch = useDebouncedValue(searchText, 300);

  useEffect(() => {
    setGlobalFilter(debouncedSearch);
  }, [debouncedSearch, setGlobalFilter]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const handleClearFilters = () => {
    resetFilters();
    setSearchText('');
  };

  const hasActiveSearch = searchText.trim().length > 0;
  const isClearDisabled = !hasActiveSearch && !hasColumnFilters;

  return (
    <motion.div
      className="mb-2 border-b border-slate-200 pb-2 text-xs dark:border-slate-800"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={TOOLBAR_TRANSITION}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <input
            type="text"
            value={searchText}
            onChange={handleSearchChange}
            placeholder="Search in name, email, country..."
            aria-label="Search in name, email, country"
            className="w-full rounded-md border border-slate-200 bg-white/70 px-2 py-1 text-xs outline-none transition focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900/70"
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleClearFilters}
            disabled={isClearDisabled}
            className="inline-flex items-center rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Clear filters
          </button>
        </div>
      </div>
    </motion.div>
  );
};
