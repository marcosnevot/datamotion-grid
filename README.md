**English** | [Español](README.es.md)

# DataMotion Grid — Virtualized React data grid focused on performance and UX

![CI](https://github.com/marcosnevot/datamotion-grid/actions/workflows/ci.yml/badge.svg)

A high-performance, virtualized data grid demo built with **React**, **TypeScript**, **Vite**,
**TanStack Table & TanStack Virtual**, **Zustand**, **Tailwind CSS**, and **Framer Motion**.

The goal of this project is to showcase how to build a modern, animated data grid that scales
to tens of thousands of rows while keeping the UX smooth, predictable, and accessible.


## Table of contents

- [Overview](#overview)
- [Key features](#key-features)
- [Tech stack](#tech-stack)
- [Architecture & documentation](#architecture--documentation)
- [Performance characteristics](#performance-characteristics)
- [User experience & accessibility](#user-experience--accessibility)
- [Keyboard shortcuts](#keyboard-shortcuts)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Available npm scripts](#available-npm-scripts)
- [Project structure](#project-structure)
- [Development & testing](#development--testing)
- [Roadmap & status](#roadmap--status)
- [License](#license)


## Overview

**DataMotion Grid** is a frontend-only single-page application that focuses on one thing:
rendering a large, interactive dataset in a way that still feels fast and polished.

There is **no backend** in this repository. Instead, the app uses a deterministic mock
dataset generator to simulate realistic data (IDs, names, emails, statuses, countries,
dates, numeric amounts…). This keeps the project self-contained while still exercising
real-world performance and UX constraints.

Target audience:

- Frontend engineers interested in high-performance tables and virtualization.
- Engineers reviewing portfolio work (architecture, testing, UX, and performance).
- Developers looking for reference patterns for React + TanStack Table + TanStack Virtual.


## Key features

### Grid & data

- Virtualized data grid tested with **~20k rows** and designed for **5k–50k rows**.
- Deterministic mock dataset generator (`generateMockDataset`) with:
  - Stable row IDs.
  - Realistic fields (status, country, dates, numeric amount).
  - Configurable row count and seed.
- All data is generated **on the client**; no API calls required.

### Interactions

- **Sorting**
  - Clickable column headers with ascending / descending / unsorted cycle.
  - ARIA attributes (`aria-sort`) for assistive technologies.
- **Per-column filters**
  - Text filters (name, email, country) with case-insensitive “contains” logic.
  - Select filter for status (e.g. Active, Pending, Inactive).
  - Numeric and date filters where relevant.
- **Global search**
  - Debounced input (around 300 ms) across multiple key columns.
  - Designed to stay responsive with large datasets.
- **Stats bar**
  - `Showing X rows` or `Showing X of Y rows` depending on filters/search.
  - Counts for active filters and sorted columns.

### Column configuration & views

- **Column visibility**
  - Dedicated panel to show/hide columns.
  - Never allows hiding all columns (last visible column is protected).
  - Reset to default visibility.
- **Column ordering**
  - Explicit “Move up / Move down” controls for deterministic ordering.
  - Reset to default order (using the column definition as source of truth).
- **Saved views (presets)**
  - Predefined grid configurations like `Default`, `Active only`, `High amount`.
  - Changing view applies filters, sorting, visibility and ordering in one step.
  - Views are integrated with keyboard shortcuts and persistence.

### Selection & side panel

- **Row selection**
  - Single-row selection by clicking on a row.
  - Clear visual distinction for selected state.
- **RowDetailPanel**
  - 0 rows selected → empty state with guidance.
  - 1 row selected → summary card with key fields and formatted values.
  - Designed so it can be extended later to multi-select aggregates.
- **Contextual side panel**
  - Fixed panel on the right-hand side for selection details and helper content.
  - Includes a dedicated card listing keyboard shortcuts.

### Theming & motion

- **Theme system**
  - Light / Dark / System theme modes.
  - Preference stored in a small theme store and applied via Tailwind’s `dark` class.
- **Animations & microinteractions**
  - Framer Motion on layout, toolbar, stats bar, header and rows.
  - Motion tokens centralised in `motionSettings.ts`.
  - Only animates GPU-friendly properties (`opacity`, `transform`).
  - Fully respects `prefers-reduced-motion` via a single `MotionConfig` wrapper.


## Tech stack

- **Core**
  - [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
  - [Vite](https://vitejs.dev/) (development server & build)
- **Table & virtualization**
  - [`@tanstack/react-table`](https://tanstack.com/table/latest)
  - [`@tanstack/react-virtual`](https://tanstack.com/virtual/latest)
- **State management**
  - [`zustand`](https://github.com/pmndrs/zustand) for grid and theme stores
- **Styling & motion**
  - [Tailwind CSS](https://tailwindcss.com/)
  - [Framer Motion](https://www.framer.com/motion/)
- **Testing**
  - [Vitest](https://vitest.dev/)
  - [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
  - [Playwright](https://playwright.dev/) for E2E tests


## Architecture & documentation

The implementation is documented in more detail in the `docs/` folder:

- [`docs/architecture.md`](./docs/architecture.md)  
  Final architecture, data pipeline, grid orchestration, stores and layout.
- [`docs/performance-notes.md`](./docs/performance-notes.md)  
  Performance model, virtualization strategy, instrumentation and tuning knobs.
- [`docs/ux-guidelines.md`](./docs/ux-guidelines.md)  
  UX principles, interaction design, motion guidelines and side panel behavior.
- [`docs/keyboard-shortcuts.md`](./docs/keyboard-shortcuts.md)  
  Canonical list of keyboard shortcuts and how they are handled.


## Performance characteristics

At the end of the proyect, the grid is designed to remain smooth and usable in the
**5k–50k rows** range.

Key points:

- Dataset is generated **once** in memory using `generateMockDataset`.
- Table model is built with TanStack Table and passed to the virtualized body.
- Scrolling performance is controlled by **TanStack Virtual** with:
  - A fixed estimated row height.
  - Bounded overscan (extra rows above/below the viewport).
- Only the visible rows (plus overscan) are mounted as DOM nodes at any time.
- Global search is debounced to reduce unnecessary recomputations.
- Extra state (selection, views, column config) is kept small and bounded.
- Basic timing information (e.g. dataset generation time) is available via a
  small helper (`measureSync`) and optional debug flags.


## User experience & accessibility

UX goals for DataMotion Grid:

- **Clarity over flashiness** – motion and color support the data, not the other way around.
- **Predictability** – sorting, filters and configuration follow simple, repeatable rules.
- **High density** – suitable for analytical usage rather than CRUD forms.
- **Accessibility by default** – keyboard navigation and ARIA attributes are part of
  the design.
- **Respect for user preferences** – theme and motion respect OS-level settings.

Highlights:

- Always-visible column filters for fast analytical workflows.
- Clear visual states for sorting, filtering and selection.
- Side panel with explicit empty states and guidance.
- Animations that are subtle, short, and never block input.
- `prefers-reduced-motion` honored globally via `MotionConfig`.


## Keyboard shortcuts

Keyboard shortcuts are documented in detail in
[`docs/keyboard-shortcuts.md`](./docs/keyboard-shortcuts.md) and surfaced in the
side panel in the UI.

At the end of the proyect, the active shortcuts are:

- `F` – Focus the **global search** input in the toolbar.
- `Alt + C` – Toggle the **column configuration** panel (visibility & order).
- `Alt + 1` – Apply the **Default** view.
- `Alt + 2` – Apply the **Active only** view.
- `Alt + 3` – Apply the **High amount** view.

All shortcuts:

- Are scoped to the grid view.
- Are ignored when focus is inside an editable element (`input`, `textarea`, etc.).


## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) **18+** (LTS recommended)
- [npm](https://www.npmjs.com/) (comes with Node)

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/marcosnevot/datamotion-grid.git
cd datamotion-grid
npm install
```

Start the development server:

```bash
npm run dev
```

Then open the printed URL in your browser (typically `http://localhost:5173/`).


### Available npm scripts

Exact scripts are defined in `package.json`. Typical usage:

```bash
# Start the Vite development server
npm run dev

# Run a production build
npm run build

# Preview the production build locally (after build)
npm run preview

# Lint the codebase with ESLint
npm run lint

# Format the codebase with Prettier
npm run format

# Run unit and component tests with Vitest
npm run test

# Run end-to-end tests with Playwright (if configured)
npm run test:e2e
```


## Project structure

High-level structure (see `docs/architecture.md` for more detail):

```text
datamotion-grid/
  README.md
  package.json
  vite.config.ts
  tsconfig*.json
  tailwind.config.cjs
  postcss.config.cjs
  .eslintrc.cjs
  .prettierrc

  src/
    App.tsx
    main.tsx

    components/
      layout/         # App shell, header, footer, side panel

    features/
      datagrid/       # Core grid, config, store, hooks, components, utils
      dataset/        # Dataset types, config, mock generator & hook
      theme/          # Theme store, hook & toggle component

    hooks/            # Shared hooks (debounced value, prefers-reduced-motion)
    styles/           # Tailwind entrypoints and globals
    utils/            # Keyboard & performance helpers
    tests/            # Unit, component and e2e tests
    types/            # Shared TypeScript types

  docs/
    architecture.md
    performance-notes.md
    ux-guidelines.md
    keyboard-shortcuts.md
```


## Development & testing

Suggested workflow:

1. Run the dev server with `npm run dev`.
2. Make changes to features under `src/features/` or layout components.
3. Keep `docs/` in sync if you alter architecture, performance characteristics or UX.
4. Before committing:
   - `npm run lint`
   - `npm run test`
   - `npm run test:e2e` (if Playwright is configured in your environment)
   - `npm run build`

Testing pyramid (see `docs/architecture.md` and `src/tests/`):

- **Unit tests**
  - Pure utilities (`filterUtils`, `sortUtils`, `virtualizationUtils`, `performance`, `keyboard`).
  - Store logic (`gridStore`, views and persistence behavior).
- **Component tests**
  - Grid-level components (`DataGrid`, `DataGridToolbar`, `DataGridStatsBar`, `RowDetailPanel`, `SidePanel`, etc.).
- **End-to-end tests**
  - A basic Playwright flow (`basic-flow.e2e.ts`) to verify that sorting, filtering,
    search, selection and persistence behave correctly from the user’s perspective.


## Roadmap & status

Project status at the end:

- Core architecture and grid features are **complete** for the intended demo scope.
- Performance and UX are tuned for **5k–50k rows** on typical desktop hardware.
- Documentation is consolidated under `docs/` and this `README.md`.

Possible future enhancements (beyond the current scope):

- Keyboard-driven grid navigation (arrow keys, range selection, “select all”).
- More advanced analytics in `RowDetailPanel` (e.g. mini charts).
- Additional performance tooling (runtime metrics widget, automated perf tests).
- Integration with a real backend or streaming data source.


## License

This project is intended primarily as a learning and portfolio piece.

This project is licensed under the **MIT License**.  
See the [LICENSE](./LICENSE) file for the full text.
