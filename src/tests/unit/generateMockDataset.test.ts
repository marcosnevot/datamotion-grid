// src/tests/unit/generateMockDataset.test.ts

import { describe, it, expect } from 'vitest';
import { generateMockDataset } from '../../features/dataset/generator/generateMockDataset';
import {
  AMOUNT_MIN,
  AMOUNT_MAX,
} from '../../features/dataset/generator/mockDataConfig';

describe('generateMockDataset', () => {
  it('generates the requested number of rows with sequential ids', () => {
    const rows = generateMockDataset(10, 123);

    expect(rows).toHaveLength(10);
    expect(rows[0].id).toBe(1);
    expect(rows[9].id).toBe(10);
  });

  it('is deterministic for the same seed and row count', () => {
    const first = generateMockDataset(15, 42);
    const second = generateMockDataset(15, 42);

    expect(second).toEqual(first);
  });

  it('produces different data for different seeds', () => {
    const a = generateMockDataset(5, 1);
    const b = generateMockDataset(5, 2);

    expect(b[0]).not.toEqual(a[0]);
  });

  it('generates rows with expected field shapes and value ranges', () => {
    const rows = generateMockDataset(20, 7);

    rows.forEach((row) => {
      expect(row.name).toBeTypeOf('string');
      expect(row.email).toBeTypeOf('string');
      expect(row.status === 'Active' || row.status === 'Inactive' || row.status === 'Pending').toBe(true);

      // ISO-like string that Date can parse
      expect(Number.isNaN(Date.parse(row.createdAt))).toBe(false);

      expect(row.amount).toBeGreaterThanOrEqual(AMOUNT_MIN);
      expect(row.amount).toBeLessThanOrEqual(AMOUNT_MAX);
    });
  });
});
