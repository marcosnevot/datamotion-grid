// src/features/datagrid/hooks/useDataGrid.ts

import type { Table } from '@tanstack/react-table';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useDataset } from '../../dataset/hooks/useDataset';
import { gridColumns } from '../config/columnsDefinition';
import type { GridRow } from '../types/gridTypes';
import { ENABLE_DEBUG_MEASURES } from '../config/gridSettings';

export interface UseDataGridResult {
  table: Table<GridRow>;
  rowCount: number;
  isLoading: boolean;
  error: Error | null;
}

/**
 * useDataGrid
 * Orquesta dataset + TanStack Table.
 * En Fase 2 solo usamos el coreRowModel, sin sorting ni filtros.
 */
export function useDataGrid(): UseDataGridResult {
  const { rows, isLoading, error } = useDataset({
    debugPerformance: ENABLE_DEBUG_MEASURES,
  });

  // React Compiler reports this as an incompatible library, but TanStack Table
  // is intentionally used in this hook and its APIs are designed to be stable.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable<GridRow>({
    data: rows,
    columns: gridColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return {
    table,
    rowCount: rows.length,
    isLoading,
    error,
  };
}
