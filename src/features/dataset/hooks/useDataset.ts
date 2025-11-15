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
 * Encapsula la obtención del dataset (mock en Fase 2).
 * Más adelante se podrá cambiar a fetch real sin tocar los consumidores.
 */
export function useDataset(options?: UseDatasetOptions): UseDatasetResult {
  const [rows, setRows] = useState<DatasetRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const rowCount = options?.rowCount ?? ROW_COUNT_DEFAULT;
    const seed = options?.seed ?? DATASET_SEED;
    const debugPerformance = options?.debugPerformance === true;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // En Fase 2 no dependemos de opciones reactivamente

  return { rows, isLoading, error };
}
