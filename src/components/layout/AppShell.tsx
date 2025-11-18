// src/components/layout/AppShell.tsx
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { createMotionTransition } from "../../features/datagrid/config/motionSettings";

type AppShellProps = {
  header: ReactNode;
  footer: ReactNode;
  sidePanel?: ReactNode;
  children: ReactNode;
};

const MAIN_TRANSITION = createMotionTransition("medium");
const SIDE_PANEL_TRANSITION = createMotionTransition("medium", {
  emphasized: true,
});

export function AppShell({ header, footer, sidePanel, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        {header}
      </header>

      <div className="flex flex-1 overflow-hidden">
        <motion.main
          className="flex-1 overflow-auto bg-slate-50 px-4 py-4 dark:bg-slate-950"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={MAIN_TRANSITION}
        >
          {children}
        </motion.main>

        {sidePanel && (
          <motion.aside
            className="hidden w-80 border-l border-slate-200/70 bg-slate-50/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80 xl:block"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={SIDE_PANEL_TRANSITION}
          >
            {sidePanel}
          </motion.aside>
        )}
      </div>

      <footer className="border-t border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        {footer}
      </footer>
    </div>
  );
}
