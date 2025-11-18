# DataMotion Grid – UX Guidelines

This document describes the UX and interaction patterns of **DataMotion Grid** at the
end of Phase 6. It is aimed at developers and designers who want to understand how
the grid should feel and behave, beyond the raw implementation details.

The focus is on:

- Layout and mental model of the application.
- Grid interactions (sorting, filters, search, stats).
- Column configuration, selection and saved views.
- Animations and microinteractions with Framer Motion.
- Accessibility, keyboard navigation and discoverability.
- UX impact of performance optimisations.


## 1. UX principles

DataMotion Grid is designed as a **high‑density analytical grid**, not a minimal CRUD
table. The main UX principles are:

- **Clarity over flashiness**  
  Motion, color and typography support comprehension; they never replace clear
  structure or text.

- **Responsiveness at scale**  
  The grid must remain responsive with **tens of thousands of rows**. Any UX pattern
  that conflicts with smooth scrolling or quick interactions is avoided.

- **Predictable interactions**  
  Sorting, filtering and configuration follow stable, repeatable patterns. Users
  should be able to guess what will happen before clicking.

- **Accessible by default**  
  Keyboard navigation, focus order and ARIA attributes are part of the UX contract,
  not an afterthought.

- **Respect for user preferences**  
  Motion respects `prefers-reduced-motion`. Theme respects the user’s chosen
  light/dark/system preference.


## 2. Layout and mental model

### 2.1 Application layout

The app is structured as a single, focused page built by `AppShell`:

- **Header (`AppHeader`)**
  - Shows the project name and short description.
  - Hosts global controls such as the **theme toggle**.

- **Main content**
  - Left side: virtualized data grid.
  - Right side: `SidePanel` with row details and helper content (including
    keyboard shortcuts).

- **Footer (`AppFooter`)**
  - Shows technology stack labels.
  - Includes a compact FPS / perf indicator to signal performance regressions
    without being distracting.

Only the grid area scrolls; header, side panel and footer remain visually stable.


### 2.2 Grid structure

Inside the main content, the grid is composed of:

- **Toolbar (`DataGridToolbar`)**
  - Global search.
  - “Clear filters” action.
  - Entry points for column configuration and views.

- **Header (`DataGridHeader`)**
  - Column headers with sort affordances.
  - Second row of per‑column filters.

- **Stats bar (`DataGridStatsBar`)**
  - Shows visible vs total rows.
  - Shows counts of active filters and sorted columns.

- **Virtualized body (`DataGridVirtualBody`)**
  - Scrollable table body with virtualized rows.

- **Side panel (`SidePanel` + `RowDetailPanel`)**
  - Shows state‑aware content based on current selection and shortcuts.


---

## 3. Phase 3 – Grid interactions (sorting, filtering, search)

Phase 3 turns the grid into an interactive analytical surface. The primary UX goal
is to make state changes **discoverable and reversible** while keeping interactions
smooth with large datasets.


### 3.1 Sorting UX

- **Interaction**
  - Clicking a sortable column header cycles the sort state:
    1. Not sorted → ascending
    2. Ascending → descending
    3. Descending → not sorted
  - Sorting is **local** to the grid (no page reloads).

- **Affordances**
  - Each sortable header shows a small sort indicator next to the label:
    - Up arrow for ascending.
    - Down arrow for descending.
    - A neutral icon or subtle hint when unsorted.
  - The header visually distinguishes sortable columns from non‑sortable ones
    (e.g. via hover state and cursor).

- **Accessibility**
  - Headers expose `aria-sort="ascending"` or `"descending"` as appropriate.
  - When unsorted, the attribute is omitted.

- **Reset**
  - Sorting can be cleared:
    - Per column, by cycling through the states with additional clicks.
    - Globally, via a `resetSorting` action in the store (exposed in the UI
      where appropriate in later phases).


### 3.2 Column filters UX

This grid favours **always‑visible** column filters for analytical workflows.

- Filters appear in a **second row of the header**, directly under the column
  labels.

