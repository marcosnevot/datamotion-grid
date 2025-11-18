# DataMotion Grid – Architecture

This document describes the final architecture of the **DataMotion Grid** frontend at the end of
Phase 6. It focuses on how the application is structured, how data flows through the grid, and
how performance, motion and testing concerns are integrated.

The goal is to provide a high‑level mental model for anyone reading the repository on GitHub,
without requiring them to know the phase‑by‑phase history of the project.


## 1. High‑level overview

**DataMotion Grid** is a single‑page application that showcases a high‑performance, virtualized
data grid with rich interactions and subtle motion.

Key characteristics:

- **Frontend‑only SPA** built with **React**, **TypeScript** and **Vite**.
- **Virtualized grid** capable of handling **5k–50k rows** with smooth scrolling.
- Rich interactions:
  - Column sorting, per‑column filters and global search.
  - Column visibility and column ordering.
  - Row selection with a live side detail panel.
  - Saved views (predefined grid configurations).
- Lightweight **global state** using **Zustand**, scoped to grid and theme concerns.
- **TanStack Table** + **TanStack Virtual** as the core table and virtualization engine.
- **Framer Motion** for motion design that respects `prefers-reduced-motion`.
- **Tailwind CSS** for utility‑first styling and light/dark theme support.
- A small but representative **test pyramid** (unit, component, E2E) using Vitest,
  Testing Library and Playwright.


## 2. Tech stack and directory layout

Core stack:

- **React 18** + **TypeScript** + **Vite** (SPA scaffold and DX).
- **@tanstack/react-table** (table modelling, sorting, filtering, column visibility/order).
- **@tanstack/react-virtual** (row virtualization).
- **Zustand** (global state for grid and theme).
- **Tailwind CSS** (layout, typography, light/dark modes).
- **Framer Motion** (layout and interaction animations).
- **Vitest**, **@testing-library/react**, **Playwright** (tests).

The source code follows a **feature‑oriented structure** under `src/`:

```text
src/
  App.tsx
  main.tsx

  assets/
    react.svg

  components/
    common/
    layout/
      AppFooter.tsx
      AppHeader.tsx
      AppShell.tsx
      SidePanel.tsx

  features/
    datagrid/
      components/
        ColumnOrderingPanel.tsx
        ColumnVisibilityPanel.tsx
        DataGrid.tsx
        DataGridCell.tsx
        DataGridHeader.tsx
        DataGridRow.tsx
        DataGridStatsBar.tsx
        DataGridToolbar.tsx
        DataGridVirtualBody.tsx
        RowDetailPanel.tsx

      config/
        columnsDefinition.ts
        gridSettings.ts
        motionSettings.ts
        viewsConfig.ts

      hooks/
        useDataGrid.ts
        useGridPersistence.ts

      store/
        gridStore.ts

      types/
        gridTypes.ts

      utils/
        filterUtils.ts
        sortUtils.ts
        virtualizationUtils.ts

    dataset/
      generator/
        generateMockDataset.ts
        mockDataConfig.ts

      hooks/
        useDataset.ts

      types/
        datasetTypes.ts

    theme/
      components/
        ThemeToggle.tsx

      hooks/
        useTheme.ts

      store/
        themeStore.ts

  hooks/
    useDebouncedValue.ts
    usePrefersReducedMotion.ts

  mocks/

  routes/

  styles/
    globals.css
    index.css

  tests/
    setupTests.ts

    component/
      App.test.tsx
      ColumnOrderingPanel.test.tsx
      ColumnVisibilityPanel.test.tsx
      DataGrid.test.tsx
      DataGridStatsBar.test.tsx
      DataGridToolbar.test.tsx
      RowDetailPanel.test.tsx
      SidePanel.test.tsx

    e2e/
      basic-flow.e2e.ts

    unit/
      filterUtils.test.ts
      generateMockDataset.test.ts
      gridStore.test.ts
      keyboard.test.ts
      performance.test.ts
      sortUtils.test.ts
      viewsConfig.test.ts
      virtualizationUtils.test.ts

  types/

  utils/
    keyboard.ts
    performance.ts
```

