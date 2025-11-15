// src/features/datagrid/config/columnsDefinition.ts

import type { ColumnDef } from '@tanstack/react-table';
import type { GridColumnId, GridColumnMeta, GridRow } from '../types/gridTypes';

type GridColumnDef = ColumnDef<GridRow, unknown> & {
  id: GridColumnId;
  meta?: GridColumnMeta;
};

export const gridColumns: GridColumnDef[] = [
  {
    id: 'id',
    accessorKey: 'id',
    header: 'ID',
    meta: {
      label: 'ID',
      isNumeric: true,
      align: 'left',
      minWidth: 80,
    },
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    meta: {
      label: 'Name',
      align: 'left',
      minWidth: 160,
    },
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: 'Email',
    meta: {
      label: 'Email',
      align: 'left',
      minWidth: 220,
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    meta: {
      label: 'Status',
      align: 'left',
      minWidth: 110,
    },
  },
  {
    id: 'country',
    accessorKey: 'country',
    header: 'Country',
    meta: {
      label: 'Country',
      align: 'left',
      minWidth: 140,
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: 'Created at',
    meta: {
      label: 'Created at',
      align: 'left',
      minWidth: 140,
    },
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: 'Amount',
    meta: {
      label: 'Amount',
      align: 'right',
      isNumeric: true,
      minWidth: 120,
    },
  },
];
