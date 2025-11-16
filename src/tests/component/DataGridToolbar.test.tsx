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

describe('DataGridToolbar', () => {
  beforeEach(() => {
    // Reset grid store to a known base state before each test
    useGridStore.setState({
      sorting: [] as SortingState,
      columnFilters: [] as ColumnFiltersState,
      globalFilter: '',
    });
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

    // Al escribir, primero solo cambia el estado local (searchText)
    fireEvent.change(searchInput, { target: { value: 'alice' } });

    // Todavía no debería haberse aplicado al store por el debounce
    expect(useGridStore.getState().globalFilter).toBe('');

    // Esperamos a que el debounce de 300ms actualice el store
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
    // Preparamos el store con filtros activos
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

    // Con filtros activos el botón debe estar habilitado
    expect(clearButton).not.toBeDisabled();

    fireEvent.click(clearButton);

    const { globalFilter, columnFilters } = useGridStore.getState();

    expect(globalFilter).toBe('');
    expect(columnFilters).toEqual([]);
  });
});
