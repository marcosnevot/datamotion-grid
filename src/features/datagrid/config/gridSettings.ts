// src/features/datagrid/config/gridSettings.ts

/**
 * Default visual height for a single data row in the grid (in px).
 * Used as the base estimate for virtualization.
 */
export const DEFAULT_ROW_HEIGHT = 40;

/**
 * Number of extra rows to render above and below the viewport
 * to keep scroll feeling smooth while still limiting DOM nodes.
 */
export const VIRTUALIZED_OVERSCAN = 10;

/**
 * Upper bound for demo datasets in the grid.
 * The dataset generator can go beyond this, but the grid
 * may clamp to this limit in some scenarios or tests.
 */
export const MAX_ROWS = 50_000;

/**
 * When enabled, performance helpers can emit console timings
 * for dataset generation and table model creation.
 */
export const ENABLE_DEBUG_MEASURES = false as const;
