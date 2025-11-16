import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/react-table';
import { useDataset } from '../../dataset/hooks/useDataset';
import { gridColumns } from '../config/columnsDefinition';
import { ENABLE_DEBUG_MEASURES } from '../config/gridSettings';
import type { GridRow } from '../types/gridTypes';
import { useGridStore } from '../store/gridStore';

export const useDataGrid = () => {
  const { rows, isLoading, error } = useDataset({
    debugPerformance: ENABLE_DEBUG_MEASURES,
  });

  const {
    sorting,
    columnFilters,
    globalFilter,
    setSorting,
    setColumnFilters,
    setGlobalFilter,
  } = useGridStore();

  // React Compiler: TanStack Table exposes non-memoizable functions; this hook is intentionally excluded from memoization.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable<GridRow>({
    data: rows,
    columns: gridColumns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return {
    table,
    rowCount: rows.length,
    isLoading,
    error,
  };
};
