// src/tests/component/DataGridStatsBar.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type {
  ColumnFiltersState,
  SortingState,
  Table,
} from '@tanstack/react-table';
import { DataGridStatsBar } from '../../features/datagrid/components/DataGridStatsBar';
import type { GridRow } from '../../features/datagrid/types/gridTypes';

type MockTableState = {
  columnFilters?: ColumnFiltersState;
  globalFilter?: string;
  sorting?: SortingState;
};

const createMockTable = ({
  filteredRowCount,
  state,
}: {
  filteredRowCount: number;
  state?: MockTableState;
}): Table<GridRow> =>
  ({
    getRowModel: () => ({
      rows: new Array(filteredRowCount).fill(null),
    }),
    getState: () => ({
      columnFilters: state?.columnFilters ?? [],
      globalFilter: state?.globalFilter ?? '',
      sorting: state?.sorting ?? [],
    }),
  } as unknown as Table<GridRow>);

describe('DataGridStatsBar', () => {
  it('shows total rows when there are no filters', () => {
    const table = createMockTable({ filteredRowCount: 50 });

    render(<DataGridStatsBar table={table} totalRowCount={50} />);

    expect(
      screen.getByText(/showing 50 rows/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/filters: none/i)).toBeInTheDocument();
    expect(screen.getByText(/sorting: none/i)).toBeInTheDocument();
  });

  it('shows filtered rows and filter/sorting counts when applied', () => {
    const table = createMockTable({
      filteredRowCount: 10,
      state: {
        columnFilters: [
          { id: 'status', value: 'Active' },
          { id: 'country', value: 'Spain' },
        ] as ColumnFiltersState,
        globalFilter: 'alice',
        sorting: [{ id: 'amount', desc: true }] as SortingState,
      },
    });

    render(<DataGridStatsBar table={table} totalRowCount={50} />);

    expect(
      screen.getByText(/showing 10 of 50 rows/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/filters: 3/i)).toBeInTheDocument();
    expect(screen.getByText(/sorting: 1 column/i)).toBeInTheDocument();
  });
});
