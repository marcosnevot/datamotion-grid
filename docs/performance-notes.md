# DataMotion Grid – Performance Notes

## Scope of Phase 2

Phase 2 focuses on:

- Generating a large in-memory mock dataset (20k–50k rows).
- Wiring TanStack Table as the core table model.
- Adding a virtualized body using TanStack Virtual to keep scrolling smooth.
- Introducing a minimal performance measurement utility to track synchronous work.

No client-side sorting, filtering, global search or column configuration is implemented in this phase. Those concerns are intentionally deferred to later phases.

---

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

---

## Table model

The table model lives in `src/features/datagrid/`:

- `types/gridTypes.ts` defines `GridRow` as a thin alias over `DatasetRow`.
- `config/columnsDefinition.ts` defines `gridColumns` as `ColumnDef<GridRow>[]`.
- `hooks/useDataGrid.ts` wires:
  - `useDataset` as the data source.
  - `useReactTable` with `getCoreRowModel`, without sorting or filtering.

The table model is created synchronously from the in-memory array. For the Phase 2 dataset sizes (20k–50k rows), this remains acceptable, especially combined with the virtualized rendering.

---

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

---

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

---

## Debug flags

`src/features/datagrid/config/gridSettings.ts` exposes:

- `ENABLE_DEBUG_MEASURES` – when set to `true`, `useDataGrid` will pass `debugPerformance: true` to `useDataset`, enabling console logging of generation time.

The default value is `false` to avoid noisy logs in normal development runs. It can be toggled locally when investigating performance.

---

## Known limitations in Phase 2

- All data is generated in-memory on the client; there is no streaming, pagination or server-side push.
- Table model creation is synchronous and runs on the main thread.
- There is no memoization of derived views beyond what TanStack Table provides internally.
- Virtualization assumes a reasonably consistent row height (`DEFAULT_ROW_HEIGHT`); pathological row content that doubles or triples the height is not targeted in this phase.

These trade-offs are acceptable for the goals of Phase 2 and will be revisited in later phases if needed (for example, when adding more complex cell renderers, selection, or expensive client-side transforms).
