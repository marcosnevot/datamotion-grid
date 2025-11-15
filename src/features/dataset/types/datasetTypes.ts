// src/features/dataset/types/datasetTypes.ts

export type DatasetStatus = 'Active' | 'Inactive' | 'Pending';

export interface DatasetRow {
  id: number;
  name: string;
  email: string;
  status: DatasetStatus;
  createdAt: string; // ISO 8601 string
  country: string;
  amount: number;
}

export interface DatasetGenerationOptions {
  rowCount: number;
  seed?: number;
}
