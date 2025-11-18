# DataMotion Grid – Performance Notes

These notes describe how DataMotion Grid approaches performance from Phase 2 to Phase 6.
The focus is on keeping a **smooth, responsive, virtualized grid** for tens of thousands
of rows, while still supporting rich interactions and motion.

The document is written for developers who want to understand:

- Where the main performance costs live.
- Which knobs can be tuned safely (row count, overscan, motion).
- How to profile the grid locally.


## 1. Performance model at a glance

At the end of Phase 6, the grid behaves as follows:

- **Dataset**
  - Fully in-memory, deterministic mock dataset (default ~20k rows, tested up to 50k).
  - O(N) generation cost, measured with a small helper (`measureSync`).

- **Table model**
  - Built with **TanStack Table** on top of the dataset.
  - Sorting, per-column filters and global search are pure transforms over the current row model.

- **Virtualization**
  - Implemented with **TanStack Virtual** in `DataGridVirtualBody`.
  - Fixed estimated row height (`DEFAULT_ROW_HEIGHT = 40`) and bounded overscan (`VIRTUALIZED_OVERSCAN = 8`).
  - DOM always contains only the visible rows plus overscan, regardless of total row count.

- **State & interactions**
  - All interactive state (sorting, filters, search, columns, selection, views, persistence)
    lives in a small **Zustand** store (`gridStore`).
  - Components subscribe to the slices they need; derived row models stay inside TanStack Table.

- **Motion**
  - **Framer Motion** adds subtle animations on layout and rows using GPU‑friendly properties
    (`opacity`, `transform`).
  - Motion is globally configured via `MotionConfig` and respects `prefers-reduced-motion`.

- **Instrumentation**
  - `measureSync` for timing synchronous work (e.g. dataset generation).
  - Tunable virtualization parameters in `gridSettings.ts`.
  - An approximate FPS/perf panel in the footer for quick visual checks.


---

## 2. Dataset generation (Phase 2 foundation)

The mock dataset is defined under `src/features/dataset/`:

- `types/datasetTypes.ts` defines `DatasetRow` and related types.
- `generator/mockDataConfig.ts` contains constants (names, countries, ranges).
- `generator/generateMockDataset.ts` produces an in-memory array of `DatasetRow`:
  - Deterministic pseudo-random generator using a simple LCG.
  - Sequential `id` starting at `1`.
  - Bounded numeric field `amount` between `AMOUNT_MIN` and `AMOUNT_MAX`.
  - ISO-8601 `createdAt` timestamps derived from a fixed base date over ~3 years.

### 2.1 Complexity

Dataset generation is **O(N)** in both time and memory, where `N` is `rowCount`:

- Single loop over `N` rows.
- No nested loops or expensive operations on each row.
- The generator is **pure and synchronous**, making it easy to benchmark.

In practice:

- Default dataset sizes around **20k rows** are generated quickly on modern hardware.
- The implementation has been tested up to **50k rows** as an upper bound for the demo.


---

## 3. Table model & virtualized rendering (Phase 2 baseline)

### 3.1 Table model

The table model lives in `src/features/datagrid/`:

- `types/gridTypes.ts` defines `GridRow` as a thin alias over `DatasetRow`.
- `config/columnsDefinition.ts` defines `gridColumns` as `ColumnDef<GridRow>[]`.
- `hooks/useDataGrid.ts` wires:
  - `useDataset` as the data source.
  - `useReactTable` with `getCoreRowModel` and, in later phases, sorting and filtering.

The table is created **synchronously** from the in-memory array. For the Phase 2 and final
dataset sizes (20k–50k rows), this remains acceptable when combined with virtualized
rendering.

### 3.2 Virtualized rendering

Virtualization is implemented across:

- `config/gridSettings.ts`
  - `DEFAULT_ROW_HEIGHT = 40`
  - `VIRTUALIZED_OVERSCAN = 8`
  - `MAX_ROWS = 50_000` (demo upper bound).
- `utils/virtualizationUtils.ts`
  - Helpers for estimated heights and styles.
- `components/DataGridVirtualBody.tsx`
  - Integrates `useVirtualizer` from `@tanstack/react-virtual`.
  - Renders only visible rows plus overscan and two padding rows.
