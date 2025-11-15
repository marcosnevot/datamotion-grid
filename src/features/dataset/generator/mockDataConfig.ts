// src/features/dataset/generator/mockDataConfig.ts

import type { DatasetStatus } from '../types/datasetTypes';

export const ROW_COUNT_DEFAULT = 20_000;
export const DATASET_SEED = 42;

export const FIRST_NAMES: string[] = [
  'Alice',
  'Bob',
  'Charlie',
  'Diana',
  'Ethan',
  'Fiona',
  'George',
  'Hannah',
  'Ivan',
  'Julia',
];

export const LAST_NAMES: string[] = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Miller',
  'Davis',
  'Garcia',
  'Rodriguez',
  'Martinez',
];

export const EMAIL_DOMAINS: string[] = [
  'example.com',
  'acme.io',
  'datamotion.dev',
  'gridtools.app',
];

export const COUNTRIES: string[] = [
  'Spain',
  'Germany',
  'France',
  'United Kingdom',
  'United States',
  'Canada',
  'Brazil',
  'Japan',
  'Australia',
  'Netherlands',
];

export const STATUSES: DatasetStatus[] = ['Active', 'Pending', 'Inactive'];

export const AMOUNT_MIN = 10;
export const AMOUNT_MAX = 10_000;
