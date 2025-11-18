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
      columnVisibility: {},
      columnOrder: [],
      rowSelection: {},
      views: [],
      activeViewId: null,
    });
  });

  it('initializes with expected default state', () => {
    const state = useGridStore.getState();

    expect(state.sorting).toEqual([]);
    expect(state.columnFilters).toEqual([]);
    expect(state.globalFilter).toBe('');

    expect(state.columnVisibility).toEqual({});
    expect(state.columnOrder).toEqual([]);
    expect(state.rowSelection).toEqual({});
    expect(state.views).toEqual([]);
    expect(state.activeViewId).toBeNull();
  });

  // --- Sorting / filters / global filter ---

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

  // --- Column visibility ---

  it('sets columnVisibility via setColumnVisibility', () => {
    const { setColumnVisibility } = useGridStore.getState();

    setColumnVisibility({ id: true, name: false });

    expect(useGridStore.getState().columnVisibility).toEqual({
      id: true,
      name: false,
    });
  });

  it('toggles column visibility via toggleColumnVisibility', () => {
    const { setColumnVisibility, toggleColumnVisibility } =
      useGridStore.getState();

    setColumnVisibility({ id: true, name: false });

    toggleColumnVisibility('id' as never);
    toggleColumnVisibility('name' as never);

    expect(useGridStore.getState().columnVisibility).toEqual({
      id: false,
      name: true,
    });
  });

  it('resetColumnVisibility clears visibility state', () => {
    const { setColumnVisibility, resetColumnVisibility } =
      useGridStore.getState();

    setColumnVisibility({ id: true, name: false });

    resetColumnVisibility();

    expect(useGridStore.getState().columnVisibility).toEqual({});
  });

  // --- Column ordering ---

  it('sets columnOrder via setColumnOrder', () => {
    const { setColumnOrder } = useGridStore.getState();

    setColumnOrder(['id', 'name', 'status'] as never[]);

    expect(useGridStore.getState().columnOrder).toEqual([
      'id',
      'name',
      'status',
    ]);
  });

  it('moves a column via moveColumn', () => {
    const { setColumnOrder, moveColumn } = useGridStore.getState();

    setColumnOrder(['id', 'name', 'status', 'amount'] as never[]);

    moveColumn('name' as never, 2);

    expect(useGridStore.getState().columnOrder).toEqual([
      'id',
      'status',
      'name',
      'amount',
    ]);
  });

  it('resetColumnOrder clears column order', () => {
    const { setColumnOrder, resetColumnOrder } = useGridStore.getState();

    setColumnOrder(['id', 'name'] as never[]);

    resetColumnOrder();

    expect(useGridStore.getState().columnOrder).toEqual([]);
  });

  // --- Row selection ---

  it('sets rowSelection via setRowSelection with direct value', () => {
    const { setRowSelection } = useGridStore.getState();

    setRowSelection({ row_1: true, row_2: false });

    expect(useGridStore.getState().rowSelection).toEqual({
      row_1: true,
      row_2: false,
    });
  });

  it('sets rowSelection via setRowSelection with functional updater', () => {
    const { setRowSelection } = useGridStore.getState();

    setRowSelection({ row_1: true });

    setRowSelection((prev) => ({
      ...prev,
      row_2: true,
    }));

    expect(useGridStore.getState().rowSelection).toEqual({
      row_1: true,
      row_2: true,
    });
  });

  it('clearRowSelection removes all selections', () => {
    const { setRowSelection, clearRowSelection } = useGridStore.getState();

    setRowSelection({ row_1: true, row_2: true });

    clearRowSelection();

    expect(useGridStore.getState().rowSelection).toEqual({});
  });

  it('selectSingleRow selects only one row at a time', () => {
    const { selectSingleRow } = useGridStore.getState();

    selectSingleRow('row_1');
    expect(useGridStore.getState().rowSelection).toEqual({ row_1: true });

    selectSingleRow('row_2');
    expect(useGridStore.getState().rowSelection).toEqual({ row_2: true });

    selectSingleRow(null);
    expect(useGridStore.getState().rowSelection).toEqual({});
  });

  it('toggleRowSelection toggles a row', () => {
    const { toggleRowSelection } = useGridStore.getState();

    toggleRowSelection('row_1');
    expect(useGridStore.getState().rowSelection).toEqual({ row_1: true });

    toggleRowSelection('row_1');
    expect(useGridStore.getState().rowSelection).toEqual({});
  });

  // --- Views ---

  it('setViews replaces current views', () => {
    const { setViews } = useGridStore.getState();

    setViews([
      {
        id: 'view_1',
        name: 'View 1',
        sorting: [],
        columnFilters: [],
        globalFilter: '',
        columnVisibility: {},
        columnOrder: [],
      },
    ]);

    expect(useGridStore.getState().views).toHaveLength(1);
    expect(useGridStore.getState().views[0].id).toBe('view_1');
  });

  it('createView captures current grid state and sets activeViewId', () => {
    const { setSorting, setGlobalFilter, setColumnVisibility, createView } =
      useGridStore.getState();

    setSorting([{ id: 'amount', desc: true }]);
    setGlobalFilter('foo');
    setColumnVisibility({ id: true });

    const viewId = createView({ name: 'My view', description: 'Test view' });

    const state = useGridStore.getState();
    const view = state.views.find((v) => v.id === viewId);

    expect(viewId).toMatch(/^view_/);
    expect(view).toBeDefined();
    expect(view?.name).toBe('My view');
    expect(view?.globalFilter).toBe('foo');
    expect(view?.sorting).toEqual([{ id: 'amount', desc: true }]);
    expect(view?.columnVisibility).toEqual({ id: true });
    expect(state.activeViewId).toBe(viewId);
  });

  it('updateView patches an existing view', () => {
    const { setViews, updateView } = useGridStore.getState();

    setViews([
      {
        id: 'view_1',
        name: 'Old name',
        sorting: [],
        columnFilters: [],
        globalFilter: '',
        columnVisibility: {},
        columnOrder: [],
      },
    ]);

    updateView('view_1', { name: 'New name', globalFilter: 'search' });

    const view = useGridStore
      .getState()
      .views.find((v) => v.id === 'view_1');

    expect(view?.name).toBe('New name');
    expect(view?.globalFilter).toBe('search');
  });

  it('deleteView removes view and clears activeViewId when needed', () => {
    const { setViews, deleteView } = useGridStore.getState();

    useGridStore.setState({
      activeViewId: 'view_2',
    });

    setViews([
      {
        id: 'view_1',
        name: 'View 1',
        sorting: [],
        columnFilters: [],
        globalFilter: '',
        columnVisibility: {},
        columnOrder: [],
      },
      {
        id: 'view_2',
        name: 'View 2',
        sorting: [],
        columnFilters: [],
        globalFilter: '',
        columnVisibility: {},
        columnOrder: [],
      },
    ]);

    deleteView('view_2');

    const stateAfterFirstDelete = useGridStore.getState();
    expect(stateAfterFirstDelete.views.map((v) => v.id)).toEqual(['view_1']);
    expect(stateAfterFirstDelete.activeViewId).toBeNull();

    deleteView('view_1');

    const stateAfterSecondDelete = useGridStore.getState();
    expect(stateAfterSecondDelete.views).toEqual([]);
    expect(stateAfterSecondDelete.activeViewId).toBeNull();
  });

  it('applyView updates grid state from given view and resets selection', () => {
    const { setViews, applyView, setRowSelection } = useGridStore.getState();

    setViews([
      {
        id: 'view_1',
        name: 'View 1',
        sorting: [{ id: 'amount', desc: true }],
        columnFilters: [{ id: 'status', value: 'Active' }],
        globalFilter: 'foo',
        columnVisibility: { id: true, name: false },
        columnOrder: ['id', 'name'] as never[],
      },
    ]);

    setRowSelection({ row_1: true });

    applyView('view_1');

    const state = useGridStore.getState();
    expect(state.sorting).toEqual([{ id: 'amount', desc: true }]);
    expect(state.columnFilters).toEqual([{ id: 'status', value: 'Active' }]);
    expect(state.globalFilter).toBe('foo');
    expect(state.columnVisibility).toEqual({ id: true, name: false });
    expect(state.columnOrder).toEqual(['id', 'name']);
    expect(state.activeViewId).toBe('view_1');
    expect(state.rowSelection).toEqual({});
  });

  // --- Persistence helpers ---

  it('exportToStorage returns a snapshot of persistent fields', () => {
    const {
      setColumnVisibility,
      setColumnOrder,
      setViews,
      exportToStorage,
    } = useGridStore.getState();

    setColumnVisibility({ id: true });
    setColumnOrder(['id', 'name'] as never[]);
    setViews([
      {
        id: 'view_1',
        name: 'View 1',
        sorting: [],
        columnFilters: [],
        globalFilter: '',
        columnVisibility: { id: true },
        columnOrder: ['id'] as never[],
      },
    ]);

    useGridStore.setState({ activeViewId: 'view_1' });

    const snapshot = exportToStorage();

    expect(snapshot.columnVisibility).toEqual({ id: true });
    expect(snapshot.columnOrder).toEqual(['id', 'name']);
    expect(snapshot.views).toHaveLength(1);
    expect(snapshot.activeViewId).toBe('view_1');
  });

  it('hydrateFromStorage applies snapshot to store', () => {
    const { hydrateFromStorage } = useGridStore.getState();

    hydrateFromStorage({
      columnVisibility: { id: true, name: false },
      columnOrder: ['name', 'id'] as never[],
      views: [
        {
          id: 'view_1',
          name: 'View 1',
          sorting: [],
          columnFilters: [],
          globalFilter: '',
          columnVisibility: { id: true },
          columnOrder: ['id'] as never[],
        },
      ],
      activeViewId: 'view_1',
    });

    const state = useGridStore.getState();

    expect(state.columnVisibility).toEqual({ id: true, name: false });
    expect(state.columnOrder).toEqual(['name', 'id']);
    expect(state.views).toHaveLength(1);
    expect(state.activeViewId).toBe('view_1');
  });
});