The rest of this document focuses on how these pieces work together.


## 3. Core data and grid pipeline

At the heart of DataMotion Grid is a simple, layered data pipeline:

```text
generateMockDataset → useDataset → useDataGrid
  → gridStore (sorting, filters, global search, columns, selection, views)
  → useReactTable (TanStack Table)
  → DataGrid* components
  → DataGridVirtualBody + DataGridRow + DataGridCell (TanStack Virtual)
```

The pipeline is intentionally split into three concerns:

1. **Dataset layer (`features/dataset/`)**
2. **Grid orchestration hook (`useDataGrid`)**
3. **Presentation and virtualization (`features/datagrid/components/`)**


### 3.1 Dataset layer

The dataset layer is responsible for producing an in‑memory dataset that behaves like a
realistic backend response, but without any network calls.

- `generateMockDataset(config)`
  - Generates deterministic rows for a given `rowCount` and `seed`.
  - Produces a typed `DatasetRow` structure (ID, name, email, status, country, dates,
    numeric amount, etc.).
- `useDataset()`
  - React hook that:
    - Generates the dataset on mount.
    - Exposes `{ rows, rowCount, isLoading, error }`.
    - Optionally measures generation time using the `measureSync` helper.
  - Contains **no knowledge of UI**, TanStack Table or virtualization.

This layer is the **single source of truth for rows** and can be replaced by a real API
without affecting the rest of the architecture.


### 3.2 Grid orchestration (`useDataGrid`)

`useDataGrid` lives under `features/datagrid/hooks/useDataGrid.ts` and acts as the
coordinator between:

- The **dataset** (`useDataset`).
- The **grid state store** (`gridStore`).
- The **table model** (`useReactTable`).

Responsibilities:

- Call `useDataset()` and feed the resulting `rows` into `useReactTable`.
- Read current grid state from `gridStore`:
  - Sorting and column filters.
  - Global search.
  - Column visibility and column order.
  - Row selection.
  - Views and active view.
- Configure **TanStack Table** with that state:
  - `state: { sorting, columnFilters, globalFilter, columnVisibility, columnOrder, rowSelection }`
  - `onSortingChange`, `onColumnFiltersChange`, `onGlobalFilterChange`.
  - `onColumnVisibilityChange`, `onColumnOrderChange`, `onRowSelectionChange`.
  - `getSortedRowModel`, `getFilteredRowModel`.
- Derive and expose convenient values for components:
  - `table` (TanStack Table instance).
  - `rowCount`, `visibleRowCount`.
  - Selection summary (e.g. selected row, count, aggregates).
  - Loading / error information from `useDataset`.

`useDataGrid` **does not render anything**; it only wires together data, state and table
behaviour.


### 3.3 Presentation and virtualization

Presentation components consume `useDataGrid` and focus purely on layout and interaction.

Key components:

- `DataGrid`
  - High‑level container for the grid area.
  - Composes:
    - `DataGridToolbar`
    - `DataGridHeader`
    - `DataGridStatsBar`
    - Scroll container with `DataGridVirtualBody`.
- `DataGridToolbar`
  - Global search input, “clear filters” action and entry points to configuration panels
    (column visibility, column ordering, views).
- `DataGridHeader`
  - Renders column headers backed by TanStack Table.
  - Handles sort toggling and per‑column filters.
- `DataGridStatsBar`
  - Displays basic stats:
    - Total vs visible rows.
    - Active filters and sorting count.
  - Receives derived state from `useDataGrid` / `gridStore`.
- `DataGridVirtualBody`
  - Implements the `<tbody>` using **TanStack Virtual**.
  - Only renders the visible rows plus overscan, plus padding rows for the non‑visible
    portion.
  - Delegates actual row rendering to `DataGridRow`.
- `DataGridRow`
  - Renders a single logical row, using `row.getVisibleCells()` from TanStack Table.
  - Wraps the `<tr>` element in Framer Motion.
  - Applies visual feedback for hover and selection.
