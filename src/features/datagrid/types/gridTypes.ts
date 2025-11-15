// src/features/datagrid/types/gridTypes.ts

import type { DatasetRow } from '../../dataset/types/datasetTypes';

export type GridRow = DatasetRow;

export type GridColumnId = keyof GridRow;

export type GridColumnAlign = 'left' | 'center' | 'right';

export interface GridColumnMeta {
  label: string;
  align?: GridColumnAlign;
  isNumeric?: boolean;
  minWidth?: number;
  maxWidth?: number;
}
