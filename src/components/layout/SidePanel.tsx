// src/components/layout/SidePanel.tsx
import { motion } from 'framer-motion';
import {
  createMotionTransition,
  MOTION_ELEVATION_TRANSLATE_Y,
} from '../../features/datagrid/config/motionSettings';
import type { SelectedRowInfo } from '../../features/datagrid/types/gridTypes';
import { RowDetailPanel } from '../../features/datagrid/components/RowDetailPanel';

const CARD_HOVER_TRANSITION = createMotionTransition('fast');

interface SidePanelProps {
  selectedRowInfo: SelectedRowInfo;
}

export function SidePanel({ selectedRowInfo }: SidePanelProps) {
  return (
    <div className="flex h-full flex-col gap-4 px-4 py-4 text-sm text-slate-800 dark:text-slate-200">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
          Grid insight panel
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
          Live row details and keyboard shortcuts for the virtualized data grid.
        </p>
      </div>

      {/* Row detail / selection summary */}
      <RowDetailPanel selectedRowInfo={selectedRowInfo} />

      {/* Keyboard shortcuts card */}
      <motion.div
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
        whileHover={{
          y: MOTION_ELEVATION_TRANSLATE_Y,
          scale: 1.01,
        }}
        transition={CARD_HOVER_TRANSITION}
      >
        <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-300">
          Keyboard shortcuts
        </h3>
        <ul className="mt-1 space-y-1 text-xs text-slate-600 dark:text-slate-500">
          <li>
            <span className="font-mono text-slate-800 dark:text-slate-300">
              F
            </span>{' '}
            Focus global search
          </li>
          <li>
            <span className="font-mono text-slate-800 dark:text-slate-300">
              Alt + C
            </span>{' '}
            Toggle column configuration panel
          </li>
          <li>
            <span className="font-mono text-slate-800 dark:text-slate-300">
              Alt + 1 / 2 / 3
            </span>{' '}
            Apply preset views (Default / Active only / High amount)
          </li>
        </ul>
        <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-500">
          Advanced keyboard navigation (arrow keys, range selection, bulk actions) is
          not implemented yet and may be added in future iterations.
        </p>
      </motion.div>
    </div>
  );
}
