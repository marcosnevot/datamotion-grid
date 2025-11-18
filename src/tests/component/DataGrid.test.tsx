// src/tests/component/DataGrid.test.tsx

import { describe, it, expect } from 'vitest';
import {
    render,
    screen,
    fireEvent,
    waitFor,
    within,
} from '@testing-library/react';
import { DataGrid } from '../../features/datagrid/components/DataGrid';

describe('DataGrid', () => {
    it('renders table with toolbar, stats bar and header filters', async () => {
        render(<DataGrid />);

        // Main table
        const table = await screen.findByRole('table');
        expect(table).toBeInTheDocument();

        // Toolbar: global search
        const searchInput = screen.getByPlaceholderText(
            /search in name, email, country/i,
        );
        expect(searchInput).toBeInTheDocument();

        // Stats bar: text "Showing X ..."
        const stats = screen.getByText(/showing/i);
        expect(stats).toBeInTheDocument();

        // Header with filters: at least one textbox in the thread
        const headerRowGroups = screen.getAllByRole('rowgroup');
        const thead = headerRowGroups[0];
        const headerTextInputs = within(thead).getAllByRole('textbox');
        expect(headerTextInputs.length).toBeGreaterThan(0);
    });

    it('applies a text column filter and updates filtered rows count in stats bar', async () => {
        render(<DataGrid />);

        // Initial text of the stats bar
        const statsBefore = await screen.findByText(/showing .* rows/i);
        const textBefore = statsBefore.textContent;

        const table = await screen.findByRole('table');

        // First text input within the table (filter row, for example "name")
        const textInputsInTable = within(table).getAllByRole('textbox');
        const nameFilterInput = textInputsInTable[0];

        // We applied a filter that will almost certainly reduce the visible rows.
        fireEvent.change(nameFilterInput, { target: { value: 'zzzzzz' } });

        await waitFor(() => {
            const statsAfter = screen.getByText(/showing .* rows/i);
            expect(statsAfter.textContent).not.toBe(textBefore);
        });
    });

    it('applies sorting on a column and toggles aria-sort on header', async () => {
        render(<DataGrid />);

        const idHeader = await screen.findByRole('columnheader', { name: /id/i });
        const sortButton = within(idHeader).getByRole('button', { name: /id/i });

        // No initial order
        expect(idHeader.getAttribute('aria-sort')).toBeNull();

        let firstSortValue: string | null = null;

        // First click: a valid value must appear
        fireEvent.click(sortButton);

        await waitFor(() => {
            const current = idHeader.getAttribute('aria-sort');
            expect(current === 'ascending' || current === 'descending').toBe(true);
            firstSortValue = current;
        });

        // Second click: you must change the value
        fireEvent.click(sortButton);

        await waitFor(() => {
            const current = idHeader.getAttribute('aria-sort');
            expect(current === 'ascending' || current === 'descending').toBe(true);
            expect(current).not.toBe(firstSortValue);
        });
    });

});
