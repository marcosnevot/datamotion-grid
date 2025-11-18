# DataMotion Grid – Keyboard Shortcuts (Draft)

This document will list keyboard shortcuts and their behavior.

Planned shortcuts (to be implemented in later phases):

- Global navigation and focus management.
- Grid navigation (up/down, selection toggles).
- Quick search focus.

---

# DataMotion Grid – Keyboard Shortcuts (Draft)

This document lists keyboard shortcuts and their behavior.

Planned shortcuts (to be implemented in later phases):

- Global navigation and focus management.
- Grid navigation (up/down, selection toggles).
- Quick search focus.

---

## Phase 5 – Grid shortcuts (search, columns & views)

In Phase 5, the data grid introduces a small set of **global keyboard shortcuts**
designed to speed up frequent tasks without interfering with normal form editing.

> Important: All shortcuts are ignored when focus is inside an editable element
> (`<input>`, `<textarea>`, `contenteditable`, etc.), so normal user typing is never
> interrupted.

### 5.1. Search focus

| Context   | Shortcut | Behavior                                                  | Notes                                         |
|----------|----------|-----------------------------------------------------------|-----------------------------------------------|
| Data grid| `F`      | Moves focus to the global search field (toolbar)          | Only when focus is NOT in an input/textarea   |

Implementation:

- Global `keydown` handler at the grid layer.
- If the key is `f` and the target is not editable:
  - Call `focus()` on the global search input.
  - Call `event.preventDefault()` to avoid minor conflicts.

### 5.2. Column configuration panel

| Context   | Shortcut  | Behavior                                             | Notes                           |
|----------|-----------|------------------------------------------------------|---------------------------------|
| Data grid| `Alt + C` | Opens or closes the column configuration panel       | Equivalent to clicking “Columns”|

Details:

- The shortcut toggles the UI state:
  - If the panel is closed → it opens.
  - If the panel is open → it closes.
- The behavior follows the same closing logic as the regular UI:
  - Click outside the panel.
  - Press the `Escape` key.

### 5.3. Preset views switcher

The grid’s predefined views can be applied without touching the dropdown by using
numeric shortcuts with `Alt`.

| Context   | Shortcut  | Applies view   | Behavior                                                  |
|----------|-----------|----------------|-----------------------------------------------------------|
| Data grid| `Alt + 1` | `Default`      | Restores the grid’s default view                          |
| Data grid| `Alt + 2` | `Active only`  | Applies the preset filtered to rows with active status    |
| Data grid| `Alt + 3` | `High amount`  | Applies the preset focused on rows with high amounts      |

Notes:

- Shortcuts only act if the corresponding view exists in `gridStore`.
- When a view is applied via shortcut:
  - Sorting, filters, columns, and visibility are synchronized.
  - Row selection is cleared (`clearRowSelection`) to avoid inconsistencies.
- If more predefined views are added in the future:
  - The mapping (`Alt + 4`, `Alt + 5`, …) can be extended in `utils/keyboard.ts`.
  - This document must be updated accordingly.

### 5.4. Future shortcuts (out of scope for Phase 5)

There are keyboard behaviors that are **not** implemented yet but are considered for
later phases:

- Spreadsheet-like navigation with `↑ / ↓ / ← / →`.
- Range selection (`Shift + click` or `Shift + ↑/↓`).
- Shortcuts for “select all”, “invert selection”, etc.

When these patterns are added:

- They must be documented in this same section.
- They must be reviewed to ensure they do not conflict with common browser or
  operating system shortcuts.
