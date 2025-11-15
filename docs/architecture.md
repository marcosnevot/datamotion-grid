# DataMotion Grid – Architecture (Draft)

This document is a placeholder for architecture notes to be expanded in later phases.

- Frontend SPA built with React + TypeScript + Vite.
- Virtualized data grid focused on performance and UX.
- Feature-based folder structure under `src/` for datagrid, theme and dataset.

## Layout shell (Phase 1)

The UI is structured around a simple application shell:

- **AppShell**  
  Main layout container. It is responsible for:
  - Defining a vertical flex layout (`header` / `content` / `footer`).
  - Splitting the content area into a main region (data grid) and an optional side panel.
  - Handling scrolling so that only the main content scrolls, while header and footer remain fixed.

- **AppHeader**  
  Top bar that shows the project branding ("DataMotion Grid") and a small status line for the current phase.  
  It also exposes space on the right-hand side for future global controls (theme toggle, links, etc.).

- **AppFooter**  
  Simple bottom bar with a small text summary of the current phase and stack.  
  It is intentionally minimal and non-interactive in Phase 1.

- **SidePanel**  
  Right-hand panel used as a placeholder in Phase 1.  
  In later phases it will host:
  - Row details and contextual information.
  - Aggregated statistics and metrics.
  - Keyboard shortcut help and possibly quick actions.

- **DataGrid (Phase 1)**  
  A basic, in-memory HTML table that lives under `src/features/datagrid/components/DataGrid.tsx`.  
  It renders a static dataset (~60 rows) with the following columns:
  - `ID`
  - `Name`
  - `Email`
  - `Status` (with a simple visual badge)

No TanStack Table or virtualization are used yet in this phase. The goal is to validate the layout shell and have a realistic but static grid that future phases will replace with a fully virtualized implementation.


## Phase 2 – Data flow and grid pipeline

This phase introduces the first "real" data pipeline for the grid, even though the data is still mocked on the client.

### High-level flow

1. **Dataset layer (`features/dataset/`)**
   - `generateMockDataset` produces an array of `DatasetRow`.
   - `useDataset` owns dataset loading state and error handling.
   - The dataset is treated as the single source of truth for the grid.

2. **Grid orchestration (`features/datagrid/hooks/useDataGrid.ts`)**
   - `useDataGrid` calls `useDataset` and feeds the resulting `rows` into TanStack Table.
   - The hook returns:
     - `table`: the TanStack Table instance for `GridRow`.
     - `rowCount`: convenience wrapper over `rows.length`.
     - `isLoading` and `error`: passed through from `useDataset`.

3. **Rendering (`features/datagrid/components/`)**
   - `DataGrid` renders:
     - The grid header (title, row count).
     - The table structure (`<table>` and `<thead>`).
     - The scroll container (`div` with `overflow-auto`).
   - `DataGridVirtualBody`:
     - Integrates `useVirtualizer`.
     - Renders only the visible rows plus overscan.
     - Is responsible for the `<tbody>` content.

### Responsibilities and boundaries

- The **dataset layer** has no knowledge of UI concerns (no React Table, no virtualization). It only knows how to produce and describe data.
- The **grid orchestration hook** (`useDataGrid`) is the bridge:
  - It hides the complexity of dataset acquisition from the components.
  - It is the only place where TanStack Table is initialized.
- The **components** (`DataGrid`, `DataGridVirtualBody`) focus on layout and rendering, not on data fetching or table configuration.

This separation makes it easier to:

- Swap the mock dataset with a real API in later phases.
- Add features like sorting, filtering or custom column visibility without touching the dataset layer.
- Write focused tests:
  - Unit tests for dataset generation and virtualization helpers.
  - Component tests for `DataGrid` and its integration behaviour.
