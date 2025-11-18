// src/features/datagrid/hooks/useDataGrid.ts

import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { useDataset } from '../../dataset/hooks/useDataset';
import { gridColumns } from '../config/columnsDefinition';
import { ENABLE_DEBUG_MEASURES } from '../config/gridSettings';
import type {
  GridRow,
  GridColumnId,
  SelectedRowInfo,
} from '../types/gridTypes';
import { useGridStore } from '../store/gridStore';
import { useGridPersistence } from './useGridPersistence';

export const useDataGrid = () => {
  // Enable lightweight persistence (columnVisibility, columnOrder, views, activeViewId)
  useGridPersistence();

  const { rows, isLoading, error } = useDataset({
    debugPerformance: ENABLE_DEBUG_MEASURES,
  });

  const {
    sorting,
    columnFilters,
    globalFilter,
    columnVisibility,
    columnOrder,
    rowSelection,
    setSorting,
    setColumnFilters,
    setGlobalFilter,
    setColumnVisibility,
    setColumnOrder,
    setRowSelection,
  } = useGridStore();

  const allColumnIds = useMemo(
    () => gridColumns.map((column) => column.id as GridColumnId),
    [],
  );

  const resolvedColumnVisibility = useMemo(() => {
    const visibility = { ...columnVisibility };
    const validIds = new Set(allColumnIds);

    Object.keys(visibility).forEach((key) => {
      if (!validIds.has(key as GridColumnId)) {
        delete visibility[key as GridColumnId];
      }
    });

    return visibility;
  }, [columnVisibility, allColumnIds]);

  const resolvedColumnOrder = useMemo(() => {
    if (!columnOrder || columnOrder.length === 0) {
      return allColumnIds;
    }

    const validIds = new Set(allColumnIds);
    const normalized = columnOrder.filter((id) =>
      validIds.has(id as GridColumnId),
    );

    allColumnIds.forEach((id) => {
      if (!normalized.includes(id)) {
        normalized.push(id);
      }
    });

    return normalized;
  }, [columnOrder, allColumnIds]);

  // TanStack Table is not yet compatible with the React Compiler rule used by this lint.
  // We intentionally opt out of this specific warning here.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable<GridRow>({
    data: rows,
    columns: gridColumns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility: resolvedColumnVisibility,
      columnOrder: resolvedColumnOrder,
      rowSelection,
    },
    getRowId: (row) => String(row.id),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
  });

  const selectedRowInfo: SelectedRowInfo = useMemo(() => {
    const hasSelection = Object.keys(rowSelection).length > 0;

    if (!hasSelection) {
      return {
        selectedRow: null,
        selectedCount: 0,
        selectedIds: [],
        selectedRows: [],
      };
    }

    const selectedRowsModel = table.getSelectedRowModel().flatRows ?? [];
    const selectedCount = selectedRowsModel.length;

    const selectedRow =
      selectedCount === 1
        ? (selectedRowsModel[0].original as GridRow)
        : null;

    const selectedIds = selectedRowsModel.map((row) =>
      String((row.original as GridRow).id),
    );

    const selectedRows = selectedRowsModel.map(
      (row) => row.original as GridRow,
    );

    return {
      selectedRow,
      selectedCount,
      selectedIds,
      selectedRows,
    };
  }, [table, rowSelection]);

  return {
    table,
    rowCount: rows.length,
    isLoading,
    error,
    selectedRowInfo,
  };
};