- `DataGridCell`
  - Lightweight wrapper around `<td>` used for consistent styling and future extensibility.

This separation keeps **business‑like logic** in hooks and the store, and **rendering**
concerns in components.


## 4. Global grid state (Zustand)

The global grid state lives in `features/datagrid/store/gridStore.ts` and is implemented
with **Zustand**. This store is the single source of truth for all interactive grid
behaviour.

Main slices:

- **Sorting and filtering**
  - `sorting: SortingState`
  - `columnFilters: ColumnFiltersState`
  - `globalFilter: string`
  - Actions: `setSorting`, `setColumnFilters`, `setGlobalFilter`, `resetSorting`,
    `resetFilters`.
- **Column configuration**
  - `columnVisibility: ColumnVisibilityState` (map `columnId → boolean`).
  - `columnOrder: ColumnOrder` (ordered array of column IDs).
  - Actions: `setColumnVisibility`, `toggleColumnVisibility`, `resetColumnVisibility`,
    `setColumnOrder`, `moveColumn`, `resetColumnOrder`.
- **Row selection**
  - `rowSelection: RowSelectionState` (aligned with TanStack Table).
  - Actions: `setRowSelection`, `clearRowSelection`.
- **Views (saved configurations)**
  - `views: GridView[]` (predefined views such as “Default”, “Active only”, etc.).
  - `activeViewId: GridViewId | null`.
  - Actions: `setViews`, `applyView` (and helpers to compute view‑derived state).
- **Persistence snapshot**
  - Lightweight snapshot of the configuration written to `localStorage`:
    - `columnVisibility`
    - `columnOrder`
    - `views`
    - `activeViewId`
  - Actions: `hydrateFromStorage`, `exportToStorage` (names may vary but follow this idea).

Design principles:

- The dataset layer remains **stateless** with respect to the grid.
- Presentation components only talk to `gridStore` indirectly, via `useDataGrid` helpers
  and selectors, instead of re‑implementing state logic.
- The persisted snapshot is **schema‑tolerant**:
  - If the stored state references columns that no longer exist, the grid falls back to
    defaults.
  - The dataset itself is never persisted.


## 5. Virtualization layer

The virtualization strategy is implemented via **TanStack Virtual** in
`DataGridVirtualBody` with minimal, well‑scoped utilities in
`features/datagrid/utils/virtualizationUtils.ts`.

Responsibilities of `DataGridVirtualBody`:

- Own the `<tbody>` element.
- Create a virtualizer instance configured with:
  - Total row count from the table model.
  - Estimated row height (via configuration in `gridSettings.ts` / `virtualizationUtils`).
  - Overscan settings.
- Render:
  - A **top padding row** representing non‑rendered rows above the viewport.
  - The actual visible rows as `DataGridRow` components.
  - A **bottom padding row** for rows below the viewport.

This approach ensures that the DOM only contains a small, fixed number of `<tr>` elements
even when the logical dataset contains tens of thousands of rows, keeping scrolling and
re‑render costs low.

Key properties:

- Virtualization is **independent** of sorting, filtering, selection or views.
  - It simply receives the current row model from TanStack Table.
- Row selection and configuration changes **do not** affect the number of mounted rows,
  only their visual representation.


## 6. Layout shell and side panel

The overall page layout is implemented via the layout components under
`src/components/layout/`:

- `AppShell`
  - Main layout container.
  - Defines a vertical flex layout: `header` / `content` / `footer`.
  - Splits the content area into:
    - Main region: the data grid.
    - Optional right‑hand `SidePanel`.
  - Ensures only the content area scrolls; header and footer remain fixed.
- `AppHeader`
  - Top bar with project name (“DataMotion Grid”) and small status text.
  - Provides space for global controls, such as `ThemeToggle` or external links.
- `AppFooter`
  - Bottom bar with stack information and a compact performance/FPS panel placeholder.
  - Non‑intrusive but always visible.
- `SidePanel`
  - Right‑hand panel that hosts contextual information:
    - `RowDetailPanel` (detail of selected rows).
    - Potential aggregated stats/insights.
    - Helper content such as keyboard shortcuts.

