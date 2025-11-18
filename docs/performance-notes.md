# DataMotion Grid – Performance Notes

## Scope of Phase 2

Phase 2 focuses on:

- Generating a large in-memory mock dataset (20k–50k rows).
- Wiring TanStack Table as the core table model.
- Adding a virtualized body using TanStack Virtual to keep scrolling smooth.
- Introducing a minimal performance measurement utility to track synchronous work.

No client-side sorting, filtering, global search or column configuration is implemented in this phase. Those concerns are intentionally deferred to later phases.

## Dataset generation

The mock dataset is defined under `src/features/dataset/`:

- `types/datasetTypes.ts` defines `DatasetRow` and related types.
- `generator/mockDataConfig.ts` contains constants (names, countries, ranges).
- `generator/generateMockDataset.ts` produces an in-memory array of `DatasetRow`:
  - Deterministic pseudo-random generator using a simple LCG.
  - Sequential `id` starting at `1`.
  - Bounded numeric field `amount` between `AMOUNT_MIN` and `AMOUNT_MAX`.
  - ISO-8601 `createdAt` timestamps derived from a fixed base date.

### Complexity

Dataset generation is O(N) in both time and memory, where N is `rowCount`.

- There is a single pass through the loop.
- No expensive operations like regex backtracking on large strings or nested loops over N.
- The generator is pure and synchronous, making it easy to benchmark.

## Table model

The table model lives in `src/features/datagrid/`:

- `types/gridTypes.ts` defines `GridRow` as a thin alias over `DatasetRow`.
- `config/columnsDefinition.ts` defines `gridColumns` as `ColumnDef<GridRow>[]`.
- `hooks/useDataGrid.ts` wires:
  - `useDataset` as the data source.
  - `useReactTable` with `getCoreRowModel`, without sorting or filtering.

The table model is created synchronously from the in-memory array. For the Phase 2 dataset sizes (20k–50k rows), this remains acceptable, especially combined with the virtualized rendering.

## Virtualized rendering

Virtualized rendering is implemented in:

- `config/gridSettings.ts`
  - `DEFAULT_ROW_HEIGHT`
  - `VIRTUALIZED_OVERSCAN`
- `utils/virtualizationUtils.ts`
  - Helpers for basic height calculations and styles.
- `components/DataGridVirtualBody.tsx`
  - Integrates `useVirtualizer` from `@tanstack/react-virtual`.
  - Renders only the visible rows plus an overscan buffer.
- `components/DataGrid.tsx`
  - Provides the scroll container (`div` with `overflow-auto`).
  - Renders the table header.
  - Delegates the `<tbody>` to `DataGridVirtualBody`.

### Behaviour

- The scroll container is constrained with `max-height` relative to `100vh`, so only the grid area scrolls and the rest of the layout remains stable.
- The header row uses `position: sticky` within the scroll container.
- Rows above and below the viewport are represented by padding rows, which keeps the semantics of a `<table>` without using absolutely positioned row wrappers.

This approach substantially reduces the number of DOM nodes rendered at any time and keeps scroll performance smooth for large datasets.

## Performance measurement

A small helper lives in `src/utils/performance.ts`:

- `measureSync(label, fn, { log })` wraps a synchronous function and returns:
  - `result`: the function result.
  - `sample`: `{ label, durationMs }`.

In Phase 2 it is used in `useDataset`:

- The dataset generation (`generateMockDataset`) is measured.
- When `debugPerformance` is true, the helper logs a line to `console.debug` in the form:

[perf] dataset:generateMockDataset: XX.XXms

The helper is intentionally generic so it can be reused later for other synchronous operations (e.g. table model creation or client-side transforms).

## Debug flags

`src/features/datagrid/config/gridSettings.ts` exposes:

- `ENABLE_DEBUG_MEASURES` – when set to `true`, `useDataGrid` will pass `debugPerformance: true` to `useDataset`, enabling console logging of generation time.

The default value is `false` to avoid noisy logs in normal development runs. It can be toggled locally when investigating performance.

## Known limitations in Phase 2

- All data is generated in-memory on the client; there is no streaming, pagination or server-side push.
- Table model creation is synchronous and runs on the main thread.
- There is no memoization of derived views beyond what TanStack Table provides internally.
- Virtualization assumes a reasonably consistent row height (`DEFAULT_ROW_HEIGHT`); pathological row content that doubles or triples the height is not targeted in this phase.