- **Filter types**
  - Text filters (e.g. for `name`, `email`, `country`):
    - Small input with placeholder like `Filter…`.
    - Case‑insensitive “contains” behaviour.
  - Select filter for `status`:
    - Options include an “all” state and concrete statuses such as `Active`,
      `Pending`, `Inactive`.
    - Clear separation between “no filter” and an active filter.
  - Numeric filter (e.g. `amount`):
    - Single input representing a minimum amount.
    - Invalid values fall back to “no filter” semantics.
  - Date filter (if enabled):
    - Uses an HTML date input.
    - Interpreted as “on or after” the chosen date.

- **Behaviour**
  - Filters apply **immediately** when values change; there is no separate
    “Apply” button.
  - The stats bar updates in sync to show `Showing X of Y rows` and the current
    filter count.


### 3.3 Global search UX

- The **global search** input lives in `DataGridToolbar`, above the header.
- Scope:
  - Searches across multiple key columns (e.g. `name`, `email`, `country`).
  - Case‑insensitive “contains” matching.
- Debounce:
  - Uses a debounced value (around **300 ms**) to avoid recomputing on every
    keystroke.
  - Typing remains snappy, and filtering does not stutter even for ~20k rows.
- Copy & accessibility:
  - Placeholder describes the scope, e.g.
    `Search in name, email, country…`.
  - `aria-label` mirrors this description for screen readers.


### 3.4 “Clear filters” UX

- A **“Clear filters”** button is permanently visible in the toolbar.
- Disabled state:
  - Disabled when **both**:
    - No global search text is present.
    - No column filters are active.
- When enabled and clicked:
  - Clears the global search term.
  - Clears all column filters.
  - Does **not** reset sorting in this phase; sorting can be reset independently.
- The stats bar immediately reflects the cleared state.


### 3.5 Stats bar UX

`DataGridStatsBar` surfaces current grid state in a compact summary:

- Row counts:
  - `Showing X rows` when no filters/search are applied.
  - `Showing X of Y rows` when there is any active search or filter.
- Filters:
  - Shows `Filters: none` when no filters are active.
  - Shows `Filters: N` when one or more filters are applied.
- Sorting:
  - Shows `Sorting: none` or `Sorting: 1 column` / `Sorting: N columns`.

Placement and behaviour:

- The stats bar appears **between** the toolbar and the table.
- It remains visible while scrolling the grid body.
- All values are derived from:
  - TanStack Table row model for `X`.
  - Dataset size from `useDataset` for `Y`.


### 3.6 Performance & responsiveness

- Sorting, filtering and search always run **client‑side** on the in‑memory
  dataset.
- TanStack Table computes the row model; `DataGridVirtualBody` then renders
  only the visible rows.
- UX guidelines:
  - No loading spinners or blocking overlays for these operations.
  - Use subtle textual feedback (stats bar) instead of heavy animations.


---

## 4. Phase 4 – Animations & microinteractions (Framer Motion)

Phase 4 introduces motion to make the interface feel more alive, without changing
semantics or sacrificing performance.


### 4.1 Design principles

- Animate only **cheap properties** (`opacity`, `transform`).
- Prefer short durations (typically **150–220 ms**).
- Avoid scroll‑linked or continuous animations.
- No animation may block or delay user input.
- Respect `prefers-reduced-motion` globally.


### 4.2 Layout and shell animations

- **Main content (`AppShell`)**
  - On initial mount, the main content:
    - Fades in from `opacity: 0 → 1`.
    - Moves slightly from below (`translateY` from a small offset to `0`).
  - Runs only **once** when the page loads, not on each re‑render.

- **Side panel**
  - On desktop layouts, the side panel appears with:
    - A short horizontal slide‑in from the right.
    - A subtle fade‑in.
  - This is intentionally low‑key so that focus remains on the grid.


### 4.3 Grid‑level microinteractions

- **Grid container (`DataGrid`)**
  - May use a light entrance animation (fade/slide‑in) aligned with the main
    content.

- **Row hover (`DataGridRow`)**
  - On desktop hover:
    - Applies a small elevation effect using `translateY` and background
      highlight.
    - Does not significantly change size; the effect is crisp and minimal.

