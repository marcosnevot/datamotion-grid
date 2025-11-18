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

---

## Phase 4 – Animations & microinteractions (Framer Motion)

Phase 4 focuses on **visual feedback** without altering the functional behavior of the grid. Animations must enhance comprehension, not draw attention to themselves.

### Design principles

- Animate only **cheap properties**:
  - `opacity` and `transform` (e.g. translate, scale).
- Keep durations short:
  - Typically between **150–220 ms** (`fast` / `medium` motion tokens).
- Avoid continuous or scroll-driven animations:
  - Animations should respond to **discrete user actions** (hover, sort, filter, initial load).
- No animation should block interaction:
  - The grid remains fully usable while animations run.
- All motion is gated by:
  - `prefers-reduced-motion` (system setting).
  - Shared motion tokens (`MOTION_DURATIONS`, easing curves, elevation offset).

### Layout & shell animations

- **Main content (`AppShell` / page body)**:
  - On initial load, the main content fades in and moves gently from below:
    - Opacity: `0 → 1`.
    - Vertical offset: `8px → 0`.
  - This happens **once on page mount**, not on every re-render.
- **Side panel**:
  - On desktop (`xl+`), the insight panel appears with:
    - A short horizontal slide-in from the right.
    - A subtle fade-in.
  - The animation is subtle enough not to distract from the grid.

### Grid-level microinteractions

- **Grid container (`DataGrid`)**:
  - The grid card fades in and moves slightly from below on mount.
  - This animation should feel aligned with the main content motion but slightly lighter.

- **Row hover (`DataGridRow`)**:
  - On desktop hover:
    - A tiny elevation effect using `translateY` (e.g. `-2px`) and background highlight.
    - No large scale or shadow changes; the effect should feel “crisp” and minimal.
  - Hover is **per-row only** and does not affect virtualization behavior.

- **Sorting feedback (`DataGridHeader`)**:
  - Sort icons react to state changes:
    - `none → asc → desc → none` is accompanied by a small change in position and/or opacity.
    - The header text remains stable; only the icon animates.
  - `aria-sort` remains the primary accessibility indicator; the animation is purely visual sugar.

- **Toolbar (`DataGridToolbar`)**:
  - The toolbar appears with a short fade/slide when the grid mounts.
  - The “Clear filters” button may use a very small scale/opacity feedback on press.
  - Animations do not modify the timing or semantics of debounced search.

- **Stats bar (`DataGridStatsBar`)**:
  - The main label (`Showing X of Y rows`) and filter/sorting indicators transition smoothly when values change:
    - Small vertical offset and opacity change are acceptable.
  - Changes should feel like an update of state, not like a re-layout of the whole card.

### Accessibility and reduced motion

- The app respects `prefers-reduced-motion`:

  - When the system requests reduced motion:
    - Durations are effectively reduced to **0** (or near-0).
    - Decorative effects (elevation, icon transitions) are minimized.
  - Global configuration ensures components do not have to reimplement the check individually, except in edge cases.

- Animations never replace semantic cues:
  - Sorting state is still expressed via `aria-sort` and visible icons.
  - Filter and search state are still represented by text (stats bar, button states, placeholders).

### Performance considerations for virtualized grids

- Virtualization rules remain unchanged:
  - `DataGridVirtualBody` continues to render only the visible window of rows.
- Animations **must not**:
  - Animate row height or padding that could interfere with the virtualizer’s measurements.
  - Trigger on every scroll frame.
- Recommended pattern:
  - Row-level motion responds only to **hover/focus**.
  - Dataset changes from filters/sorting are communicated via:
    - Light motion on the grid container or stats bar.
    - Never by animating every row in bulk.

---

## Phase 5 – UX for column configuration, selection & views

Phase 5 introduces “power user” features to the grid: **row selection**,  
**column configuration (visibility & order)** and **saved views**.  
All of them must feel consistent with the motion and visual language established  
in previous phases (especially Phase 4).

### 5.1. Row selection & visual feedback

#### Semantics

Current selection model is **single-select via click**:

- Clicking a row:
  - Selects that row.
  - Clears selection for all other rows.
- Selection state is reflected in:
  - Row visuals (`DataGridRow`):
    - Distinct background and outline.
    - Subtle elevation/hover animation, consistent with Phase 4.
  - Accessibility attributes (`aria-selected` where applicable).
  - Side panel (`RowDetailPanel`) and optionally `DataGridStatsBar`.

The selection model is intentionally simple in Phase 5; range selection and  
spreadsheet-like navigation are out of scope for now.

#### RowDetailPanel states

`RowDetailPanel` is the main consumer of selection state and must handle three cases:

1. **No selection (0 rows)**

   - Show an explicit empty state, e.g. “No rows selected”.
   - Short guidance text: explain that clicking a row will show its details.

2. **Single selection (1 row)**

   - Show a compact but meaningful summary card:
     - Fields: `id`, `name`, `email`, `status`, `country`, `createdAt`, `amount`.
   - Formatting:
     - `amount` formatted as fixed decimal / currency-like number.
     - `status` displayed using the same badge style used elsewhere in the app.
   - Layout:
     - Prefer a vertical card layout with clear labels and values.
     - Keep typography small but legible (data-dense UI).