### 6.1 Row detail panel

`RowDetailPanel` turns raw row selection into an analytical view:

- **No selection (0 rows)**:
  - Explicit empty state with guidance (“Click a row to see details here”).  
- **Single selection (1 row)**:
  - Shows key fields (ID, name, email, status, country, created date, amount).
  - Uses formatted output:
    - `amount` formatted as a fixed decimal / currency‑like string.
    - `status` rendered as a badge, consistent with the main grid.
- **Multiple selection (N > 1)**:
  - Displays “N rows selected” and summary aggregates:
    - Sum of `amount` over selected rows.
    - Optional mini breakdown by `status` (e.g. how many active vs inactive).

The side panel is fed by `gridStore.rowSelection` and selection selectors exposed by
`useDataGrid`, without touching dataset or virtualization internals.


## 7. Theme system

The theme system is intentionally small and focused:

- **Store**: `features/theme/store/themeStore.ts`
  - Holds current theme: `"light" | "dark" | "system"`.
  - Persists the user preference (e.g. in `localStorage` under a fixed key).
  - Provides actions: `setTheme`, `resetTheme`, etc.
- **Hook**: `features/theme/hooks/useTheme.ts`
  - Bridges the store with the DOM:
    - Applies/removes Tailwind’s `dark` class on `<html>` or `<body>`.
    - Reads `prefers-color-scheme` when the theme is `"system"`.
- **UI component**: `ThemeToggle`
  - Small control placed in `AppHeader`.
  - Allows switching between light, dark and system themes with a minimal UI.

Styling is done via **Tailwind CSS**:

- Global styles in `src/styles/index.css` / `globals.css`.
- Tailwind classes applied directly in components.
- Dark mode driven by the `dark` class on the root element.


## 8. Motion architecture (Framer Motion)

Motion is treated as a **separate but integrated concern** that sits on top of the
existing architecture, without changing the data pipeline.

### 8.1 Motion configuration

Configuration lives in `features/datagrid/config/motionSettings.ts` and defines:

- **Duration tokens** (`MOTION_DURATIONS`):
  - `fast`, `medium`, `slow` for consistent timing.
- **Easing tokens**:
  - Standard and emphasized cubic‑bezier curves.
- **Elevation offsets**:
  - `MOTION_ELEVATION_TRANSLATE_Y` for small hover translations.
- Helper functions:
  - `createMotionTransition(speed, options)`.
  - `getDefaultMotionTransition(reducedMotion)`.

The entire app is wrapped in a **single `MotionConfig`** at the top level
(`App.tsx`), which:

- Reads `prefers-reduced-motion` via `usePrefersReducedMotion`.
- Adapts default transitions when reduced motion is requested.


### 8.2 Motion in layout and grid components

Motion is applied only in presentation components:

- **Layout shell**
  - `AppShell` uses `motion.main` for the main content area and `motion.aside` for the
    side panel, providing a subtle entrance animation.
  - `SidePanel` cards use motion hover effects (elevation + small translate‑Y).
- **Grid container**
  - `DataGrid` wraps its main section in `motion.section` for a light fade/slide‑in.
- **Toolbar and stats**
  - `DataGridToolbar` and `DataGridStatsBar` are wrapped with `motion.div` for
    smooth entrance and updates.
- **Header and rows**
  - `DataGridHeader` may use `motion.thead` and motion‑powered sort indicators.
  - `DataGridRow` wraps `<tr>` in `motion.tr` to apply hover elevation and selection
    emphasis.

The dataset layer, `useDataGrid` and `gridStore` are **motion‑agnostic** and require
no knowledge of Framer Motion.


## 9. Performance and diagnostics

Performance is approached with a mix of **architecture choices** and **lightweight
instrumentation**.

### 9.1 Architectural choices

- Use of **TanStack Virtual** to keep DOM size bounded.
- Minimal global state (Zustand) with derived values computed via small selectors.
- Data‑only dataset layer separated from UI.
- Simple composition in `DataGridRow` / `DataGridCell` with memoisation where it
  provides a clear benefit.