- **Sorting feedback (`DataGridHeader`)**
  - Sort icons animate slightly when the sort state changes:
    - Small position or opacity adjustments.
  - The header text itself remains stable.

- **Toolbar & stats (`DataGridToolbar`, `DataGridStatsBar`)**
  - Fade/slide‑in on mount.
  - Small, contained animations when state changes (e.g. filters count).
  - Must not interfere with typing in the search input.


### 4.4 Reduced motion

- `MotionConfig` reads `prefers-reduced-motion` at the top level.
- When reduced motion is requested:
  - Durations are collapsed towards **0 ms**.
  - Decorative transitions (e.g. hover elevation) are minimised.
- Components should respect this behaviour implicitly through shared motion
  tokens; they should not replicate the media query individually unless
  strictly necessary.


### 4.5 Virtualization‑friendly motion

- Virtualization rules do **not** change:
  - `DataGridVirtualBody` controls which rows are mounted.
  - Only visible rows plus overscan are ever animated.
- The motion system must **not**:
  - Animate row height, padding or margins.
  - Drive animations based on scroll position.
- Row‑level animations are limited to hover/focus and small state changes,
  not bulk transitions for all rows at once.


---

## 5. Phase 5 – Column configuration, selection & views

Phase 5 adds “power user” features while maintaining clarity and performance.


### 5.1 Row selection & RowDetailPanel

#### Selection model

- Current model: **single selection via click**.
- Behaviour:
  - Clicking a row selects that row.
  - Any previous selection is cleared.
  - Selection state is reflected in the row visuals and ARIA attributes.

#### Visual feedback

- Selected rows:
  - Use a distinct background and/or border.
  - Remain visibly selected even without hover.
- Hover and selection states compose cleanly:
  - Hover may add a small elevation/translate effect.
  - The selection highlight remains the primary cue.

#### RowDetailPanel states

`RowDetailPanel` adapts to the number of selected rows:

1. **0 rows selected**
   - Show an explicit empty state (e.g. “No rows selected”).
   - Provide short guidance on how to select a row.

2. **1 row selected**
   - Show a summary card with key fields such as:
     - `id`, `name`, `email`, `status`, `country`, `createdAt`, `amount`.
   - Apply formatting:
     - `amount` as fixed decimal / currency‑like number.
     - `status` with the same badge style used in the grid.

3. **N rows selected (multi‑select, if enabled later)**
   - Summarise aggregates:
     - Number of selected rows.
     - Sum of `amount` over the selection.
     - Optional breakdown by `status`.
   - Avoid rendering a long list of individual rows in this panel.

The current implementation focuses on single‑select, but the UX is structured so
that multi‑select can be introduced later without redesigning the panel.


### 5.2 Column visibility panel (`ColumnVisibilityPanel`)

The column visibility panel lets users hide or show columns without changing the
underlying dataset.

- **Entry point**
  - Opened from a “Columns” control in the toolbar.

- **Layout & content**
  - Appears as a small dialog anchored to the toolbar.
  - Lists all columns defined in `columnsDefinition`:
    - Checkbox to toggle visibility.
    - Column label (truncated if needed).
    - Optional hint when a column is required.

- **Safeguards**
  - The grid never allows **zero visible columns**.
  - Attempts to hide the last visible column are ignored; the checkbox remains
    checked and may show a “required” hint.

- **Reset behaviour**
  - A reset control restores the default visibility as defined in
    `columnsDefinition`.
  - Sorting, filters and column order remain unchanged.

- **Accessibility**
  - The panel uses dialog semantics (`role="dialog"` with an accessible label).
  - Each checkbox has an explicit label or `aria-label` describing the target
    column.
  - The panel closes via:
    - Clicking outside.
    - Pressing `Escape`.
    - Activating the “Columns” trigger again.


### 5.3 Column ordering panel (`ColumnOrderingPanel`)

Column order is controlled through explicit controls rather than drag and drop.

- **Layout**
  - Section title such as “Column order”.
  - List of entries:
    - 1‑based index.
    - Column label.
    - “Move up” (↑) and “Move down” (↓) buttons.

