// src/tests/unit/sortUtils.test.ts
import { describe, it, expect } from 'vitest';
import type { Row } from '@tanstack/react-table';
import {
  sortByNumber,
  sortByString,
  sortByStatus,
  sortByDate,
} from '../../features/datagrid/utils/sortUtils';
import type { GridRow } from '../../features/datagrid/types/gridTypes';

const makeRow = (value: unknown): Row<GridRow> =>
  ({
    getValue: () => value,
  } as unknown as Row<GridRow>);


describe('sortUtils', () => {
  describe('sortByNumber', () => {
    it('sorts numbers ascending', () => {
      const rowSmall = makeRow(10);
      const rowBig = makeRow(20);

      expect(sortByNumber(rowSmall, rowBig, 'amount')).toBeLessThan(0);
      expect(sortByNumber(rowBig, rowSmall, 'amount')).toBeGreaterThan(0);
      expect(sortByNumber(rowSmall, makeRow(10), 'amount')).toBe(0);
    });

    it('treats NaN as greater than valid numbers', () => {
      const rowValid = makeRow(10);
      const rowNaN = makeRow('not-a-number');

      expect(sortByNumber(rowValid, rowNaN, 'amount')).toBeLessThan(0);
      expect(sortByNumber(rowNaN, rowValid, 'amount')).toBeGreaterThan(0);
    });
  });

  describe('sortByString', () => {
    it('sorts strings ascending ignoring case', () => {
      const rowA = makeRow('alice');
      const rowB = makeRow('Bob');

      expect(sortByString(rowA, rowB, 'name')).toBeLessThan(0);
      expect(sortByString(rowB, rowA, 'name')).toBeGreaterThan(0);
      expect(sortByString(makeRow('Same'), makeRow('same'), 'name')).toBe(0);
    });
  });

  describe('sortByStatus', () => {
    it('applies custom order Active < Pending < Inactive', () => {
      const active = makeRow('Active');
      const pending = makeRow('Pending');
      const inactive = makeRow('Inactive');

      expect(sortByStatus(active, pending, 'status')).toBeLessThan(0);
      expect(sortByStatus(pending, inactive, 'status')).toBeLessThan(0);
      expect(sortByStatus(inactive, active, 'status')).toBeGreaterThan(0);
    });

    it('puts unknown statuses at the end', () => {
      const active = makeRow('Active');
      const unknown = makeRow('Archived');

      expect(sortByStatus(active, unknown, 'status')).toBeLessThan(0);
      expect(sortByStatus(unknown, active, 'status')).toBeGreaterThan(0);
    });
  });

  describe('sortByDate', () => {
    it('sorts dates ascending', () => {
      const older = makeRow('2023-01-01');
      const newer = makeRow('2024-01-01');

      expect(sortByDate(older, newer, 'createdAt')).toBeLessThan(0);
      expect(sortByDate(newer, older, 'createdAt')).toBeGreaterThan(0);
      expect(sortByDate(makeRow('2024-01-01'), makeRow('2024-01-01'), 'createdAt')).toBe(0);
    });

    it('treats invalid dates as greater than valid ones', () => {
      const valid = makeRow('2024-01-01');
      const invalid = makeRow('not-a-date');

      expect(sortByDate(valid, invalid, 'createdAt')).toBeLessThan(0);
      expect(sortByDate(invalid, valid, 'createdAt')).toBeGreaterThan(0);
    });

    it('treats both invalid as equal', () => {
      const invalidA = makeRow('not-a-date');
      const invalidB = makeRow(null);

      expect(sortByDate(invalidA, invalidB, 'createdAt')).toBe(0);
    });
  });
});
