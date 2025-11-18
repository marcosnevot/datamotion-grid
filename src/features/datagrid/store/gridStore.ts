// src/features/datagrid/store/gridStore.ts
import { create } from 'zustand';
import type {
  ColumnFiltersState,
  SortingState,
  Updater,
} from '@tanstack/react-table';
import type {
  ColumnOrder,
  ColumnVisibilityState,
  GridColumnId,
  GridView,
  GridViewId,
  RowSelectionState,
} from '../types/gridTypes';

export interface GridStoreSnapshot {
  columnVisibility: ColumnVisibilityState;
  columnOrder: ColumnOrder;
  views: GridView[];
  activeViewId: GridViewId | null;
}

export type GridStoreState = {
  // Existing state
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;

  // New state (Phase 5)
  columnVisibility: ColumnVisibilityState;
  columnOrder: ColumnOrder;
  rowSelection: RowSelectionState;
  views: GridView[];
  activeViewId: GridViewId | null;

  // Existing actions
  setSorting: (
    updater: SortingState | ((prev: SortingState) => SortingState),
  ) => void;
  setColumnFilters: (
    updater:
      | ColumnFiltersState
      | ((prev: ColumnFiltersState) => ColumnFiltersState),
  ) => void;
  setGlobalFilter: (updater: string | ((prev: string) => string)) => void;
  resetFilters: () => void;
  resetSorting: () => void;

  // Column visibility actions
  setColumnVisibility: (next: ColumnVisibilityState) => void;
  toggleColumnVisibility: (columnId: GridColumnId) => void;
  resetColumnVisibility: () => void;

  // Column ordering actions
  setColumnOrder: (next: ColumnOrder) => void;
  moveColumn: (columnId: GridColumnId, targetIndex: number) => void;
  resetColumnOrder: () => void;

  // Row selection actions
  setRowSelection: (
    next: RowSelectionState | Updater<RowSelectionState>,
  ) => void;
  clearRowSelection: () => void;
  selectSingleRow: (rowId: string | null) => void;
  toggleRowSelection: (rowId: string) => void;

  // Views actions
  setViews: (views: GridView[]) => void;
  createView: (input: { name: string; description?: string }) => GridViewId;
  updateView: (id: GridViewId, patch: Partial<GridView>) => void;
  deleteView: (id: GridViewId) => void;
  applyView: (id: GridViewId) => void;

  // Persistence helpers (used by localStorage orchestration)
  hydrateFromStorage: (snapshot: Partial<GridStoreSnapshot>) => void;
  exportToStorage: () => GridStoreSnapshot;
};

