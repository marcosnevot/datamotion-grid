// src/tests/component/ColumnVisibilityPanel.test.tsx

import { describe, it, beforeEach, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ColumnVisibilityState } from '../../features/datagrid/types/gridTypes';
import { ColumnVisibilityPanel } from '../../features/datagrid/components/ColumnVisibilityPanel';
import { useGridStore } from '../../features/datagrid/store/gridStore';
import { gridColumns } from '../../features/datagrid/config/columnsDefinition';

describe('ColumnVisibilityPanel', () => {
  beforeEach(() => {
    // Reasonable baseline state: all visible, without affecting the rest of the store
    const allVisible: ColumnVisibilityState = {};
    for (const col of gridColumns) {
      allVisible[col.id] = true;
    }

    useGridStore.setState((state) => ({
      ...state,
      columnVisibility: allVisible,
    }));
  });

  it('renders a list of columns with checkboxes', () => {
    render(<ColumnVisibilityPanel />);

    const nameCheckbox = screen.getByLabelText(
      /toggle visibility for name/i,
    ) as HTMLInputElement;

    expect(nameCheckbox).toBeInTheDocument();
    expect(nameCheckbox.type).toBe('checkbox');
    expect(nameCheckbox.checked).toBe(true);
  });

  it('toggles column visibility when a checkbox is clicked', () => {
    render(<ColumnVisibilityPanel />);

    const emailCheckbox = screen.getByLabelText(
      /toggle visibility for email/i,
    ) as HTMLInputElement;

    expect(emailCheckbox.checked).toBe(true);

    fireEvent.click(emailCheckbox);

    const state = useGridStore.getState();
    expect(state.columnVisibility.email).toBe(false);
  });

  it('does not allow hiding the last visible column', () => {
    // We force a state where only "id" is visible
    useGridStore.setState((state) => ({
      ...state,
      columnVisibility: {
        id: true,
        name: false,
        email: false,
        status: false,
        country: false,
        createdAt: false,
        amount: false,
      } as ColumnVisibilityState,
    }));

    render(<ColumnVisibilityPanel />);

    const idCheckbox = screen.getByLabelText(
      /toggle visibility for id/i,
    ) as HTMLInputElement;

    expect(idCheckbox).toBeDisabled();
    expect(idCheckbox.checked).toBe(true);

    expect(screen.getByText(/required/i)).toBeInTheDocument();
  });

  it('reset button restores default visibility state', () => {
    // We hide a column before rendering
    useGridStore.setState((state) => ({
      ...state,
      columnVisibility: {
        ...state.columnVisibility,
        email: false,
      },
    }));

    render(<ColumnVisibilityPanel />);

    const emailCheckbox = screen.getByLabelText(
      /toggle visibility for email/i,
    ) as HTMLInputElement;
    expect(emailCheckbox.checked).toBe(false);

    // There are two "Reset" buttons (header and an extra one), we use the first one (header)
    const [headerResetButton] = screen.getAllByRole('button', {
      name: /reset/i,
    });
    fireEvent.click(headerResetButton);

    const state = useGridStore.getState();
    expect(state.columnVisibility.email).not.toBe(false);
  });
});
