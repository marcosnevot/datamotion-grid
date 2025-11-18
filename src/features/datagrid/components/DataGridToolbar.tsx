// src/features/datagrid/components/DataGridToolbar.tsx
import type { ChangeEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGridStore } from '../store/gridStore';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { createMotionTransition } from '../config/motionSettings';
import { ColumnVisibilityPanel } from './ColumnVisibilityPanel';
import type { GridViewId } from '../types/gridTypes';
import { PREDEFINED_VIEWS, DEFAULT_VIEW_ID } from '../config/viewsConfig';
import {
  isColumnPanelShortcut,
  getViewShortcutIndex,
} from '../../../utils/keyboard';

const TOOLBAR_TRANSITION = createMotionTransition('fast');

export const DataGridToolbar: React.FC = () => {
  const globalFilter = useGridStore((state) => state.globalFilter);
  const setGlobalFilter = useGridStore((state) => state.setGlobalFilter);
  const resetFilters = useGridStore((state) => state.resetFilters);
  const hasColumnFilters = useGridStore(
    (state) => state.columnFilters.length > 0,
  );

  const views = useGridStore((state) => state.views);
  const activeViewId = useGridStore((state) => state.activeViewId);
  const setViews = useGridStore((state) => state.setViews);
  const applyView = useGridStore((state) => state.applyView);
  const clearRowSelection = useGridStore((state) => state.clearRowSelection);

  const [searchText, setSearchText] = useState(globalFilter ?? '');
  const [isColumnsPanelOpen, setIsColumnsPanelOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(searchText, 300);
  const columnsPopoverRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setGlobalFilter(debouncedSearch);
  }, [debouncedSearch, setGlobalFilter]);

  // Alt + C → toggle column panel
  // Alt + 1/2/3... → apply view by index
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (isColumnPanelShortcut(event)) {
        event.preventDefault();
        setIsColumnsPanelOpen((prev) => !prev);
        return;
      }

      const viewIndex = getViewShortcutIndex(event, views.length);
      if (viewIndex !== null) {
        const targetView = views[viewIndex];
        if (targetView) {
          event.preventDefault();
          applyView(targetView.id as GridViewId);
          clearRowSelection();
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [views, applyView, clearRowSelection]);

  // Bootstrap predefined views if store is empty
  useEffect(() => {
    if (views.length === 0) {
      setViews(PREDEFINED_VIEWS);
      applyView(DEFAULT_VIEW_ID);
      clearRowSelection();
    }
  }, [views.length, setViews, applyView, clearRowSelection]);

  // Close columns panel on outside click / Escape
  useEffect(() => {
    if (!isColumnsPanelOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!columnsPopoverRef.current) return;
      const target = event.target as Node | null;
      if (target && !columnsPopoverRef.current.contains(target)) {
        setIsColumnsPanelOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsColumnsPanelOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isColumnsPanelOpen]);

  // Keyboard shortcut: F → focus global search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;

      const active = document.activeElement as HTMLElement | null;
      const tagName = active?.tagName?.toLowerCase() ?? '';

      const isEditable =
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        active?.isContentEditable;

      if (isEditable) return;

      if (
        (event.key === 'f' || event.key === 'F') &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey
      ) {
        event.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const handleClearFilters = () => {
    resetFilters();
    setSearchText('');
  };

  const handleToggleColumnsPanel = () => {
    setIsColumnsPanelOpen((prev) => !prev);
  };

  const handleViewChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextId = event.target.value as GridViewId | '';
    if (!nextId) {
      return;
    }
    applyView(nextId);
    clearRowSelection();
  };

  const hasActiveSearch = searchText.trim().length > 0;
  const isClearDisabled = !hasActiveSearch && !hasColumnFilters;

  const activeView = views.find((view) => view.id === activeViewId) ?? null;
  const viewSelectValue = activeView?.id ?? '';

  return (
    <motion.div
      className="mb-2 border-b border-slate-200 bg-slate-50/80 pb-2 text-xs dark:border-slate-800 dark:bg-slate-950/40"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={TOOLBAR_TRANSITION}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <input
            ref={searchInputRef}
            type="text"
            value={searchText}
            onChange={handleSearchChange}
            placeholder="Search in name, email, country..."
            aria-label="Search in name, email, country"
            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none transition focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          {/* Views selector (sm+ only) */}
          <div className="hidden sm:block">
            <label htmlFor="grid-view-select" className="sr-only">
              Select grid view
            </label>
            <select
              id="grid-view-select"
              value={viewSelectValue}
              onChange={handleViewChange}
              className="inline-flex h-[28px] items-center rounded-md border border-slate-200 bg-white px-2 text-[11px] font-medium text-slate-600 outline-none transition hover:bg-slate-100 focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <option value="">
                {activeView ? 'Custom view' : 'Select view'}
              </option>
              {views.map((view) => (
                <option key={view.id} value={view.id}>
                  {view.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleClearFilters}
            disabled={isClearDisabled}
            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Clear filters
          </button>

          <div className="relative" ref={columnsPopoverRef}>
            <button
              type="button"
              onClick={handleToggleColumnsPanel}
              aria-haspopup="dialog"
              aria-expanded={isColumnsPanelOpen}
              className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Columns
            </button>

            <AnimatePresence>
              {isColumnsPanelOpen && (
                <motion.div
                  key="columns-panel"
                  className="absolute right-0 z-20 mt-1"
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={TOOLBAR_TRANSITION}
                >
                  <ColumnVisibilityPanel />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
