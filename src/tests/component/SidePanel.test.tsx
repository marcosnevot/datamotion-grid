// src/tests/component/SidePanel.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { SelectedRowInfo } from '../../features/datagrid/types/gridTypes';

// Mock RowDetailPanel to focus on SidePanel wiring
vi.mock('../../features/datagrid/components/RowDetailPanel', () => ({
  RowDetailPanel: ({ selectedRowInfo }: { selectedRowInfo: SelectedRowInfo }) => (
    <div data-testid="row-detail-panel-mock">
      Selected: {selectedRowInfo.selectedCount}
    </div>
  ),
}));

import { SidePanel } from '../../components/layout/SidePanel';

describe('SidePanel', () => {
  const baseSelectedRowInfo: SelectedRowInfo = {
    selectedRow: null,
    selectedCount: 0,
    selectedIds: [],
    selectedRows: [],
  };

  it('renders heading, description and keyboard shortcuts', () => {
    render(<SidePanel selectedRowInfo={baseSelectedRowInfo} />);

    // Heading & description
    expect(
      screen.getByRole('heading', { name: /grid insight panel/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/live row details and keyboard shortcuts/i),
    ).toBeInTheDocument();

    // Keyboard shortcuts list
    expect(screen.getByText(/focus global search/i)).toBeInTheDocument();
    expect(
      screen.getByText(/toggle column configuration panel/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/apply preset views/i)).toBeInTheDocument();
  });

  it('passes selectedRowInfo to RowDetailPanel', () => {
    const selectedRowInfo: SelectedRowInfo = {
      selectedRow: null,
      selectedCount: 2,
      selectedIds: ['1', '2'],
      selectedRows: [],
    };

    render(<SidePanel selectedRowInfo={selectedRowInfo} />);

    const mock = screen.getByTestId('row-detail-panel-mock');
    expect(mock).toHaveTextContent('Selected: 2');
  });
});
