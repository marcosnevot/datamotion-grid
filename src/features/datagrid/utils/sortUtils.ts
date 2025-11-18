// src/features/datagrid/utils/sortUtils.ts
import type { SortingFn } from '@tanstack/react-table';
import type { GridRow } from '../types/gridTypes';

const toStringLower = (value: unknown): string =>
  value == null ? '' : String(value).toLowerCase();

const toNumberSafe = (value: unknown): number => {
  if (typeof value === 'number') {
    return value;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? NaN : parsed;
};

const toTimestampSafe = (value: unknown): number => {
  if (!value) {
    return NaN;
  }
  const date = new Date(String(value));
  const time = date.getTime();
  return Number.isNaN(time) ? NaN : time;
};

const STATUS_ORDER: Record<string, number> = {
  Active: 0,
  Pending: 1,
  Inactive: 2,
};

const statusRank = (value: unknown): number => {
  if (value == null) {
    return Number.POSITIVE_INFINITY;
  }
  const key = String(value);
  if (Object.prototype.hasOwnProperty.call(STATUS_ORDER, key)) {
    return STATUS_ORDER[key];
  }
  return Number.POSITIVE_INFINITY;
};

/**
 * Generic numeric ascending sort.
 * NaN is considered "greater" than any valid number (it goes at the end).
 */
export const sortByNumber: SortingFn<GridRow> = (rowA, rowB, columnId) => {
  const a = toNumberSafe(rowA.getValue(columnId));
  const b = toNumberSafe(rowB.getValue(columnId));

  const aNaN = Number.isNaN(a);
  const bNaN = Number.isNaN(b);

  if (aNaN && bNaN) {
    return 0;
  }
  if (aNaN) {
    return 1;
  }
  if (bNaN) {
    return -1;
  }

  if (a === b) {
    return 0;
  }
  return a < b ? -1 : 1;
};

/**
 * Case-insensitive string ascending sort using localeCompare.
 */
export const sortByString: SortingFn<GridRow> = (rowA, rowB, columnId) => {
  const a = toStringLower(rowA.getValue(columnId));
  const b = toStringLower(rowB.getValue(columnId));

  if (a === b) {
    return 0;
  }

  return a.localeCompare(b);
};

/**
 * Custom sort for status: Active < Pending < Inactive < (others/undefined).
 */
export const sortByStatus: SortingFn<GridRow> = (rowA, rowB, columnId) => {
  const aRank = statusRank(rowA.getValue(columnId));
  const bRank = statusRank(rowB.getValue(columnId));

  if (aRank === bRank) {
    return 0;
  }
  return aRank < bRank ? -1 : 1;
};

/**
 * Date ascending sort; Invalid values go to the end.
 */
export const sortByDate: SortingFn<GridRow> = (rowA, rowB, columnId) => {
  const a = toTimestampSafe(rowA.getValue(columnId));
  const b = toTimestampSafe(rowB.getValue(columnId));

  const aNaN = Number.isNaN(a);
  const bNaN = Number.isNaN(b);

  if (aNaN && bNaN) {
    return 0;
  }
  if (aNaN) {
    return 1;
  }
  if (bNaN) {
    return -1;
  }

  if (a === b) {
    return 0;
  }
  return a < b ? -1 : 1;
};