These trade-offs are acceptable for the goals of Phase 2 and will be revisited in later phases if needed (for example, when adding more complex cell renderers, selection, or expensive client-side transforms).

---

## Phase 3 – Client-side interactions (sorting, filtering, search)

Phase 3 adds client-side interactions on top of the virtualized grid. The main performance concern is to keep these operations cheap even with 20k+ rows.

### Sorting and filtering cost

- Sorting, filtering and global search are handled by **TanStack Table**:
  - Sorting and filtering run on the **in-memory dataset** (`GridRow[]`).
  - The virtualized body (`DataGridVirtualBody`) continues to render only the visible rows.
- Key properties:
  - Sorting and filtering are **pure, synchronous transforms** over the current row model.
  - There is no additional network I/O or asynchronous work introduced in Phase 3.
- Design guidelines:
  - Keep filter predicates simple and linear:
    - Case-insensitive “contains” checks for text fields.
    - Direct comparisons for numeric and date fields.
  - Avoid expensive operations inside filter functions (e.g. RegExp construction per row).
  - Prefer pre-normalization in the dataset layer if future requirements demand heavier transforms.

### Global search (debounced)

- Global search is debounced (~300 ms) via `useDebouncedValue`:
  - Reduces the number of times the table state is recomputed while typing.
  - Keeps typing latency low even with a large dataset.
- The debounced value is the only one passed to `setGlobalFilter`:
  - The grid does **not** recompute on every keystroke.
  - The perceived responsiveness is bound to the debounce interval, not to row count.

### State management and re-renders

- `gridStore` (Zustand) acts as the single source of truth for:
  - `sorting`, `columnFilters`, `globalFilter`.
- Performance considerations:
  - Components subscribe only to the slices of state they need.
  - Derived state (filtered and sorted rows) lives inside TanStack Table, not in React component state.
  - The virtualized body receives a stable `table` instance and only re-renders the rows that TanStack Table exposes as visible.

### Interaction patterns and perceived performance

- All grid interactions (sorting, filtering, search) are **instant**, without loading spinners or overlays.
- The stats bar (`DataGridStatsBar`) provides immediate feedback about:
  - Visible vs total row counts.
  - Number of active filters and sorted columns.
- These textual cues help users understand what is happening without requiring extra visual effects that could hurt performance.

---

## Phase 4 – Motion performance and virtualized grids

Phase 4 introduces Framer Motion for microinteractions. The primary performance goal is to ensure that **animations never degrade scroll performance or interaction latency**.

### Motion tokens and reduced-motion

- Motion configuration is centralized in `motionSettings.ts`:
  - Duration tokens (`fast`, `medium`, `slow`) keep animations short by default.
  - Easing curves are shared across components, avoiding ad-hoc timings.
- `MotionConfig` in `App.tsx`:
  - Reads `prefers-reduced-motion` and configures Framer Motion globally.
  - When reduced motion is requested:
    - Transitions effectively become zero-duration.
    - Visual effects are minimized without changing functional behavior.

This ensures there is no need to sprinkle `matchMedia` checks across components, reducing the risk of inconsistent behavior.

### Safe properties and layout stability

- Only **GPU-friendly** properties are animated:
  - `opacity`
  - `transform` (`translateY`, small `scale` changes in some cards)
- The following are intentionally **not** animated:
  - Row height, padding or margins that would affect virtualizer measurements.
  - Scroll position or any scroll-linked effects.

This keeps the table layout stable and prevents jank when scrolling through a large number of virtualized rows.

### Virtualization compatibility

- `DataGridVirtualBody` continues to own:
  - The `<tbody>` element.
  - Padding rows used to simulate off-screen content.
- Each visible row is rendered via `DataGridRow`:
  - `DataGridRow` wraps the row in `motion.tr` and only animates **hover** using a small `translateY`.
  - There is no animation tied to scroll events; hover is purely pointer-driven.
- As a result:
  - The number of animated elements equals the number of visible rows (plus overscan), not the total dataset.
  - The virtualizer remains the only authority for which rows are mounted/unmounted.