const createViewId = (): GridViewId =>
  `view_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const useGridStore = create<GridStoreState>((set, get) => ({
  // --- Initial state ---

  sorting: [],
  columnFilters: [],
  globalFilter: '',

  columnVisibility: {},
  columnOrder: [],
  rowSelection: {},
  views: [],
  activeViewId: null,

  // --- Existing actions ---

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

  // --- Column visibility ---

  setColumnVisibility: (next) =>
    set({
      columnVisibility: { ...next },
    }),

  toggleColumnVisibility: (columnId) =>
    set((state) => {
      const current = state.columnVisibility[columnId];
      const isCurrentlyVisible = current !== false; // undefined o true => visible
      const nextValue = isCurrentlyVisible ? false : true;

      return {
        columnVisibility: {
          ...state.columnVisibility,
          [columnId]: nextValue,
        },
      };
    }),


  // Nota: el “default” real (todas visibles / config) se resolverá en useDataGrid.
  resetColumnVisibility: () =>
    set({
      columnVisibility: {},
    }),

  // --- Column ordering ---

  setColumnOrder: (next) =>
    set({
      columnOrder: [...next],
    }),

  moveColumn: (columnId, targetIndex) =>
    set((state) => {
      const currentOrder = state.columnOrder ?? [];
      const fromIndex = currentOrder.indexOf(columnId);

      if (fromIndex === -1 || currentOrder.length === 0) {
        return {
          columnOrder: currentOrder,
        };
      }

      const clampedIndex = Math.max(
        0,
        Math.min(targetIndex, currentOrder.length - 1),
      );

      if (fromIndex === clampedIndex) {
        return {
          columnOrder: currentOrder,
        };
      }

      const nextOrder = [...currentOrder];
      nextOrder.splice(fromIndex, 1);
      nextOrder.splice(clampedIndex, 0, columnId);

      return {
        columnOrder: nextOrder,
      };
    }),

  // Igual que visibilidad: el orden “default” se calculará según columnsDefinition.
  resetColumnOrder: () =>
    set({
      columnOrder: [],
    }),

  // --- Row selection ---

  setRowSelection: (updater) =>
    set((state) => {
      const nextRowSelection =
        typeof updater === 'function'
          ? (updater as Updater<RowSelectionState>)(state.rowSelection)
          : updater;

      return {
        rowSelection: nextRowSelection,
      };
    }),

  clearRowSelection: () =>
    set({
      rowSelection: {},
    }),

  // Single-select por defecto: una única fila seleccionada o ninguna.
  selectSingleRow: (rowId) =>
    set(() =>
      rowId
        ? {
          rowSelection: {
            [rowId]: true,
          },
        }
        : {
          rowSelection: {},
        },
    ),

  // Útil para futuro multi-select (Ctrl/Cmd + click).
  toggleRowSelection: (rowId) =>
    set((state) => {
      const isSelected = !!state.rowSelection[rowId];

      if (isSelected) {
        const next = { ...state.rowSelection };
        delete next[rowId];
        return { rowSelection: next };
      }

      return {
        rowSelection: {
          ...state.rowSelection,
          [rowId]: true,
        },
      };
    }),

  // --- Views ---

  setViews: (views) =>
    set({
      views,
    }),

  createView: (input) => {
    const { name, description } = input;
    const {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      columnOrder,
      views,
    } = get();

    const id = createViewId();

    const newView: GridView = {
      id,
      name,
      description,
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      columnOrder,
    };

    set({
      views: [...views, newView],
      activeViewId: id,
    });

    return id;
  },

  updateView: (id, patch) =>
    set((state) => ({
      views: state.views.map((view) =>
        view.id === id ? { ...view, ...patch } : view,
      ),
    })),

  deleteView: (id) =>
    set((state) => {
      const nextViews = state.views.filter((view) => view.id !== id);
      const nextActiveViewId =
        state.activeViewId === id ? null : state.activeViewId;

      return {
        views: nextViews,
        activeViewId: nextActiveViewId,
      };
    }),

  applyView: (id) =>
    set((state) => {
      const view = state.views.find((v) => v.id === id);
      if (!view) {
        return state;
      }

      return {
        sorting: view.sorting,
        columnFilters: view.columnFilters,
        globalFilter: view.globalFilter,
        columnVisibility: view.columnVisibility,
        columnOrder: view.columnOrder,
        activeViewId: view.id,
        // Al cambiar de vista limpiamos selección para evitar inconsistencias.
        rowSelection: {},
      };
    }),

  // --- Persistence helpers ---

  hydrateFromStorage: (snapshot) =>
    set(() => {
      const next: Partial<GridStoreState> = {};

      if (snapshot.columnVisibility) {
        next.columnVisibility = snapshot.columnVisibility;
      }

      if (snapshot.columnOrder) {
        next.columnOrder = snapshot.columnOrder;
      }

      if (snapshot.views) {
        next.views = snapshot.views;
      }

      if (typeof snapshot.activeViewId !== 'undefined') {
        next.activeViewId = snapshot.activeViewId;
      }

      return next;
    }),

  exportToStorage: () => {
    const { columnVisibility, columnOrder, views, activeViewId } = get();

    return {
      columnVisibility,
      columnOrder,
      views,
      activeViewId,
    };
  },
}));