- **Behaviour**
  - “Move up” shifts a column one position earlier in `columnOrder`.
  - “Move down” shifts it one position later.
  - Edge cases:
    - First column → “Move up” disabled.
    - Last column → “Move down” disabled.

- **Reset**
  - A reset control restores the default order from `columnsDefinition`.
  - In this project, an **empty** `columnOrder` means “use default order”, so
    reset sets the state back to `[]`.

- **UX goals**
  - Predictable and keyboard‑friendly ordering.
  - No hidden drag‑and‑drop behaviours.


### 5.4 Saved views (preset configurations)

Phase 5 introduces predefined **views** that encapsulate common grid setups, for
example:

- `Default`
- `Active only`
- `High amount`

These presets are defined in `viewsConfig` and referenced by `gridStore`.

- **Toolbar UX**
  - A `<select>` in the toolbar exposes available views.
  - The `activeViewId` is reflected in the selected value.
  - A placeholder such as “Custom view” is used when the current state does not
    match any preset.

- **Applying a view**
  - When a view is chosen:
    - Sorting, filters, global search, column visibility and order are updated
      to match the preset.
    - Row selection is cleared to avoid inconsistencies.
    - The configuration is persisted in the local storage snapshot.

- **Deviating from a view**
  - After applying a view, any manual changes effectively put the grid into a
    “custom” state.
  - The toolbar still shows the last applied view, but it is understood that the
    configuration has diverged.


### 5.5 Keyboard hints in the side panel

The `SidePanel` contains a dedicated card listing **keyboard shortcuts** relevant
to the grid. This list must always stay in sync with:

- The actual shortcuts implemented in the keyboard utilities.
- The reference document `docs/keyboard-shortcuts.md`.

Typical shortcuts include:

- `F` — focus global search.
- `Alt + C` — toggle the column configuration panel.
- `Alt + 1 / 2 / 3` — apply predefined views (Default / Active only / High amount).

Maintenance rule:

1. Update handlers when shortcuts change.
2. Update `docs/keyboard-shortcuts.md`.
3. Update the side panel card text.


---

## 6. Phase 6 – UX impact of performance optimisations

Phase 6 focuses on performance and stability. From a UX standpoint, the goal is
that users should **not** notice behavioural changes, only smoother interactions.

Key points:

- **Virtualisation remains stable**
  - Row height and overscan configuration keep scroll feel consistent across
    phases.
  - The number of rendered rows at any time remains bounded.

- **Rendering optimisations are invisible**
  - `React.memo`, `useMemo` and `useCallback` are used where they reduce work,
    but they do not change what users see.
  - Hover, selection and zebra striping appear the same as before.

- **Motion remains lightweight**
  - Framer Motion still animates only `opacity` and `transform`.
  - No new layout‑affecting animations are introduced.

- **Loading experience**
  - Dataset generation is still synchronous but fast for the default dataset
    sizes.
  - Any debug timing is logged only in the console, never surfaced as noisy UI.

- **Accessibility & shortcuts**
  - Focus order and keyboard shortcuts (`F`, `Alt + C`, `Alt + 1 / 2 / 3`) are
    unchanged.
  - Any optional performance panel remains purely informational.


---

## 7. Relationship with keyboard shortcuts documentation

Detailed shortcut definitions and platform notes live in
`docs/keyboard-shortcuts.md`.

This UX guide focuses on how shortcuts are **communicated** and how they fit into
the overall interface (e.g. side panel hints, toolbar behaviour). When shortcuts
are added or changed, always update:

1. The actual key handling logic.
2. `docs/keyboard-shortcuts.md`.
3. The keyboard shortcuts card in the side panel.


---

## 8. Summary

In its final form at the end of Phase 6, DataMotion Grid offers:

- A high‑density, virtualized analytical table that remains responsive at scale.
- Clear, predictable interactions for sorting, filters, search and views.
- Subtle but consistent microinteractions powered by Framer Motion.
- A selection model that integrates tightly with the side detail panel.
- Accessible, keyboard‑friendly workflows with documented shortcuts.

These guidelines should be treated as the **source of truth** for UX decisions
around the grid. Any new feature or refinement should be checked against these
principles to keep the experience coherent and maintainable.
