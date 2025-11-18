// src/tests/component/ColumnOrderingPanel.test.tsx

import { describe, it, beforeEach, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColumnOrderingPanel } from '../../features/datagrid/components/ColumnOrderingPanel';
import { useGridStore } from '../../features/datagrid/store/gridStore';
import { gridColumns } from '../../features/datagrid/config/columnsDefinition';
import type {
    ColumnOrder,
    ColumnVisibilityState,
} from '../../features/datagrid/types/gridTypes';

describe('ColumnOrderingPanel', () => {
    const defaultOrder: ColumnOrder = gridColumns.map((col) => col.id);
    const allVisible: ColumnVisibilityState = defaultOrder.reduce(
        (acc, id) => {
            acc[id] = true;
            return acc;
        },
        {} as ColumnVisibilityState,
    );

    beforeEach(() => {
        // Estado base: orden por defecto y todas visibles
        useGridStore.setState((state) => ({
            ...state,
            columnOrder: [...defaultOrder],
            columnVisibility: { ...allVisible },
        }));
    });

    it('renders at least the first two columns from current order', () => {
        render(<ColumnOrderingPanel />);

        const firstLabel = gridColumns[0].meta?.label ?? String(gridColumns[0].id);
        const secondLabel = gridColumns[1].meta?.label ?? String(gridColumns[1].id);

        expect(
            screen.getByText(new RegExp(firstLabel, 'i')),
        ).toBeInTheDocument();
        expect(
            screen.getByText(new RegExp(secondLabel, 'i')),
        ).toBeInTheDocument();
    });

    it('moves first column down when clicking its "Move id down" button', () => {
        render(<ColumnOrderingPanel />);

        const initialOrder = useGridStore.getState().columnOrder;
        const firstId = initialOrder[0];

        // Botón específico del primer item: "Move id down"
        const moveIdDownButton = screen.getByRole('button', {
            name: /move id down/i,
        });

        fireEvent.click(moveIdDownButton);

        const nextOrder = useGridStore.getState().columnOrder;

        // El id que estaba primero debe aparecer ahora en la posición 1
        expect(nextOrder[1]).toBe(firstId);
    });

    it('moves the second column up when clicking its "Move name up" button', () => {
        render(<ColumnOrderingPanel />);

        const initialOrder = useGridStore.getState().columnOrder;
        const secondId = initialOrder[1];

        // Botón "Move name up" (segunda columna en el orden por defecto)
        const moveNameUpButton = screen.getByRole('button', {
            name: /move name up/i,
        });

        fireEvent.click(moveNameUpButton);

        const nextOrder = useGridStore.getState().columnOrder;

        // El id que estaba en la posición 1 debería haber subido a la 0
        expect(nextOrder[0]).toBe(secondId);
    });

    it('reset button restores default order after reordering', () => {
        render(<ColumnOrderingPanel />);

        // Reordenamos algo primero con "Move id down"
        const moveIdDownButton = screen.getByRole('button', {
            name: /move id down/i,
        });
        fireEvent.click(moveIdDownButton);

        const changedOrder = useGridStore.getState().columnOrder;
        expect(changedOrder).not.toEqual(defaultOrder);

        // Botón Reset (dentro del propio panel de orden)
        const resetButton = screen.getByRole('button', { name: /reset/i });
        fireEvent.click(resetButton);

        const finalOrder = useGridStore.getState().columnOrder;

        // En este proyecto, "orden por defecto" se representa como array vacío
        // (la tabla interpreta [] como "usa el orden natural de columnas").
        expect(finalOrder).toEqual([]);
    });

});
