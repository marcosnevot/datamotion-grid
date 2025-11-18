// src/App.tsx
import { useState } from "react";
import { MotionConfig } from "framer-motion";
import { AppShell } from "./components/layout/AppShell";
import { AppHeader } from "./components/layout/AppHeader";
import { AppFooter } from "./components/layout/AppFooter";
import { SidePanel } from "./components/layout/SidePanel";
import { DataGrid } from "./features/datagrid/components/DataGrid";
import { getDefaultMotionTransition } from "./features/datagrid/config/motionSettings";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";
import type { SelectedRowInfo } from "./features/datagrid/types/gridTypes";

const initialSelectedRowInfo: SelectedRowInfo = {
  selectedRow: null,
  selectedCount: 0,
  selectedIds: [],
  selectedRows: [],
};

function App() {
  const reducedMotion = usePrefersReducedMotion();
  const [selectedRowInfo, setSelectedRowInfo] = useState<SelectedRowInfo>(
    initialSelectedRowInfo
  );

  return (
    <MotionConfig
      reducedMotion={reducedMotion ? "always" : "never"}
      transition={getDefaultMotionTransition(reducedMotion)}
    >
      <AppShell
        header={<AppHeader />}
        footer={<AppFooter />}
        sidePanel={<SidePanel selectedRowInfo={selectedRowInfo} />}
      >
        <section className="flex h-full flex-col gap-4">
          <header>
            <h1 className="text-lg font-semibold tracking-tight">
              Data grid playground
            </h1>
          </header>

          <div className="flex-1">
            <DataGrid onSelectionChange={setSelectedRowInfo} />
          </div>
        </section>
      </AppShell>
    </MotionConfig>
  );
}

export default App;
