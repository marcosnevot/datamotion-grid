// src/tests/unit/gridStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';
import { useGridStore } from '../../features/datagrid/store/gridStore';

describe('gridStore', () => {
  beforeEach(() => {
    // Reset relevant parts of the store before each test
    useGridStore.setState({
      sorting: [],
      columnFilters: [],
      globalFilter: '',
    });
  });

  it('initializes with empty sorting, filters and globalFilter', () => {
    const state = useGridStore.getState();
    expect(state.sorting).toEqual([]);
    expect(state.columnFilters).toEqual([]);
    expect(state.globalFilter).toBe('');
  });

  it('updates sorting via setSorting with direct value', () => {
    const { setSorting } = useGridStore.getState();
    const nextSorting: SortingState = [{ id: 'amount', desc: true }];

    setSorting(nextSorting);

    expect(useGridStore.getState().sorting).toEqual(nextSorting);
  });

  it('updates sorting via setSorting with functional updater', () => {
    const { setSorting } = useGridStore.getState();
    const initial: SortingState = [{ id: 'id', desc: false }];

    setSorting(initial);
    setSorting((prev) => prev.map((item) => ({ ...item, desc: !item.desc })));

    expect(useGridStore.getState().sorting).toEqual([
      { id: 'id', desc: true },
    ]);
  });

  it('updates columnFilters via setColumnFilters', () => {
    const { setColumnFilters } = useGridStore.getState();
    const nextFilters: ColumnFiltersState = [
      { id: 'name', value: 'john' },
      { id: 'status', value: 'Active' },
    ];

    setColumnFilters(nextFilters);

    expect(useGridStore.getState().columnFilters).toEqual(nextFilters);
  });

  it('updates globalFilter via setGlobalFilter with direct value', () => {
    const { setGlobalFilter } = useGridStore.getState();

    setGlobalFilter('search term');

    expect(useGridStore.getState().globalFilter).toBe('search term');
  });

  it('updates globalFilter via setGlobalFilter with functional updater', () => {
    const { setGlobalFilter } = useGridStore.getState();

    setGlobalFilter('foo');
    setGlobalFilter((prev) => `${prev}-bar`);

    expect(useGridStore.getState().globalFilter).toBe('foo-bar');
  });

  it('resetFilters clears columnFilters and globalFilter', () => {
    const { setColumnFilters, setGlobalFilter, resetFilters } =
      useGridStore.getState();

    setColumnFilters([{ id: 'country', value: 'Spain' }]);
    setGlobalFilter('test');

    resetFilters();

    const state = useGridStore.getState();
    expect(state.columnFilters).toEqual([]);
    expect(state.globalFilter).toBe('');
  });

  it('resetSorting clears sorting', () => {
    const { setSorting, resetSorting } = useGridStore.getState();

    setSorting([{ id: 'amount', desc: true }]);
    resetSorting();

    expect(useGridStore.getState().sorting).toEqual([]);
  });
});
