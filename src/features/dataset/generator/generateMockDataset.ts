// src/features/dataset/generator/generateMockDataset.ts

import type { DatasetRow } from '../types/datasetTypes';
import {
  AMOUNT_MAX,
  AMOUNT_MIN,
  COUNTRIES,
  DATASET_SEED,
  EMAIL_DOMAINS,
  FIRST_NAMES,
  LAST_NAMES,
  ROW_COUNT_DEFAULT,
  STATUSES,
} from './mockDataConfig';

function createRng(seed: number) {
  // Simple LCG, deterministic and sufficient for mocking
  let state = seed >>> 0;
  const A = 1664525;
  const C = 1013904223;
  const M = 2 ** 32;

  return () => {
    state = (A * state + C) % M;
    return state / M;
  };
}

function pick<T>(values: T[], rnd: () => number): T {
  const index = Math.floor(rnd() * values.length);
  return values[index];
}

function createDateFromOffset(daysOffset: number): string {
  // Base: 2020-01-01
  const baseTime = Date.UTC(2020, 0, 1);
  const date = new Date(baseTime + daysOffset * 24 * 60 * 60 * 1000);
  return date.toISOString();
}

export function generateMockDataset(
  rowCount: number = ROW_COUNT_DEFAULT,
  seed: number = DATASET_SEED,
): DatasetRow[] {
  const rnd = createRng(seed);
  const rows: DatasetRow[] = [];
  const maxDaysOffset = 365 * 3; // ~3 years

  for (let i = 0; i < rowCount; i += 1) {
    const firstName = pick(FIRST_NAMES, rnd);
    const lastName = pick(LAST_NAMES, rnd);
    const fullName = `${firstName} ${lastName}`;

    const domain = pick(EMAIL_DOMAINS, rnd);
    const normalizedLocalPart = `${firstName}.${lastName}`
      .toLowerCase()
      .replace(/\s+/g, '');
    const email = `${normalizedLocalPart}${i + 1}@${domain}`;

    const status = pick(STATUSES, rnd);
    const country = pick(COUNTRIES, rnd);

    const daysOffset = Math.floor(rnd() * maxDaysOffset);
    const createdAt = createDateFromOffset(daysOffset);

    const rawAmount = AMOUNT_MIN + rnd() * (AMOUNT_MAX - AMOUNT_MIN);
    const amount = Math.round(rawAmount * 100) / 100;

    rows.push({
      id: i + 1,
      name: fullName,
      email,
      status,
      createdAt,
      country,
      amount,
    });
  }

  return rows;
}
