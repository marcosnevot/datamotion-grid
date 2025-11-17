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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        {header}
      </header>

      <div className="flex flex-1 overflow-hidden">
        <motion.main
          className="flex-1 overflow-auto px-4 py-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={MAIN_TRANSITION}
        >
          {children}
        </motion.main>

        {sidePanel && (
          <motion.aside
            className="hidden xl:block w-80 border-l border-slate-800 bg-slate-950/80 backdrop-blur-md"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={SIDE_PANEL_TRANSITION}
          >
            {sidePanel}
          </motion.aside>
        )}
      </div>

      <footer className="border-t border-slate-800 bg-slate-950/80 backdrop-blur">
        {footer}
      </footer>
    </div>
  );
}
