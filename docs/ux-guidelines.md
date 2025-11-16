# DataMotion Grid – UX Guidelines (Draft)

This document describes UX and interaction patterns for the DataMotion Grid.

Planned topics:

- Layout: header, toolbar, stats bar, data grid, side panel, footer.
- Microinteractions and animations (hover, selection, theme switching).
- Accessibility and keyboard navigation principles.

---

## Phase 3 – Grid interactions (sorting, filtering, search)

Phase 3 transforms the grid from a read-only virtualized table into an interactive analytical grid. The main UX goals:

- Make sorting and filtering **discoverable** and **predictable**.
- Keep the grid **fast and responsive** even with 20k rows.
- Provide **continuous feedback** about the current state (filters, sorting, visible rows).

### Sorting UX

- Column headers are clickable to control sorting:
  - Click 1 → apply sorting.
  - Click 2 → reverse sorting.
  - Click 3 → remove sorting (back to unsorted).
- Each sortable column shows a small icon next to the label:
  - `▲` for ascending.
  - `▼` for descending.
  - `▽` when not sorted.
- The `<th>` elements expose `aria-sort` (`ascending`, `descending`, or no attribute) so screen readers can understand the current sort state.
- Sorting should:
  - Never trigger a full page refresh.
  - Feel instant even on 20k rows (TanStack Table + virtualized body).
  - Be reversible and easy to reset via `resetSorting()` in the grid store (wireable to future UI controls).

### Column filters UX

- Filters are always visible in a second row under the main header. This is an analytical grid, not a minimal CRUD table.
- Filter types:
  - **Text filters** for `name`, `email`, `country`:
    - Small inputs with placeholder `Filter...`.
    - Case-insensitive “contains” match.
  - **Select filter** for `status`:
    - Options: `All`, `Active`, `Pending`, `Inactive`.
    - Clear separation between “no filter” (`All`) and an active filter.
  - **Numeric filter** for `amount`:
    - Single input representing a minimum amount (`Min`).
    - Accepts both numeric and string input; invalid values are treated as “no filter”.
  - **Date filter** (if enabled for date columns):
    - Standard date input (`type="date"`).
    - Interpreted as “on or after” the selected date.
- Filters react immediately when the user changes a control:
  - No extra “Apply” button in Phase 3.
  - The stats bar updates in sync (see below).

### Global search UX

- A single global search input lives in `DataGridToolbar`, above the grid.
- Scope:
  - Searches across multiple columns (`name`, `email`, `country`).
  - Case-insensitive “contains” match.
- Debounce:
  - Uses a debounced value (~300ms) to avoid recomputing on every keystroke.
  - Typing should feel responsive; filtering should not stutter even with 20k rows.
- Copy:
  - Placeholder: `Search in name, email, country…`.
  - `aria-label` matches the placeholder for accessibility.

### Clear filters UX

- A “Clear filters” button is always visible in the toolbar.
- Disabled when:
  - There is no global search text.
  - There are no active column filters.
- When enabled and clicked:
  - Clears `globalFilter`.
  - Clears all `columnFilters`.
  - Does **not** touch sorting in Phase 3 (sorting has its own reset via `resetSorting()`).
- The stats bar immediately reflects the reset state:
  - `Showing Y rows`
  - `Filters: none`
  - `Sorting: …` remains whatever the current sorting state is.

### Stats bar UX

- `DataGridStatsBar` provides at-a-glance information about the grid state:
  - `Showing X rows` when no filters are applied.
  - `Showing X of Y rows` when filters or search are active.
  - `Filters: N` (0 → show `Filters: none`).
  - `Sorting: none` or `Sorting: 1 column` / `Sorting: N columns`.
- Placement:
  - Sits between the toolbar and the table.
  - Always visible without scrolling the grid body.
- The numbers must always reflect the **current row model** of TanStack Table:
  - `X` comes from `table.getRowModel().rows.length`.
  - `Y` is the total dataset count from `useDataGrid`.

### Performance and responsiveness

- All interactions (sorting, filtering, search) must remain smooth with 20k rows:
  - Sorting and filtering are computed by TanStack Table before virtualization.
  - The virtual body (`DataGridVirtualBody`) only renders visible rows.
- UI guidelines:
  - No blocking spinners or overlays for sorting/filtering.
  - Avoid heavy re-renders by keeping state in `gridStore` and passing only the TanStack `table` instance down to components.

### Accessibility and keyboard UX (Phase 3 scope)

- The grid region is announced via `aria-label="Data grid"` on the `<section>`.
- Sorting state is exposed via `aria-sort` on `<th>` elements.
- Inputs and controls:
  - Search and filter inputs must have clear placeholders.
  - Global search uses `aria-label` describing its scope.
  - The “Clear filters” button uses a concise text label and is disabled when no action is available.
- Keyboard:
  - Standard browser focus order:
    - Global search → Clear filters → header cells / filter inputs → grid body.
  - Filter and search inputs are regular `<input>`/`<select>` elements, so default keyboard behavior (Tab, Shift+Tab, typing, etc.) just works.
- Future phases may extend keyboard support with:
  - Arrow-key navigation between cells.
  - Shortcut to focus the global search.
  - Shortcut to clear filters/sorting.
