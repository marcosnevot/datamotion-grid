# DataMotion Grid – Keyboard Shortcuts

This document describes the keyboard shortcuts available in **DataMotion Grid**
at the end of Phase 6. It is the single source of truth for shortcut behavior
and should stay in sync with:

- The key handling logic in `src/utils/keyboard.ts`.
- The keyboard shortcuts card shown in the `SidePanel`.


## 1. General behavior

- Shortcuts are **scoped to the data grid view** – they are active only when the
  grid page is loaded.
- Shortcuts are **ignored when focus is inside an editable element**:
  - `<input>`
  - `<textarea>`
  - Elements with `contenteditable="true"`
- The goal is to speed up frequent actions without breaking normal typing,
  text selection or browser/OS shortcuts.

If you add or change shortcuts:

1. Update the logic in `src/utils/keyboard.ts`.
2. Update this document.
3. Update the keyboard shortcuts card in the `SidePanel`.


---

## 2. Phase 5 shortcuts – search, columns & views

Phase 5 introduces a small and focused set of keyboard shortcuts aimed at
**power users**. All of them are designed to be easy to discover and avoid
conflicts with common browser shortcuts.


### 2.1. Focus global search

Moves focus to the global search field in the grid toolbar.

| Context   | Shortcut | Behavior                                           | Notes                                        |
|----------|----------|----------------------------------------------------|----------------------------------------------|
| Data grid| `F`      | Focuses the global search input in the toolbar     | Ignored when focus is inside an editable     |

- Implementation details:
  - Global `keydown` listener attached at grid level.
  - When `key === "f"` or `"F"` and target is not editable:
    - `event.preventDefault()`.
    - Call `focus()` on the global search input element (via a ref or an ID).
  - Works both with light and dark themes.


### 2.2. Toggle column configuration panel

Opens or closes the **column configuration** panel (ColumnVisibilityPanel +
ColumnOrderingPanel entry point).

| Context   | Shortcut  | Behavior                                            | Notes                            |
|----------|-----------|-----------------------------------------------------|----------------------------------|
| Data grid| `Alt + C` | Toggles the column configuration panel visibility   | Mirrors clicking the “Columns” UI|

- When pressed:
  - If the panel is closed → it opens.
  - If the panel is open → it closes.
- The panel still closes with:
  - `Escape` key when it has focus.
  - Clicking outside, following standard dialog behaviour.
- The shortcut acts as an alternative to clicking the “Columns” trigger in
  the toolbar.


### 2.3. Apply preset views

Applies predefined **views** (grid presets) without using the dropdown in the
toolbar.

| Context   | Shortcut  | View applied   | Behavior                                                 |
|----------|-----------|----------------|----------------------------------------------------------|
| Data grid| `Alt + 1` | `Default`      | Restores the grid’s default configuration                |
| Data grid| `Alt + 2` | `Active only`  | Filters to rows with an “active” status                  |
| Data grid| `Alt + 3` | `High amount`  | Focuses on rows with amounts in the higher range         |

- Behavior details:
  - Shortcuts only act if the corresponding view exists in `gridStore` and
    `viewsConfig`.
  - When a view is applied:
    - Sorting, filters, global search, column visibility and order are
      updated to the preset configuration.
    - Row selection is cleared via `clearRowSelection`.
    - The new configuration is persisted through the grid persistence layer
      (localStorage snapshot).
  - If a shortcut is pressed but the matching view is missing, the key press
    is ignored.

- Extending shortcuts for new views:
  - Add a new preset to `viewsConfig`.
  - Map `Alt + 4`, `Alt + 5`, etc. in `utils/keyboard.ts`.
  - Update this document and the side panel shortcuts card.


### 2.4. Future grid navigation shortcuts (not implemented)

The following behaviors are **not implemented** at the end of Phase 6 but are
potential future enhancements:

- Spreadsheet-like row navigation using arrow keys (`↑`, `↓`, `←`, `→`).
- Range selection with:
  - `Shift + click`
  - `Shift + ↑/↓`
- Keyboard shortcuts for:
  - “Select all rows”
  - “Clear selection”
  - “Invert selection”

If these are implemented in a later phase, they must be:

1. Added to `utils/keyboard.ts` with clear, conflict-free mappings.
2. Documented in new sections of this file (e.g. “Navigation & selection”).
3. Reflected in the side panel keyboard shortcuts card.


---

## 3. Discoverability & UX guidelines

Keyboard shortcuts are only useful if users can **discover and trust** them.

- The `SidePanel` includes a **Keyboard shortcuts** card that lists the active
  shortcuts from this document.
- The text in that card should match the exact key combinations documented
  here.
- Shortcuts must never silently change; if mappings are updated:
  - Update this document.
  - Update the side panel card.
  - Consider updating the README or a “What’s new” section.

Accessibility note:

- Because shortcuts are disabled in editable contexts, they do not interfere
  with screen reader input modes or typical browser text fields.


---

## 4. Summary

At the end of Phase 6, DataMotion Grid provides a small but powerful set of
shortcuts:

- `F` – Focus global search.
- `Alt + C` – Toggle column configuration panel.
- `Alt + 1 / 2 / 3` – Apply predefined views (Default, Active only, High amount).

These shortcuts prioritise:

- **Speed** – quick access to frequent actions.
- **Safety** – no conflicts with text input or critical browser shortcuts.
- **Consistency** – always documented here and reflected in the UI.

Any future keyboard behaviour should build on these foundations and treat this
document as the canonical reference.
