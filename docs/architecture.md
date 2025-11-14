# DataMotion Grid – Architecture (Draft)

This document is a placeholder for architecture notes to be expanded in later phases.

- Frontend SPA built with React + TypeScript + Vite.
- Virtualized data grid focused on performance and UX.
- Feature-based folder structure under `src/` for datagrid, theme and dataset.

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