These choices make the grid fast enough for the target range (5k–50k rows) without
requiring aggressive micro‑optimisation.


### 9.2 Performance helper (`measureSync`)

The `measureSync` utility in `src/utils/performance.ts` provides basic timing metrics:

- Wraps a synchronous function, such as dataset generation.
- Uses `performance.now()` when available, falling back to `Date.now()` otherwise.
- Returns:
  - `result`: the wrapped function result.
  - `{ label, durationMs }`: a small measurement sample.
- Can optionally log via `console.debug`.

A flag in `gridSettings.ts` (for example `ENABLE_DEBUG_MEASURES`) controls whether
these debug measurements are active, keeping production behaviour clean.


### 9.3 FPS and perf panels

The footer includes a lightweight placeholder for FPS/performance readings. The
architecture is prepared to:

- Reuse `measureSync` or similar helpers to instrument hot paths.
- Surface aggregated metrics in a dedicated area, without coupling the grid rendering
to the measurement logic.


## 10. Testing architecture

The project maintains a small but representative **test pyramid**, with tests located
under `src/tests/`.

- **Unit tests** (`src/tests/unit/`)
  - Pure utilities:
    - `filterUtils`: per‑column filter logic.
    - `sortUtils`: sorting comparators.
    - `virtualizationUtils`: estimated sizes and helper functions.
    - `performance`: behaviour of `measureSync`.
    - `keyboard`: detection of keyboard shortcuts and key mapping.
  - Store:
    - `gridStore`: state transitions, view application, persistence snapshots.
- **Component tests** (`src/tests/component/`)
  - `DataGrid`: integrated behaviour with a small dataset (sorting, filtering, search,
    selection).
  - `DataGridToolbar`: search input, clear filters, opening configuration panels,
    views selector and keyboard shortcuts.
  - Configuration and detail components such as:
    - `ColumnVisibilityPanel`
    - `ColumnOrderingPanel`
    - `RowDetailPanel`
    - `SidePanel`
- **End‑to‑end tests** (`src/tests/e2e/`)
  - Playwright flows (for example `basic-flow.e2e.ts`) that:
    - Start the app via the Vite dev server.
    - Interact with the grid (search, filters, columns, selection).
    - Verify that:
      - The side panel reflects the selection.
      - Column configuration is persisted via `localStorage` across reloads.

This structure makes it easy to add new tests as the grid evolves, while keeping
responsibilities clear and avoiding overly complex Test setup.


## 11. Architecture evolution (historical view)

Although this document focuses on the final state, the architecture evolved
incrementally through the project phases:

- **Early phases (layout & static grid)**  
  - Build the `AppShell`, header, footer and side panel.
  - Implement a static, non‑virtualized HTML table to validate layout and UX.
- **Data pipeline and virtualization**  
  - Introduce `generateMockDataset` and `useDataset` as a reusable dataset layer.
  - Move to TanStack Table for table modelling.
  - Add `DataGridVirtualBody` with TanStack Virtual to support tens of thousands of rows.
- **Interactive grid (sorting, filters, search)**  
  - Create `gridStore` as a centralized store for sorting, filters and global search.
  - Wire `useDataGrid` to TanStack Table and presentation components such as
    `DataGridToolbar`, `DataGridHeader` and `DataGridStatsBar`.
- **Motion layer**  
  - Introduce Framer Motion with `MotionConfig` and motion tokens.
  - Apply motion only to layout and grid presentation components, respecting
    `prefers-reduced-motion`.
- **Advanced state: columns, selection, views**  
  - Extend `gridStore` with column visibility/order, row selection and views.
  - Implement `RowDetailPanel` in the side panel with aggregates based on selection.
  - Add local storage persistence for grid configuration.
- **Testing and performance slice**  
  - Stabilise the test pyramid (unit, component, E2E).
  - Add basic instrumentation via `measureSync` and performance flags.

The final result is an architecture that balances **clarity**, **performance** and
**extensibility**, and that is approachable for developers exploring the repository
from GitHub.
