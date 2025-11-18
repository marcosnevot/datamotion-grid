// src/features/datagrid/types/gridTypes.ts
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';
import type { DatasetRow } from '../../dataset/types/datasetTypes';

export type GridRow = DatasetRow;

export type GridColumnId = keyof GridRow;

export type GridColumnAlign = 'left' | 'center' | 'right';

export type GridFilterType = 'text' | 'select' | 'number' | 'date';

export interface GridColumnMeta {
  label: string;
  align?: GridColumnAlign;
  isNumeric?: boolean;
  minWidth?: number;
  maxWidth?: number;
  filterType?: GridFilterType;
}

/**
 * Column visibility
 * Record of columnId → visible flag.
 */
export type ColumnVisibilityState = Record<GridColumnId, boolean>;

/**
 * Column ordering
 * Ordered list of columnIds.
 */
export type ColumnOrder = GridColumnId[];

/**
 * Row selection state (TanStack-compatible)
 * Keys are rowIds, values indicate selection.
 */
export type RowSelectionState = Record<string, boolean>;

/**
 * Derived info about current selection.
 * Useful for RowDetailPanel, stats bar, etc.
 */
export interface SelectedRowInfo {
  selectedRow: GridRow | null;
  selectedCount: number;
  selectedIds: string[];
  selectedRows: GridRow[];
}

/**
 * Saved views
 */
export type GridViewId = string;

export interface GridView {
  id: GridViewId;
  name: string;
  description?: string;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  columnVisibility: ColumnVisibilityState;
  columnOrder: ColumnOrder;
}
