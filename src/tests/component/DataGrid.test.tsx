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

        // Tabla principal
        const table = await screen.findByRole('table');
        expect(table).toBeInTheDocument();

        // Toolbar: búsqueda global
        const searchInput = screen.getByPlaceholderText(
            /search in name, email, country/i,
        );
        expect(searchInput).toBeInTheDocument();

        // Stats bar: texto "Showing X ..."
        const stats = screen.getByText(/showing/i);
        expect(stats).toBeInTheDocument();

        // Cabecera con filtros: al menos un textbox en el thead
        const headerRowGroups = screen.getAllByRole('rowgroup');
        const thead = headerRowGroups[0];
        const headerTextInputs = within(thead).getAllByRole('textbox');
        expect(headerTextInputs.length).toBeGreaterThan(0);
    });

    it('applies a text column filter and updates filtered rows count in stats bar', async () => {
        render(<DataGrid />);

        // Texto inicial de la stats bar
        const statsBefore = await screen.findByText(/showing .* rows/i);
        const textBefore = statsBefore.textContent;

        const table = await screen.findByRole('table');

        // Primer input de texto dentro de la tabla (fila de filtros, por ejemplo "name")
        const textInputsInTable = within(table).getAllByRole('textbox');
        const nameFilterInput = textInputsInTable[0];

        // Aplicamos un filtro que casi seguro reducirá las filas visibles
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

        // Sin orden inicial
        expect(idHeader.getAttribute('aria-sort')).toBeNull();

        let firstSortValue: string | null = null;

        // Primer click: debe aparecer algún valor válido
        fireEvent.click(sortButton);

        await waitFor(() => {
            const current = idHeader.getAttribute('aria-sort');
            expect(current === 'ascending' || current === 'descending').toBe(true);
            firstSortValue = current;
        });

        // Segundo click: debe cambiar el valor
        fireEvent.click(sortButton);

        await waitFor(() => {
            const current = idHeader.getAttribute('aria-sort');
            expect(current === 'ascending' || current === 'descending').toBe(true);
            expect(current).not.toBe(firstSortValue);
        });
    });

});
