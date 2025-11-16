// src/features/datagrid/store/gridStore.ts
import { create } from 'zustand';
import type {
  ColumnFiltersState,
  SortingState,
} from '@tanstack/react-table';

export type GridStoreState = {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  setSorting: (updater: SortingState | ((prev: SortingState) => SortingState)) => void;
  setColumnFilters: (
    updater:
      | ColumnFiltersState
      | ((prev: ColumnFiltersState) => ColumnFiltersState),
  ) => void;
  setGlobalFilter: (updater: string | ((prev: string) => string)) => void;
  resetFilters: () => void;
  resetSorting: () => void;
};

export const useGridStore = create<GridStoreState>((set) => ({
  sorting: [],
  columnFilters: [],
  globalFilter: '',

  setSorting: (updater) =>
    set((state) => ({
      sorting:
        typeof updater === 'function' ? updater(state.sorting) : updater,
    })),

  setColumnFilters: (updater) =>
    set((state) => ({
      columnFilters:
        typeof updater === 'function'
          ? updater(state.columnFilters)
          : updater,
    })),

  setGlobalFilter: (updater) =>
    set((state) => ({
      globalFilter:
        typeof updater === 'function'
          ? updater(state.globalFilter)
          : updater,
    })),

  resetFilters: () =>
    set({
      columnFilters: [],
      globalFilter: '',
    }),

  resetSorting: () =>
    set({
      sorting: [],
    }),
}));