### Scope of animations vs cost

- Animations are applied to:
  - Layout shell (`AppShell`, `SidePanel`) on initial mount.
  - Grid container (`DataGrid` section).
  - Toolbar and stats bar (`DataGridToolbar`, `DataGridStatsBar`).
  - Header row (`DataGridHeader`) and sort icons.
  - Visible rows (`DataGridRow`) on hover.
- Notably **excluded** from animation:
  - Continuous transitions on scroll.
  - Bulk animations over all rows when filters or sorting change.
- The visual result:
  - Perceived smoothness and polish improve.
  - CPU/GPU overhead stays bounded and independent from dataset size.

### Debugging and tuning motion

- Motion tokens in `motionSettings.ts` act as a single control point:
  - If performance issues are detected on low-end devices, durations or elevation offsets can be adjusted in one place.
  - Additional flags (e.g. a “disable motion” debug flag) can be wired later without touching individual components.
- Combined with existing performance helpers (`measureSync`) and debug flags for dataset generation, this allows:
  - Isolating pure computation costs (dataset, table model).
  - Separately tuning the perceived latency from animations and microinteractions.

---

## Phase 5 – State complexity, selection & persistence

Phase 5 adds new capabilities to the grid (column configuration, selection,
views, and lightweight persistence) with the explicit goal of **not degrading
the performance** achieved in earlier phases.

### 5.1. Cost model of the new state

The new state slices (`columnVisibility`, `columnOrder`, `rowSelection`, `views`)
are designed to be lightweight:

- **`columnVisibility` and `columnOrder`**
  - Their size is bounded by the number of columns, not the number of rows.
  - Typical operations (`toggle`, `moveColumn`, `reset`) are at most O(n_columns).
  - Changes in visibility or order only trigger re-renders of the header and the
    affected cells, keeping full compatibility with virtualization.

- **`rowSelection`**
  - Stored as a `rowId → boolean` map, without duplicating row data.
  - Aggregates used in `RowDetailPanel` (sum of `amount`, status counters, etc.)
    are computed only over selected rows, which in practice tend to be few
    compared to the total dataset.
  - The cost of updating `rowSelection` when clicking a row is O(1) in the
    current single-select mode.

- **`views`**
  - The number of predefined views is small and bounded.
  - Applying a view means copying a few configuration arrays (sorting, filters,
    visibility, order), not touching the full dataset.

### 5.2. Interaction with virtualization

The Phase 5 design decisions keep the same principles introduced in Phase 4:

- **Row virtualization** remains responsible for limiting the number of real DOM
  nodes.
- Row selection does not add uncontrolled per-row listeners:
  - The logic is concentrated in `DataGridRow`, which is only instantiated for
    visible rows + overscan.
- Changes in column visibility/order:
  - Do not destroy the entire table; this is delegated to TanStack Table, which
    is already optimized to update the affected headers and cells.

In manual tests with ~20k rows, scrolling remains smooth, and selection
operations, view changes, and column toggling do not introduce perceptible
stutters on reasonable desktop hardware.

### 5.3. Local storage and snapshot size

Persistence in `localStorage` is limited to the **grid configuration**, not the
dataset:

- The snapshot includes:
  - `columnVisibility`
  - `columnOrder`
  - `views`
  - `activeViewId`
- The size of the resulting JSON is small compared to any real dataset, so:
  - `JSON.stringify` / `JSON.parse` operations are cheap.
  - Reads/writes to `localStorage` do not happen in a critical render path (they
    are done in React effects, reacting to configuration changes).

Additionally:

- The load logic is version-tolerant:
  - If a `GridColumnId` appears that no longer exists in the current
    configuration, it is ignored.
  - If the snapshot is corrupted, it safely falls back to the grid defaults.

### 5.4. Performance guardrails for future phases

To maintain performance in later phases, it is recommended to:

- Avoid deriving heavy data directly during render when it can be **memoized** or
  computed only when selection changes.
- Keep persistence focused on **config**, not on large volumes of data.
- Continue using Framer Motion only on cheap properties (`opacity`, `transform`)
  in new interactions related to selection or views.

With these guardrails, the additional complexity introduced in Phase 5 remains
controlled and compatible with the goal of a **massive, smooth, and responsive**
grid.
