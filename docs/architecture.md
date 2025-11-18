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

---

## Phase 5 – Advanced grid state: columns, selection & views

In Phase 5 the grid state model is extended to support **column configuration**,  
**row selection** and **saved views**, while keeping the original data flow:

`dataset → useDataset → useDataGrid → TanStack Table + Virtual`

### 5.1. Extended grid state

`gridStore` now manages, in addition to `sorting`, `columnFilters` and `globalFilter`:

- **`columnVisibility: ColumnVisibilityState`**  
  Map `GridColumnId → boolean` (or `undefined`), where `false` means “column is hidden”.  
  When the state is empty or inconsistent, it is rebuilt from `gridColumns`
  (all columns visible by default).

- **`columnOrder: ColumnOrder`**  
  Ordered array of `GridColumnId` that defines the logical order of columns.  
  Default is `gridColumns.map(c => c.id)`.

- **`rowSelection: RowSelectionState`**  
  Aligned with TanStack Table (map `rowId → boolean`). Used to implement single row
  selection and to derive selection-based aggregates.

- **`views: GridView[]` and `activeViewId: GridViewId \| null`**  
  Collection of predefined views (for example: `default`, `activeOnly`, `highAmount`)
  plus the identifier of the currently applied view.

The store exposes dedicated actions for each slice:

- **Columns**
  - `setColumnVisibility`, `toggleColumnVisibility`, `resetColumnVisibility`
  - `setColumnOrder`, `moveColumn`, `resetColumnOrder`
- **Selection**
  - `setRowSelection`, `clearRowSelection`
- **Views**
  - `setViews`, `applyView`
  - (Ready for `createView` / `updateView` / `deleteView` in later phases)

### 5.2. `useDataGrid` as coordinator

`useDataGrid` remains the coordination layer between **dataset**, **gridStore** and
**TanStack Table**.

In Phase 5 it:

- Passes an extended state object into `useReactTable`:

  ```ts
  state: {
    sorting,
    columnFilters,
    globalFilter,
    columnVisibility,
    columnOrder,
    rowSelection,
  }
  ```

- Wires TanStack callbacks back into the store:

  ```ts
  onColumnVisibilityChange: setColumnVisibility;
  onColumnOrderChange: setColumnOrder;
  onRowSelectionChange: setRowSelection;
  ```

- Exposes derived selection information (e.g. `selectedRowInfo`) to presentation
  components such as `RowDetailPanel` and `DataGridStatsBar`.

This keeps **all advanced interaction logic** (visibility/order, selection, views) in
the same centralized state axis as sorting and filtering.

### 5.3. Local storage snapshot

Phase 5 introduces a lightweight persistence layer using `localStorage` to remember
grid preferences between sessions.

- Fixed key, for example: `datamotion-grid:gridState:v1`.
- Snapshot (JSON) includes:
  - `columnVisibility`
  - `columnOrder`
  - `views`
  - `activeViewId`

A small orchestrator (hook) is responsible for:

1. Reading the snapshot on app mount and calling a store action such as
   `hydrateFromStorage`.
2. Listening for relevant store changes and writing an updated snapshot back to
   `localStorage`.

Only **grid configuration** is persisted, never the dataset itself. This keeps the
payload small and tolerant to schema changes between versions.

If the snapshot is missing, corrupted or refers to columns that no longer exist,
the grid safely falls back to the default configuration.

### 5.4. Side panel & selection detail

The `SidePanel` evolves from a static placeholder into a live “insight panel” powered
by the selection model:

```text
gridStore.rowSelection
         │
         ▼
   useDataGrid / selectors
         │
         ▼
  RowDetailPanel → SidePanel
```

`RowDetailPanel` handles three main states:

1. **No selection (0 rows)**
   - Shows an explicit empty state message.
   - Brief guidance explaining that clicking a row will reveal details.

2. **Single selection (1 row)**
   - Displays key fields:
     - `id`, `name`, `email`, `status`, `country`, `createdAt`, `amount`.
   - Applies formatting:
     - `amount` as a fixed decimal / currency-like string.
     - `status` through a badge that reuses the existing visual language.

3. **Multiple selection (N > 1)**
   - Shows a summary label like “N rows selected”.
   - Computes basic aggregates on the selected subset:
     - Sum of `amount` for selected rows.
     - Optional small breakdown by `status` (how many active/inactive, etc.).

The side panel becomes an **analytical extension of the grid** without touching
virtualization internals or dataset loading logic.

### 5.5. Interaction with virtualized table