- `components/DataGrid.tsx`
  - Provides the scroll container (`div` with `overflow-auto`).
  - Renders the table header.
  - Delegates the `<tbody>` to `DataGridVirtualBody`.

#### 3.2.1 Behaviour

- The scroll container is constrained with `max-height` relative to `100vh`, so only the
  grid area scrolls and the rest of the layout remains stable.
- The header row uses `position: sticky` within the scroll container.
- Rows above and below the viewport are represented by a **top padding row** and a
  **bottom padding row**, keeping a semantic `<table>` structure.

This approach drastically reduces the number of real `<tr>` nodes mounted at any time
and keeps scroll performance smooth for large datasets.


---

## 4. Client-side interactions (Phase 3 – sorting, filtering, search)

Phase 3 adds client-side interactions on top of the virtualized grid. The main goal is
to keep these operations cheap even with 20k+ rows.

### 4.1 Sorting and filtering cost

- Sorting, filtering and global search are handled by **TanStack Table**:
  - All operations run on the **in-memory dataset** (`GridRow[]`).
  - The virtualized body (`DataGridVirtualBody`) continues to render only the visible rows.

- Key properties:
  - Sorting and filtering are **pure, synchronous transforms** over the current row model.
  - No additional network I/O is introduced in this phase.

- Design guidelines for filters:
  - Use simple, linear predicates:
    - Case-insensitive “contains” checks for text fields.
    - Direct comparisons for numeric and date fields.
  - Avoid expensive operations inside filter functions, especially:
    - Creating regex instances per row.
    - Heavy string manipulation.
  - Prefer pre-normalisation in the dataset layer if future requirements demand more
    complex transforms.

### 4.2 Debounced global search

Global search is debounced via `useDebouncedValue` (around **300 ms** by default):

- Reduces how often the table state is recomputed while typing.
- Keeps typing latency low, even with tens of thousands of rows.

Only the **debounced** value is passed to `setGlobalFilter`:

- The grid does *not* recompute on every keystroke.
- Perceived responsiveness depends more on the debounce interval than on row count.

### 4.3 State management and re-renders

- `gridStore` (Zustand) is the single source of truth for:
  - `sorting`, `columnFilters`, `globalFilter`.
- Components subscribe only to the slices of state they need.
- Derived row models (sorted/filtered rows) live inside TanStack Table.
- The virtualized body receives a stable `table` instance and only re-renders the
  **visible rows**.

### 4.4 Interaction patterns and perceived performance

- Grid interactions (sorting, filtering, search) are designed to be **instant**, without
  loading spinners or blocking overlays.
- The stats bar (`DataGridStatsBar`) provides immediate feedback:
  - Visible vs total row counts.
  - Number of active filters and sorted columns.
- Textual cues help users understand what is happening without heavy visual effects
  that could impact performance.


---

## 5. Motion performance and virtualized grids (Phase 4)

Phase 4 introduces Framer Motion for microinteractions while ensuring that
**animations do not degrade scroll performance or interaction latency**.

### 5.1 Motion tokens and reduced-motion

- Motion configuration lives in `motionSettings.ts`:
  - Duration tokens (`fast`, `medium`, `slow`) keep animations short and consistent.
  - Shared easing curves avoid ad‑hoc timings.
- `MotionConfig` in `App.tsx`:
  - Reads `prefers-reduced-motion`.
  - When reduced motion is requested:
    - Transitions become effectively zero-duration.
    - Visual effects are minimised without changing functional behaviour.

This keeps `matchMedia` checks out of individual components and reduces the risk of
inconsistent behaviour.

### 5.2 Safe properties and layout stability

Only **GPU-friendly** properties are animated:

- `opacity`
- `transform` (`translateY`, small `scale` changes) 

Intentionally **not** animated:

- Row height, padding or margins that would affect virtualizer measurements.
- Scroll position or any scroll-linked effects.

This keeps the table layout stable and prevents jank when scrolling through a large
number of virtualized rows.

### 5.3 Virtualization compatibility

- `DataGridVirtualBody` owns:
  - The `<tbody>` element.
  - The padding rows used to simulate off‑screen content.
