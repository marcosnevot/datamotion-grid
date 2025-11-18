// src/features/datagrid/hooks/useGridPersistence.ts
import { useEffect } from 'react';
import { useGridStore } from '../store/gridStore';

const GRID_STORAGE_KEY = 'datamotion-grid:gridState:v1';

export const useGridPersistence = () => {
  const hydrateFromStorage = useGridStore(
    (state) => state.hydrateFromStorage,
  );
  const exportToStorage = useGridStore((state) => state.exportToStorage);

  const columnVisibility = useGridStore((state) => state.columnVisibility);
  const columnOrder = useGridStore((state) => state.columnOrder);
  const views = useGridStore((state) => state.views);
  const activeViewId = useGridStore((state) => state.activeViewId);

  // 1) Cargar estado persistido al montar
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(GRID_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return;

      hydrateFromStorage(parsed);
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn(
          '[DataGrid] Failed to hydrate grid state from localStorage',
          error,
        );
      }
    }
  }, [hydrateFromStorage]);

  // 2) Guardar cambios relevantes
  useEffect(() => {
    try {
      const snapshot = exportToStorage();
      window.localStorage.setItem(
        GRID_STORAGE_KEY,
        JSON.stringify(snapshot),
      );
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn(
          '[DataGrid] Failed to persist grid state to localStorage',
          error,
        );
      }
    }
  }, [exportToStorage, columnVisibility, columnOrder, views, activeViewId]);
};
