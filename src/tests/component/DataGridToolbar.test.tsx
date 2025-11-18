// src/tests/component/DataGridToolbar.test.tsx

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from '@testing-library/react';
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';
import { DataGridToolbar } from '../../features/datagrid/components/DataGridToolbar';
import { useGridStore } from '../../features/datagrid/store/gridStore';
import { PREDEFINED_VIEWS } from '../../features/datagrid/config/viewsConfig';

describe('DataGridToolbar', () => {
  beforeEach(() => {
    // Reset grid store to a known base state before each test
    useGridStore.setState((state) => ({
      ...state,
      sorting: [] as SortingState,
      columnFilters: [] as ColumnFiltersState,
      globalFilter: '',
      views: [],
      activeViewId: null,
    }));
  });

  afterEach(() => {
    cleanup();
  });

  it('renders global search input and clear filters button', () => {
    render(<DataGridToolbar />);

    const searchInput = screen.getByPlaceholderText(
      /search in name, email, country/i,
    );
    const clearButton = screen.getByRole('button', {
      name: /clear filters/i,
    });

    expect(searchInput).toBeInTheDocument();
    expect(clearButton).toBeInTheDocument();
  });

  it('debounces and updates globalFilter in the store when typing in search input', async () => {
    render(<DataGridToolbar />);

    const searchInput = screen.getByPlaceholderText(
      /search in name, email, country/i,
    );

    // When typing, only the local state (searchText) changes first.
    fireEvent.change(searchInput, { target: { value: 'alice' } });

    // It shouldn't have been applied to the store yet due to the debounce.
    expect(useGridStore.getState().globalFilter).toBe('');

    // We're waiting for the 300ms debounce update to come to the store.
    await waitFor(
      () => {
        expect(useGridStore.getState().globalFilter).toBe('alice');
      },
      { timeout: 500 },
    );
  });

  it('disables clear filters button when there is no search text or column filters', () => {
    render(<DataGridToolbar />);

    const clearButton = screen.getByRole('button', {
      name: /clear filters/i,
    });

    expect(clearButton).toBeDisabled();
  });

  it('clears globalFilter and columnFilters when clicking clear filters', () => {
    // We prepared the store with active filters.
    useGridStore.setState((state) => ({
      ...state,
      globalFilter: 'pending',
      columnFilters: [
        { id: 'status', value: 'Active' },
        { id: 'country', value: 'Spain' },
      ] as ColumnFiltersState,
    }));

    render(<DataGridToolbar />);

    const clearButton = screen.getByRole('button', {
      name: /clear filters/i,
    });

    // With filters active, the button should be enabled.
    expect(clearButton).not.toBeDisabled();

    fireEvent.click(clearButton);

    const { globalFilter, columnFilters } = useGridStore.getState();

    expect(globalFilter).toBe('');
    expect(columnFilters).toEqual([]);
  });

  it('focuses search input when pressing F', async () => {
    render(<DataGridToolbar />);

    const searchInput = screen.getByPlaceholderText(
      /search in name, email, country/i,
    );

    expect(searchInput).not.toHaveFocus();

    fireEvent.keyDown(window, { key: 'f' });

    await waitFor(() => {
      expect(searchInput).toHaveFocus();
    });
  });

  it('toggles column configuration panel with Alt + C', async () => {
    render(<DataGridToolbar />);

    expect(
      screen.queryByRole('dialog', {
        name: /column configuration/i,
      }),
    ).not.toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'c', altKey: true });

    expect(
      await screen.findByRole('dialog', {
        name: /column configuration/i,
      }),
    ).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'c', altKey: true });

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', {
          name: /column configuration/i,
        }),
      ).not.toBeInTheDocument();
    });
  });

  it('applies second preset view with Alt + 2', async () => {
    render(<DataGridToolbar />);

    const secondViewId = PREDEFINED_VIEWS[1]?.id;
    expect(secondViewId).toBeDefined();

    // Wait for the Bootstrap effect to initialize the views in the store
    await waitFor(() => {
      expect(useGridStore.getState().views.length).toBeGreaterThan(1);
    });

    fireEvent.keyDown(document, { key: '2', altKey: true });

    await waitFor(() => {
      const state = useGridStore.getState();
      expect(state.activeViewId).toBe(secondViewId);
    });
  });
});
