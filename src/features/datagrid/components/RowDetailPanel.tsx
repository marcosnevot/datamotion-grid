// src/features/datagrid/components/RowDetailPanel.tsx
import { motion, AnimatePresence } from 'framer-motion';
import type { SelectedRowInfo } from '../types/gridTypes';
import type { DatasetStatus } from '../../dataset/types/datasetTypes';
import { createMotionTransition } from '../config/motionSettings';

const CARD_TRANSITION = createMotionTransition('fast');

interface RowDetailPanelProps {
  selectedRowInfo: SelectedRowInfo;
}

function getStatusClasses(status: DatasetStatus): string {
  switch (status) {
    case 'Active':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-500/40 dark:border-emerald-500/30';
    case 'Pending':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-500/40 dark:border-amber-500/30';
    case 'Inactive':
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300 border-slate-400/40 dark:border-slate-600/40';
  }
}

export const RowDetailPanel: React.FC<RowDetailPanelProps> = ({
  selectedRowInfo,
}) => {
  const { selectedRow, selectedCount, selectedRows } = selectedRowInfo;

  return (
    <motion.div
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
      transition={CARD_TRANSITION}
      layout
    >
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-300">
          Row detail
        </h3>
        {selectedCount > 0 && (
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
            {selectedCount} selected
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {selectedCount === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={CARD_TRANSITION}
            className="text-xs text-slate-600 dark:text-slate-500"
          >
            <p>No row selected.</p>
            <p className="mt-1">
              Click a row in the grid to inspect its details here.
            </p>
          </motion.div>
        )}

        {selectedCount === 1 && selectedRow && (
          <motion.div
            key="single"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={CARD_TRANSITION}
            className="space-y-2 text-xs text-slate-700 dark:text-slate-300"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                {selectedRow.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                ID {selectedRow.id} · {selectedRow.country}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Status
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${getStatusClasses(
                    selectedRow.status as DatasetStatus,
                  )}`}
                >
                  {selectedRow.status}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Email
                </span>
                <a
                  href={`mailto:${selectedRow.email}`}
                  className="max-w-[180px] truncate text-[11px] text-sky-600 hover:underline dark:text-sky-300"
                >
                  {selectedRow.email}
                </a>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Created at
                </span>
                <span className="font-mono text-[11px] text-slate-700 dark:text-slate-200">
                  {selectedRow.createdAt.slice(0, 10)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Amount
                </span>
                <span className="font-mono text-[11px] text-slate-900 dark:text-slate-50">
                  {selectedRow.amount.toFixed(2)}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {selectedCount > 1 && (
          <motion.div
            key="multi"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={CARD_TRANSITION}
            className="space-y-2 text-xs text-slate-700 dark:text-slate-300"
          >
            <p>
              <span className="font-semibold">{selectedCount}</span> rows
              selected.
            </p>

            {selectedRows.length > 0 && (
              <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                <p>
                  First selected:{' '}
                  <span className="text-slate-900 dark:text-slate-100">
                    {selectedRows[0].name}
                  </span>{' '}
                  · {selectedRows[0].country}
                </p>
                <p>
                  Example email:{' '}
                  <span className="text-slate-900 dark:text-slate-100">
                    {selectedRows[0].email}
                  </span>
                </p>
              </div>
            )}

            <p className="text-[11px] text-slate-500 dark:text-slate-500">
              Aggregated metrics (amount ranges, status distribution, etc.)
              will be expanded in later phases.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
