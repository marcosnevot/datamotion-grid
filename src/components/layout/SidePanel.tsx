// src/components/layout/SidePanel.tsx
import { motion } from "framer-motion";
import {
  createMotionTransition,
  MOTION_ELEVATION_TRANSLATE_Y,
} from "../../features/datagrid/config/motionSettings";

const CARD_HOVER_TRANSITION = createMotionTransition("fast");

export function SidePanel() {
  return (
    <div className="h-full flex flex-col px-4 py-4 gap-4 text-sm text-slate-200">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Grid insight panel
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          This panel will host row details, aggregated stats and keyboard
          shortcuts in later phases.
        </p>
      </div>

      <motion.div
        className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2"
        whileHover={{
          y: MOTION_ELEVATION_TRANSLATE_Y,
          scale: 1.01,
        }}
        transition={CARD_HOVER_TRANSITION}
      >
        <h3 className="text-xs font-semibold text-slate-300">
          Selection summary (stub)
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          No rows selected. Row detail view and metrics will be implemented when
          selection logic lands.
        </p>
      </motion.div>

      <motion.div
        className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2"
        whileHover={{
          y: MOTION_ELEVATION_TRANSLATE_Y,
          scale: 1.01,
        }}
        transition={CARD_HOVER_TRANSITION}
      >
        <h3 className="text-xs font-semibold text-slate-300">
          Keyboard shortcuts (preview)
        </h3>
        <ul className="mt-1 space-y-1 text-xs text-slate-500">
          <li>
            <span className="font-mono text-slate-300">↑ / ↓</span>{" "}
            Navigate rows
          </li>
          <li>
            <span className="font-mono text-slate-300">F</span> Focus search
          </li>
          <li>
            <span className="font-mono text-slate-300">Shift + A</span> Toggle
            select all
          </li>
        </ul>
      </motion.div>
    </div>
  );
}
