import { AppShell } from "./components/layout/AppShell";
import { AppHeader } from "./components/layout/AppHeader";
import { AppFooter } from "./components/layout/AppFooter";
import { SidePanel } from "./components/layout/SidePanel";
import { DataGrid } from "./features/datagrid/components/DataGrid";

function App() {
  return (
    <AppShell
      header={<AppHeader />}
      footer={<AppFooter />}
      sidePanel={<SidePanel />}
    >
      <section className="flex h-full flex-col gap-4">
        <header>
          <h1 className="text-lg font-semibold tracking-tight">
            Data grid playground
          </h1>
          <p className="text-sm text-slate-400">
            Phase 2 focuses on wiring a massive mock dataset, integrating TanStack Table
            and adding a virtualized body for high-performance scrolling. Filters,
            sorting and advanced interactions will arrive in later phases.
          </p>
        </header>

        <div className="flex-1">
          <DataGrid />
        </div>
      </section>
    </AppShell>
  );
}

export default App;