- Each visible row is rendered by `DataGridRow`:
  - `DataGridRow` wraps the `<tr>` in `motion.tr`.
  - Only hover state uses a small `translateY` / elevation effect.
  - No animation is tied directly to scroll events.

As a result:

- The number of animated elements equals the number of visible rows (plus overscan),
  not the total dataset.
- The virtualizer remains the only authority on which rows are mounted or unmounted.

### 5.4 Scope of animations vs cost

Animations are applied to:

- Layout shell (`AppShell`, `SidePanel`) on initial mount.
- Grid container (`DataGrid` section).
- Toolbar and stats bar (`DataGridToolbar`, `DataGridStatsBar`).
- Header row (`DataGridHeader`) and sort icons.
- Visible rows (`DataGridRow`) on hover.

Explicitly **excluded**:

- Continuous transitions while scrolling.
- Bulk animations across all rows when filters or sorting change.

This keeps CPU/GPU overhead bounded and **independent** from dataset size.

### 5.5 Debugging and tuning motion

- Motion tokens in `motionSettings.ts` act as a single control point:
  - If issues appear on low-end devices, durations or elevation offsets can be tweaked
    in one place.
  - A “disable motion” debug flag can be added centrally if needed.
- Combined with existing performance helpers (`measureSync`) and debug flags for
  dataset generation, this allows:
  - Isolating pure computation costs (dataset, table model).
  - Separately tuning perceived latency from animations and microinteractions.


---

## 6. State complexity, selection & persistence (Phase 5)

Phase 5 adds richer state (column configuration, selection, views and persistence)
with the explicit goal of **not degrading** performance.

### 6.1 Cost model of the new state

New state slices are kept small and bounded:

- **`columnVisibility` / `columnOrder`**
  - Size is bounded by the number of columns, not rows.
  - Toggling or reordering columns is at most O(n_columns).
  - Only headers and affected cells re-render; virtualization remains intact.

- **`rowSelection`**
  - Stored as a `rowId → boolean` map, without duplicating row data.
  - Aggregates in `RowDetailPanel` (sum of `amount`, status counts, etc.) are computed
    only over selected rows, which are typically few.
  - Per-row selection updates are effectively O(1) in the current single-select mode.

- **`views`**
  - Small, bounded list of predefined views.
  - Applying a view copies a few configuration arrays (sorting, filters, visibility,
    order), without touching the dataset itself.

### 6.2 Interaction with virtualization

The Phase 5 design keeps virtualization as the primary performance lever:

- Row virtualization remains responsible for limiting the number of DOM nodes.
- Row selection logic lives in `DataGridRow`, instantiated only for visible rows and
  overscan.
- Changes in column visibility/order are handled by TanStack Table, which already
  optimises header and cell updates.

In manual tests with ~20k rows:

- Scrolling remains smooth.
- Selection, view changes and column toggling do not introduce perceptible stutters on
  typical desktop hardware.

### 6.3 Local storage and snapshot size

Persistence via `localStorage` is strictly limited to **grid configuration**, never
the dataset:

- Snapshot includes:
  - `columnVisibility`
  - `columnOrder`
  - `views`
  - `activeViewId`
- The resulting JSON is small and cheap to `JSON.stringify` / `JSON.parse`.
- Reads and writes occur in React effects, not on critical render paths.

The persistence logic is **tolerant to schema changes**:

- If a `GridColumnId` no longer exists, it is ignored.
- If the snapshot is missing or corrupted, the grid falls back to defaults.

### 6.4 Performance guardrails for richer state

To keep performance stable as features grow:

- Avoid deriving heavy data directly in render; prefer memoization or recompute only
  when relevant slices (e.g. selection) change.
- Keep persistence focused on **lightweight config**, not large data dumps.
- Continue using Framer Motion only on cheap properties (`opacity`, `transform`) for
  new interactions.


---

## 7. Performance measurements & decisions (Phase 6)

Phase 6 validates that the virtualization strategy scales to large datasets and
applies small, **targeted optimisations** without changing UX.

### 7.1 Virtualization configuration (final for Phase 6)

- `DEFAULT_ROW_HEIGHT = 40`
  - Base estimate for all virtual rows.
  - Matches the current visual density and keeps scroll physics predictable.

