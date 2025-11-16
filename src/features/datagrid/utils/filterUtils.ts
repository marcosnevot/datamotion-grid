// src/features/datagrid/utils/filterUtils.ts
import type { FilterFn, Row } from '@tanstack/react-table';
import type { GridRow } from '../types/gridTypes';

const toStringSafe = (value: unknown): string =>
  value == null ? '' : String(value);

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

const getCellString = (row: Row<GridRow>, columnId: string): string =>
  toStringSafe(row.getValue(columnId));

const getCellNumber = (row: Row<GridRow>, columnId: string): number =>
  toNumberSafe(row.getValue(columnId));

const getCellTimestamp = (row: Row<GridRow>, columnId: string): number =>
  toTimestampSafe(row.getValue(columnId));

/**
 * Case-insensitive "contains" filter for string-like columns.
 * Empty filter means "no filter" (always true).
 */
export const includesString: FilterFn<GridRow> = (
  row,
  columnId,
  filterValue,
) => {
  const search = toStringSafe(filterValue).trim().toLowerCase();
  if (!search) {
    return true;
  }

  const cell = getCellString(row, columnId).toLowerCase();
  return cell.includes(search);
};

/**
 * String equality filter (case-insensitive by defecto).
 * Empty filter => no filter.
 */
export const equalsString: FilterFn<GridRow> = (
  row,
  columnId,
  filterValue,
) => {
  const expected = toStringSafe(filterValue).trim();
  if (!expected) {
    return true;
  }

  const cell = getCellString(row, columnId);
  return cell.toLowerCase() === expected.toLowerCase();
};

/**
 * "Value is in array" filter, pensado para selects multi-valor.
 * Si el array está vacío o no hay filtro, no filtra nada.
 */
export const inArray: FilterFn<GridRow> = (row, columnId, filterValue) => {
  if (filterValue == null) {
    return true;
  }

  const values = Array.isArray(filterValue) ? filterValue : [filterValue];
  if (!values.length) {
    return true;
  }

  const cell = getCellString(row, columnId);
  return values.some((v) => toStringSafe(v) === cell);
};

/**
 * Numeric "greater or equal" filter (>=).
 * Si el filtro no es numérico, se interpreta como "sin filtro".
 */
export const numberGreaterOrEqual: FilterFn<GridRow> = (
  row,
  columnId,
  filterValue,
) => {
  const threshold = toNumberSafe(filterValue);
  if (Number.isNaN(threshold)) {
    return true;
  }

  const value = getCellNumber(row, columnId);
  if (Number.isNaN(value)) {
    // Si el dato no es numérico, no pasa el filtro.
    return false;
  }

  return value >= threshold;
};

/**
 * Date "on or after" filter (>=).
 * Si la fecha de filtro es inválida o vacía, no filtra.
 * Si la fecha de la fila es inválida, se considera que no pasa el filtro.
 */
export const dateOnOrAfter: FilterFn<GridRow> = (
  row,
  columnId,
  filterValue,
) => {
  const from = toTimestampSafe(filterValue);
  if (Number.isNaN(from)) {
    return true;
  }

  const valueTs = getCellTimestamp(row, columnId);
  if (Number.isNaN(valueTs)) {
    return false;
  }

  return valueTs >= from;
};