3. **Multiple selection (N > 1)**

   - Show a summary header like “N rows selected”.
   - Show selection-based aggregates:
     - Sum of `amount` for selected rows.
     - Optional breakdown by `status` (e.g. “2 Active, 1 Inactive”).
   - Keep the panel compact: avoid rendering huge lists of selected rows here.

#### Visual principles

- Selection highlight must **not** compromise row readability.
- Hover and selection visual states must combine gracefully:
  - Hover can apply a subtle translation/elevation (from Phase 4).
  - Selection uses a background/outline color that remains visible even without hover.
- The feature must play well with virtualization:
  - No per-row heavy effects that depend on non-visible rows.
  - No scroll-jumping when toggling selection.

### 5.2. Column visibility panel

The **column visibility panel** (`ColumnVisibilityPanel`) is opened from a “Columns”  
button in the grid toolbar.

#### Behavior

- The panel is rendered as a small dialog anchored to the toolbar button.
- It lists all grid columns defined in `columnsDefinition`:

  - Each row in the panel contains:
    - A checkbox for visibility.
    - The column label (truncated if necessary).
    - An optional hint (e.g. “required”) when the column cannot be hidden.

- Safeguards:
  - The grid never allows **zero visible columns**.
  - If the user attempts to hide the last visible column:
    - The change is ignored.
    - The checkbox remains checked and can optionally show a “required” hint.

- Reset button:
  - Restores default visibility for all columns as defined in `columnsDefinition`.
  - Should not affect sorting, filters or column order.

#### Accessibility & interaction

- Panel root:
  - Exposed as `role="dialog"` with `aria-label="Column visibility configuration"`.
- List:
  - Uses `role="list"` / `role="listitem"` for the column entries.
- Checkboxes:
  - Each checkbox must have an explicit `aria-label` such as:
    - “Toggle visibility for {column label}”.
- The panel can be closed by:
  - Clicking outside of it.
  - Pressing `Escape`.
  - Clicking the “Columns” button again.

### 5.3. Column ordering panel

The **column ordering panel** (`ColumnOrderingPanel`) allows reordering columns using  
simple “Move up / Move down” controls instead of drag & drop.

#### Layout

- Panel section title: “Column order”.
- A list of items, each representing a column:

  - Displays:
    - The current index (1‑based).
    - The column label.
    - Two small buttons:
      - “↑” – move the column up.
      - “↓” – move the column down.

- Edge conditions:
  - The **first** column item has its “Move up” button disabled.
  - The **last** column item has its “Move down” button disabled.

#### Behavior

- Clicking “Move up” moves the column one position earlier in `columnOrder`.
- Clicking “Move down” moves it one position later.
- Reset button:
  - Restores the default order from `columnsDefinition`.
  - Implementation detail: in this project, an empty `columnOrder` means
    “use default order”, so reset sets `columnOrder` back to `[]`.

The intent is to keep the control **predictable and keyboard-friendly**, without the  
overhead and complexity of drag & drop reordering.

### 5.4. Saved views (presets)

Phase 5 introduces **predefined views** that bundle common grid configurations:

- Example presets:
  - `Default`
  - `Active only`
  - `High amount`

These presets are defined in `viewsConfig` and stored in `gridStore`.

#### UX in the toolbar

- A `<select>` in the toolbar is used to switch between preset views.
- Behavior:
  - The current `activeViewId` is reflected in the `<select>` value.
  - A placeholder such as “Custom view” is shown when:
    - No view is active.
    - The current state no longer matches any predefined view.

#### Applying a view

When the user selects a view (either from the dropdown or via a keyboard shortcut):

- The grid applies the view’s configuration:
  - Sorting
  - Column filters
  - Global filter
  - Column visibility
  - Column order
- Row selection is cleared (`clearRowSelection`) to avoid inconsistencies.
- The change is persisted in the local storage snapshot so the view survives reloads.

If the user modifies the grid after applying a view (filters, sorting, etc.):

- The grid is effectively in a “custom” state.
- The `<select>` still shows the last preset that was applied, but:
  - UX-wise, it is understood that the actual state is no longer identical to the preset.
  - Future phases may add explicit support for user-defined saved views.

### 5.5. Keyboard hints in the side panel

The `SidePanel` includes a card dedicated to **keyboard shortcuts** that relate to  
the grid. It must always stay in sync with the real shortcuts documented in  
`docs/keyboard-shortcuts.md`.

In Phase 5, this card typically mentions:

- `F` — focus global search.
- `Alt + C` — toggle column configuration panel.
- `Alt + 1/2/3` — apply predefined views (Default / Active only / High amount).

Whenever shortcuts change:

1. Update the implementation in the keyboard utilities / handlers.
2. Update `docs/keyboard-shortcuts.md`.
3. Update the list inside the side panel card.

This keeps discoverability high while avoiding divergence between docs, UI hints  
and actual behavior.

