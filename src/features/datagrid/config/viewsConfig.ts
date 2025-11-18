// src/features/datagrid/config/viewsConfig.ts
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';
import { gridColumns } from './columnsDefinition';
import type {
  GridColumnId,
  ColumnOrder,
  ColumnVisibilityState,
  GridView,
  GridViewId,
} from '../types/gridTypes';

const DEFAULT_COLUMN_ORDER: ColumnOrder = gridColumns.map(
  (column) => column.id as GridColumnId,
);

const createAllVisible = (): ColumnVisibilityState =>
  DEFAULT_COLUMN_ORDER.reduce<ColumnVisibilityState>((acc, columnId) => {
    acc[columnId] = true;
    return acc;
  }, {} as ColumnVisibilityState);

export const DEFAULT_VIEW_ID: GridViewId = 'default';

export const PREDEFINED_VIEWS: GridView[] = [
  {
    id: DEFAULT_VIEW_ID,
    name: 'Default',
    description: 'All rows, all columns, no filters',
    sorting: [] as SortingState,
    columnFilters: [] as ColumnFiltersState,
    globalFilter: '',
    columnVisibility: createAllVisible(),
    columnOrder: DEFAULT_COLUMN_ORDER,
  },
  {
    id: 'activeOnly',
    name: 'Active only',
    description: 'Status = Active',
    sorting: [] as SortingState,
    columnFilters: [
      {
        id: 'status',
        value: 'Active',
      },
    ] as ColumnFiltersState,
    globalFilter: '',
    columnVisibility: createAllVisible(),
    columnOrder: DEFAULT_COLUMN_ORDER,
  },
  {
    id: 'highAmount',
    name: 'High amount',
    description: 'Amount \u2265 10,000',
    sorting: [
      {
        id: 'amount',
        desc: true,
      },
    ] as SortingState,
    columnFilters: [
      {
        id: 'amount',
        value: '10000',
      },
    ] as ColumnFiltersState,
    globalFilter: '',
    columnVisibility: createAllVisible(),
    columnOrder: DEFAULT_COLUMN_ORDER,
  },
];