- `VIRTUALIZED_OVERSCAN = 8`
  - Extra rows rendered above and below the viewport.
  - Balances smooth scrolling with a low DOM node count.

- `MAX_ROWS = 50_000`
  - Upper bound for demo datasets.
  - Implementation can go beyond this, but tuning and testing focus on this range.

`DataGridVirtualBody` still renders only:

- One padding row at the top.
- The visible virtual rows.
- One padding row at the bottom.

No changes were made to row heights or to the fundamental virtualization strategy.

### 7.2 Dataset generation & measurement

The dataset remains client-generated:

- `generateMockDataset(rowCount, seed)`:
  - Deterministic pseudo-random generator (`DATASET_SEED`).
  - ~3 years of dates for `createdAt`.
  - Bounded numeric range for `amount`.

- `useDataset` wraps the generator with `measureSync`:
  - `measureSync('dataset:generateMockDataset', fn, { log: debugPerformance })`.
  - When `ENABLE_DEBUG_MEASURES` is `true`, a log like  
    `[perf] dataset:generateMockDataset: XX.XXms`  
    is printed via `console.debug`.

This allows quick, local checks of how dataset size impacts generation time without
adding heavy tooling.

### 7.3 Memoization strategy

Phase 6 introduces a few targeted memoization improvements:

- **`useDataGrid`**:
  - Memoises:
    - `allColumnIds` derived from `gridColumns`.
    - `resolvedColumnVisibility` (unknown column IDs dropped).
    - `resolvedColumnOrder` (normalised and completed with missing IDs).
  - These `useMemo` calls are sufficient and deliberately limited.

- **`DataGridRow`**:
  - Row click handler wrapped in `useCallback` with dependencies:
    - `isSelected`
    - `row`
    - `table`
  - Reduces handler churn and simplifies diffing when many rows re-render.

- **`DataGridCell`**:
  - Exported as `memo(DataGridCellComponent)`.
  - Skips re-renders when `children` and `className` props are unchanged.
  - Still uses Framer Motion for small opacity/translate animations, but only when
    necessary.

General rule for Phase 6:

> Only add `React.memo`, `useMemo` or `useCallback` where profiling or reasoning 
> shows a real benefit, and avoid premature optimisation.

### 7.4 FPS / perf panel

A small FPS/perf indicator lives in the footer (`AppFooter`):

- Uses `requestAnimationFrame` to compute an **approximate** FPS.
- Displays a compact “FPS / perf” readout.
- Intended as a **visual canary** for regressions, not as a precision benchmark.

For serious profiling, the recommended tools remain:

- React DevTools Profiler.
- The browser’s Performance panel.


---

## 8. How to profile the grid locally

To reproduce and validate performance on your own machine:

1. **Run the app in development mode**
   - `npm run dev`
   - Open the app in the browser.

2. **Use React DevTools Profiler**
   - Start a profiling session.
   - Interact with the grid:
     - Scroll quickly with a large dataset.
     - Apply sorting and filters.
     - Toggle column visibility and order.
     - Select and deselect rows.
   - Stop the recording and inspect:
     - Which components re-render.
     - How long each commit takes (ms).

3. **Use the browser Performance panel**
   - Record while:
     - Flinging the scroll with ~20k+ rows.
     - Typing into the global search.
   - Look for:
     - Long tasks on the main thread.
     - Layout/paint spikes.

4. **Optionally enable debug timings for dataset generation**
   - Set `ENABLE_DEBUG_MEASURES = true` in `gridSettings.ts` (for local development).
   - Reload the app.
   - Watch the console for logs like:  
     `[perf] dataset:generateMockDataset: X ms`.


---

## 9. Future performance work (beyond Phase 6)

The current implementation already meets the goals of a **high-performance,
virtualized demo grid**. Potential future improvements include:

- More granular memoisation for **heavy cells** (expensive formatting or embedded
  visualisations).
- Measuring and tuning for **extremely large datasets** (100k+ rows or more) if a
  future use case requires it.
- Automated **performance regression tests** using browser automation and custom
  metrics.
- Expanding the FPS/perf panel into a small, optional **runtime metrics widget**
  (e.g. showing average render time, number of visible rows).

These ideas are deliberately out of scope for Phase 6 and Phase 7 but can be
explored later without changing the core architecture.
