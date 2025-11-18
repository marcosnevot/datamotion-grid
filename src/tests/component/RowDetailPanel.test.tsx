// src/tests/component/RowDetailPanel.test.tsx

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RowDetailPanel } from '../../features/datagrid/components/RowDetailPanel';
import type {
  SelectedRowInfo,
  GridRow,
} from '../../features/datagrid/types/gridTypes';

const makeRow = (overrides?: Partial<GridRow>): GridRow => ({
  id: 1,
  name: 'Alice Doe',
  email: 'alice@example.com',
  status: 'Active',
  country: 'Spain',
  createdAt: '2024-01-01T10:00:00.000Z',
  amount: 1234.56,
  ...overrides,
});

describe('RowDetailPanel', () => {
  it('shows empty state when there is no selection', () => {
    const info: SelectedRowInfo = {
      selectedRow: null,
      selectedCount: 0,
      selectedIds: [],
      selectedRows: [],
    };

    render(<RowDetailPanel selectedRowInfo={info} />);

    expect(
      screen.getByText(/no rows? selected/i),
    ).toBeInTheDocument();
  });

  it('shows details of the single selected row', () => {
    const row = makeRow({
      name: 'Bob Smith',
      email: 'bob@example.com',
      country: 'Germany',
    });

    const info: SelectedRowInfo = {
      selectedRow: row,
      selectedCount: 1,
      selectedIds: [String(row.id)],
      selectedRows: [row],
    };

    render(<RowDetailPanel selectedRowInfo={info} />);

    expect(screen.getByText(/bob smith/i)).toBeInTheDocument();
    expect(screen.getByText(/bob@example\.com/i)).toBeInTheDocument();
  });

  it('shows summary when multiple rows are selected', () => {
    const rows: GridRow[] = [
      makeRow({ id: 1 }),
      makeRow({ id: 2 }),
      makeRow({ id: 3 }),
    ];

    const info: SelectedRowInfo = {
      selectedRow: null,
      selectedCount: 3,
      selectedIds: ['1', '2', '3'],
      selectedRows: rows,
    };

    render(<RowDetailPanel selectedRowInfo={info} />);

    // Resumen tipo "3 rows selected"
    expect(screen.getByText(/3.*selected/i)).toBeInTheDocument();
  });
});
