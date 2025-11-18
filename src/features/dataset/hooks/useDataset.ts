// src/features/dataset/hooks/useDataset.ts

import { useEffect, useState } from 'react';
import type { DatasetRow } from '../types/datasetTypes';
import { DATASET_SEED, ROW_COUNT_DEFAULT } from '../generator/mockDataConfig';
import { generateMockDataset } from '../generator/generateMockDataset';
import { measureSync } from '../../../utils/performance';

export interface UseDatasetOptions {
  rowCount?: number;
  seed?: number;
  /**
   * When true, the dataset generation time will be logged via console.debug.
   * Useful for local performance checks in development.
   */
  debugPerformance?: boolean;
}

export interface UseDatasetResult {
  rows: DatasetRow[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * useDataset
 * Encapsulates dataset retrieval.
 * Later we can switch to a real fetch without touching consumers.
 */
export function useDataset(options?: UseDatasetOptions): UseDatasetResult {
  const [rows, setRows] = useState<DatasetRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const rowCount = options?.rowCount ?? ROW_COUNT_DEFAULT;
  const seed = options?.seed ?? DATASET_SEED;
  const debugPerformance = options?.debugPerformance === true;

  useEffect(() => {
    try {
      const { result: data } = measureSync(
        'dataset:generateMockDataset',
        () => generateMockDataset(rowCount, seed),
        { log: debugPerformance },
      );

      setRows(data);
    } catch (err) {
      const normalizedError =
        err instanceof Error ? err : new Error('Failed to generate dataset');
      setError(normalizedError);
    } finally {
      setIsLoading(false);
    }
  }, [rowCount, seed, debugPerformance]);

  return { rows, isLoading, error };
}
