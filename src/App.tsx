// src/App.tsx
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
        </header>

        <div className="flex-1">
          <DataGrid />
        </div>
      </section>
    </AppShell>
  );
}

export default App;