The Phase 5 architecture is designed to stay compatible with the existing
virtualization strategy:

- `rowSelection` is handled at the **logical row** level, while rendering still
  goes through `DataGridVirtualBody` and `DataGridRow`.
- Column visibility and ordering are driven by TanStack state, so the virtualizer
  only needs to know about the set of **visible** columns.
- Changes in configuration (visibility/order/views) affect column rendering but do not
  change how many rows are mounted in the DOM at any given time.

As a result, the grid continues to support 5k–50k rows with smooth scrolling while
adding significantly richer interaction and configuration capabilities in Phase 5.

---

## Phase 6 – Testing & performance architecture slice

Phase 6 did not change the high-level architecture (React + TanStack Table + TanStack Virtual + Zustand), but it reinforced how the pieces work together from a testing and performance point of view.

### Testing layers

The project now has a clear test pyramid:

- **Unit tests** (`src/tests/unit`):
  - Pure utilities:
    - `filterUtils`: per-column filter logic.
    - `sortUtils`: sorting comparators.
    - `virtualizationUtils`: abstractions for virtual items and estimated heights.
    - `performance`: behaviour of the `measureSync` helper and its fallbacks.
    - `keyboard`: detection of keyboard shortcuts and event handling.
  - Store:
    - `gridStore`: grid state transitions, view application, persistence snapshots.

- **Component tests** (`src/tests/component`):
  - `DataGrid`: end-to-end-ish tests at component level, using a small dataset.
  - `DataGridToolbar`: search, clear filters, columns panel, view selection, keyboard shortcuts.
  - `ColumnVisibilityPanel`, `ColumnOrderingPanel`, `RowDetailPanel`, `SidePanel`: focused tests for configuration panels and detail rendering.

- **End-to-end tests** (`src/tests/e2e`):
  - Playwright-based flows (e.g. `basic-flow.e2e.ts`) that:
    - Load the application via Vite’s dev server.
    - Interact with the grid (search, columns, selection).
    - Assert that the side panel updates and that column configuration persists via `localStorage`.

This structure makes it easy to evolve the grid without breaking behaviour, and provides a clear place to add new tests in future phases.

### Performance helpers and data pipeline

The data pipeline and performance helpers are intentionally simple:

- **Dataset generation**:
  - `generateMockDataset` produces deterministic rows for a given `rowCount` and `seed`.
  - `useDataset` encapsulates:
    - Generation.
    - Loading state.
    - Error handling.
    - Optional performance measurement via `measureSync`.

- **Performance helper**:
  - `measureSync` wraps a synchronous function and:
    - Uses `performance.now()` when available.
    - Falls back to `Date.now()` in non-browser or limited environments.
    - Returns both the `result` and a `{ label, durationMs }` sample.
    - Optionally logs via `console.debug` when `log: true`.

- **Configuration flag**:
  - `ENABLE_DEBUG_MEASURES` (in `gridSettings.ts`) is the single toggle to enable or disable local performance logging for dataset generation and, in future, other hot paths.

### Grid state & virtualization (final picture for Phase 6)

The grid continues to be orchestrated around `gridStore` and `useDataGrid`:

- `gridStore` is the single source of truth for:
  - Sorting and column filters.
  - Global filter.
  - Column visibility and order.
  - Row selection.
  - Views (predefined presets) and active view ID.
  - Light persistence snapshots (`exportToStorage`, `hydrateFromStorage`).

- `useDataGrid`:
  - Bridges `gridStore` to TanStack Table:
    - Passes a consolidated `state` object into `useReactTable`.
    - Wires all `on*Change` callbacks back to the store.
  - Computes derived values:
    - Normalised column visibility and order.
    - `SelectedRowInfo` (selected row, count, arrays) for the `SidePanel`.

- `DataGridVirtualBody`:
  - Uses TanStack Virtual (`useVirtualizer`) to render only a small slice of the total rows.
  - Delegates row rendering to `DataGridRow`, which in turn composes multiple `DataGridCell` components.

Phase 6 added light memoisation in the row and cell components to reduce unnecessary renders without changing the conceptual architecture.

### Why we avoided more invasive optimisations

Phase 6 explicitly avoided:

- Introducing additional state management layers (e.g. Redux) just for performance.
- Rewriting the virtualization logic from scratch.
- Micro-optimising every render path at the cost of readability.

The goal was to keep the architecture:

- **Understandable** for someone reading the code from GitHub.
- **Extensible** for future work (custom views, richer keyboard navigation).
- **Safe** in terms of regressions thanks to the reinforced tests and E2E coverage.
