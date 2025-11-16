// src/features/datagrid/config/columnsDefinition.ts
import type { ColumnDef } from '@tanstack/react-table';
import type {
  GridRow,
  GridColumnId,
  GridColumnMeta,
} from '../types/gridTypes';
import {
  includesString,
  equalsString,
  numberGreaterOrEqual,
} from '../utils/filterUtils';
import {
  sortByNumber,
  sortByString,
  sortByStatus,
  sortByDate,
} from '../utils/sortUtils';

type GridColumnDef = ColumnDef<GridRow, unknown> & {
  id: GridColumnId;
  accessorKey: GridColumnId;
  meta: GridColumnMeta;
};

export const gridColumns: GridColumnDef[] = [
  {
    id: 'id',
    accessorKey: 'id',
    header: 'ID',
    meta: {
      label: 'ID',
      align: 'right',
      isNumeric: true,
    },
    enableSorting: true,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    sortingFn: sortByNumber,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    meta: {
      label: 'Name',
      align: 'left',
      filterType: 'text',
    },
    enableSorting: true,
    enableColumnFilter: true,
    enableGlobalFilter: true,
    sortingFn: sortByString,
    filterFn: includesString,
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: 'Email',
    meta: {
      label: 'Email',
      align: 'left',
      filterType: 'text',
    },
    enableSorting: true,
    enableColumnFilter: true,
    enableGlobalFilter: true,
    sortingFn: sortByString,
    filterFn: includesString,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    meta: {
      label: 'Status',
      align: 'center',
      filterType: 'select',
    },
    enableSorting: true,
    enableColumnFilter: true,
    enableGlobalFilter: false,
    sortingFn: sortByStatus,
    filterFn: equalsString,
  },
  {
    id: 'country',
    accessorKey: 'country',
    header: 'Country',
    meta: {
      label: 'Country',
      align: 'left',
      filterType: 'text',
    },
    enableSorting: true,
    enableColumnFilter: true,
    enableGlobalFilter: true,
    sortingFn: sortByString,
    filterFn: includesString,
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: 'Created at',
    meta: {
      label: 'Created at',
      align: 'left',
      filterType: 'date', // preparado para futuros filtros por fecha
    },
    enableSorting: true,
    enableColumnFilter: false, // filtro de fecha se activará en otra fase
    enableGlobalFilter: false,
    sortingFn: sortByDate,
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: 'Amount',
    meta: {
      label: 'Amount',
      align: 'right',
      isNumeric: true,
      filterType: 'number',
    },
    enableSorting: true,
    enableColumnFilter: true,
    enableGlobalFilter: false,
    sortingFn: sortByNumber,
    filterFn: numberGreaterOrEqual,
  },
];
