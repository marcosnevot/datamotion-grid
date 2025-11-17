# DataMotion Grid – Architecture (Draft)

This document is a placeholder for architecture notes to be expanded in later phases.

- Frontend SPA built with React + TypeScript + Vite.
- Virtualized data grid focused on performance and UX.
- Feature-based folder structure under `src/` for datagrid, theme and dataset.

---

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

---

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

---

## Phase 3 – Grid interactions (sorting, filtering, search)

### Overview

Phase 3 turns the previously read-only virtualized grid into an interactive analytical grid:

- Column sorting on all key columns (`id`, `name`, `email`, `status`, `country`, `createdAt`, `amount`).
- Per-column filters (text, select, numeric, date).
- Global search across multiple columns.
- A centralized grid state store using Zustand to keep sorting, filters and global search in sync.

The virtualization layer from Phase 2 remains unchanged and continues to be responsible for rendering performance.

### Data flow with grid store

High-level pipeline:

- Dataset layer:
  - `features/dataset/generator/generateMockDataset.ts`
  - `features/dataset/hooks/useDataset.ts`
- Grid orchestration:
  - `features/datagrid/hooks/useDataGrid.ts`
- Grid state:
  - `features/datagrid/store/gridStore.ts`
- Table model (TanStack Table):
  - Sorting, filtering and global search powered by `@tanstack/react-table`.
- Presentation:
  - `DataGridToolbar` (global search + clear filters)
  - `DataGridHeader` (sorting + per-column filters)
  - `DataGridStatsBar` (visible vs total rows + filters/sorting counts)
  - `DataGridVirtualBody` (virtualized rows)

### Textual diagram

```text
generateMockDataset → useDataset → useDataGrid
  → gridStore (sorting, columnFilters, globalFilter)
  → useReactTable (TanStack Table: sorting + filtering)
  → DataGridToolbar / DataGridHeader / DataGridStatsBar
  → DataGridVirtualBody (TanStack Virtual rows)
```

### TanStack Table and gridStore responsibilities

- `gridStore` (Zustand):
  - Single source of truth for:
    - `sorting` (SortingState)
    - `columnFilters` (ColumnFiltersState)
    - `globalFilter` (string)
  - Exposes actions:
    - `setSorting`, `setColumnFilters`, `setGlobalFilter`
    - `resetFilters()` to clear filters and global search.
    - `resetSorting()` to clear sorting state.

- `useDataGrid`:
  - Reads state from `gridStore`.
  - Configures `useReactTable` with:
    - `state: { sorting, columnFilters, globalFilter }`
    - `onSortingChange`, `onColumnFiltersChange`, `onGlobalFilterChange`
    - `getSortedRowModel` and `getFilteredRowModel`.
  - Keeps the virtualized body independent of how data is filtered or sorted.

This separation allows the grid to grow with more interactions (column visibility, presets, row selection, etc.) without touching dataset or virtualization layers.

---

## Phase 4 – Motion architecture (Framer Motion integration)

### Motion stack and configuration

Phase 4 introduces a thin motion layer on top of the existing grid architecture, without changing the data pipeline:

- **Framer Motion** is added as the animation library.
- A global `MotionConfig` wrapper is applied in `App.tsx`:
  - Reads `prefers-reduced-motion` via `src/hooks/usePrefersReducedMotion.ts`.
  - Uses `getDefaultMotionTransition(reducedMotion)` to configure default transitions.
- Motion tokens live under:
  - `src/features/datagrid/config/motionSettings.ts`
    - Duration tokens: `MOTION_DURATIONS` (`fast`, `medium`, `slow`).
    - Easing tokens: standard vs emphasized cubic-bezier curves.
    - Elevation offset: `MOTION_ELEVATION_TRANSLATE_Y` for row/card hover.
    - Helpers:
      - `createMotionTransition(speed, options)`
      - `getDefaultMotionTransition(reducedMotion)`

This keeps animation configuration centralized and reusable, similar to a design system for motion.

### Component-level responsibilities

The motion layer is applied only in presentation components; dataset, store and virtualization remain unchanged.

- **Layout shell**
  - `AppShell`:
    - Uses `motion.main` for the primary content.
    - Uses `motion.aside` for the optional `SidePanel`.
    - Responsible for the initial fade/slide-in of the main grid area and side panel.
  - `SidePanel`:
    - Uses `motion.div` for cards with a small hover elevation using `MOTION_ELEVATION_TRANSLATE_Y`.

- **Grid container**
  - `DataGrid`:
    - Wraps the main grid section in `motion.section` for a light entrance animation.
    - Does not alter the table structure (`<table>`, `<thead>`, `<tbody>` remain standard HTML).

- **Toolbar & stats**
  - `DataGridToolbar`:
    - Uses `motion.div` to animate toolbar entrance.
    - All filter/search logic still comes from `gridStore` and `useDebouncedValue`.
  - `DataGridStatsBar`:
    - Uses `motion.div` to animate state changes (showing X/Y rows, filters/sorting counts).

- **Header & sorting**
  - `DataGridHeader`:
    - Uses `motion.thead` for a subtle entrance animation.
    - Sort icons are rendered inside `motion.span` elements, reacting to `asc` / `desc` / `none` states.
    - Sorting logic remains in TanStack Table; motion is purely visual.

- **Virtualized body & rows**
  - `DataGridVirtualBody`:
    - Continues to own the `<tbody>` and virtual padding rows (`paddingTop` / `paddingBottom`).
    - Delegates visible row rendering to `DataGridRow`.
  - `DataGridRow`:
    - New component wrapping a single row in `motion.tr`.
    - Implements row hover elevation using `MOTION_ELEVATION_TRANSLATE_Y`.
    - Uses `row.original` from TanStack Table to render each cell.
  - `DataGridCell`:
    - New lightweight wrapper around `<td>` for future extensibility (e.g., focus states, selection styles).

### Separation of concerns

- **Unchanged layers**:
  - Dataset generation and loading (`features/dataset/`).
  - Grid orchestration (`useDataGrid` with TanStack Table).
  - Global grid state (`gridStore` with sorting, filters, global search).
  - Virtualization (`DataGridVirtualBody` with `useVirtualizer`).

- **Motion layer**:
  - Lives entirely in the layout and presentation components.
  - Shares configuration via `motionSettings.ts` and `MotionConfig`.
  - Respects `prefers-reduced-motion` globally, avoiding per-component ad-hoc checks.

### Updated textual diagram

```text
generateMockDataset → useDataset → useDataGrid
  → gridStore (sorting, columnFilters, globalFilter)
  → useReactTable (TanStack Table: sorting + filtering)
  → DataGridToolbar / DataGridHeader / DataGridStatsBar
  → DataGridVirtualBody → DataGridRow → DataGridCell
  → Motion layer:
      MotionConfig (App)
      motionSettings (tokens)
      motion.* wrappers in layout and grid components
```