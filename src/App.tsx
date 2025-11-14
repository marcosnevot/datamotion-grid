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
          <p className="mt-1 text-sm text-slate-400">
            Phase 1 focuses on the application shell and a simple static data
            grid. No filters, sorting or virtualization are implemented yet.
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
