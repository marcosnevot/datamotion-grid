// src/tests/unit/filterUtils.test.ts
import { describe, it, expect } from 'vitest';
import type { Row, FilterMeta } from '@tanstack/react-table';
import {
  includesString,
  equalsString,
  inArray,
  numberGreaterOrEqual,
  dateOnOrAfter,
} from '../../features/datagrid/utils/filterUtils';
import type { GridRow } from '../../features/datagrid/types/gridTypes';

const makeRow = (value: unknown): Row<GridRow> =>
  ({
    getValue: () => value,
  } as unknown as Row<GridRow>);

const noopAddMeta: (meta: FilterMeta) => void = () => {
  // no-op
};

describe('filterUtils', () => {
  describe('includesString', () => {
    it('returns true when filter is empty or whitespace', () => {
      const row = makeRow('John Doe');

      expect(includesString(row, 'name', '', noopAddMeta)).toBe(true);
      expect(includesString(row, 'name', '   ', noopAddMeta)).toBe(true);
    });

    it('performs case-insensitive contains match', () => {
      const row = makeRow('John DOE');

      expect(includesString(row, 'name', 'john', noopAddMeta)).toBe(true);
      expect(includesString(row, 'name', 'DOE', noopAddMeta)).toBe(true);
      expect(includesString(row, 'name', 'jane', noopAddMeta)).toBe(false);
    });

    it('handles null/undefined values as empty string', () => {
      const row = makeRow(null);

      expect(includesString(row, 'name', 'x', noopAddMeta)).toBe(false);
      expect(includesString(row, 'name', '', noopAddMeta)).toBe(true);
    });
  });

  describe('equalsString', () => {
    it('returns true when filter is empty', () => {
      const row = makeRow('Active');

      expect(equalsString(row, 'status', '', noopAddMeta)).toBe(true);
    });

    it('performs case-insensitive equality', () => {
      const row = makeRow('Active');

      expect(equalsString(row, 'status', 'Active', noopAddMeta)).toBe(true);
      expect(equalsString(row, 'status', 'active', noopAddMeta)).toBe(true);
      expect(equalsString(row, 'status', 'Inactive', noopAddMeta)).toBe(false);
    });

    it('handles null/undefined as empty', () => {
      const row = makeRow(undefined);

      expect(equalsString(row, 'status', '', noopAddMeta)).toBe(true);
      expect(equalsString(row, 'status', 'x', noopAddMeta)).toBe(false);
    });
  });

  describe('inArray', () => {
    it('returns true when filter array is empty or undefined', () => {
      const row = makeRow('Active');

      expect(inArray(row, 'status', [], noopAddMeta)).toBe(true);
      expect(inArray(row, 'status', undefined, noopAddMeta)).toBe(true);
    });

    it('performs case-insensitive membership check', () => {
      const row = makeRow('Active');

      expect(
        inArray(row, 'status', ['Inactive', 'Active'], noopAddMeta),
      ).toBe(true);
      expect(
        inArray(row, 'status', ['Inactive', 'Pending'], noopAddMeta),
      ).toBe(false);
    });
  });

  describe('numberGreaterOrEqual', () => {
    it('returns true when filter is not a valid number', () => {
      const row = makeRow(100);

      expect(
        numberGreaterOrEqual(row, 'amount', 'not-a-number', noopAddMeta),
      ).toBe(true);
      expect(numberGreaterOrEqual(row, 'amount', '', noopAddMeta)).toBe(true);
    });

    it('checks numeric value >= min (number or string)', () => {
      const row = makeRow(100);

      expect(numberGreaterOrEqual(row, 'amount', 50, noopAddMeta)).toBe(true);
      expect(numberGreaterOrEqual(row, 'amount', '50', noopAddMeta)).toBe(
        true,
      );
      expect(numberGreaterOrEqual(row, 'amount', 100, noopAddMeta)).toBe(true);
      expect(numberGreaterOrEqual(row, 'amount', 150, noopAddMeta)).toBe(
        false,
      );
    });

    it('handles NaN value as 0', () => {
      const row = makeRow('not-a-number');

      expect(numberGreaterOrEqual(row, 'amount', 10, noopAddMeta)).toBe(false);
    });
  });

  describe('dateOnOrAfter', () => {
    it('returns true when filter is empty or invalid', () => {
      const row = makeRow('2024-01-05T00:00:00.000Z');

      expect(dateOnOrAfter(row, 'createdAt', '', noopAddMeta)).toBe(true);
      expect(
        dateOnOrAfter(row, 'createdAt', 'not-a-date', noopAddMeta),
      ).toBe(true);
    });

    it('checks row date >= filter date', () => {
      const row = makeRow('2024-01-10T00:00:00.000Z');

      expect(
        dateOnOrAfter(row, 'createdAt', '2024-01-01', noopAddMeta),
      ).toBe(true);
      expect(
        dateOnOrAfter(row, 'createdAt', '2024-01-10', noopAddMeta),
      ).toBe(true);
      expect(
        dateOnOrAfter(row, 'createdAt', '2024-02-01', noopAddMeta),
      ).toBe(false);
    });

    it('handles invalid row date as not matching', () => {
      const row = makeRow('not-a-date');

      expect(
        dateOnOrAfter(row, 'createdAt', '2024-01-01', noopAddMeta),
      ).toBe(false);
    });
  });
});
