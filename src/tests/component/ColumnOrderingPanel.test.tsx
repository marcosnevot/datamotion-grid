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

        // "Move name up" button (second column in the default order)
        const moveNameUpButton = screen.getByRole('button', {
            name: /move name up/i,
        });

        fireEvent.click(moveNameUpButton);

        const nextOrder = useGridStore.getState().columnOrder;

        // The ID that was in position 1 should have moved up to position 0.
        expect(nextOrder[0]).toBe(secondId);
    });

    it('reset button restores default order after reordering', () => {
        render(<ColumnOrderingPanel />);

        // We reorder something first with "Move id down"
        const moveIdDownButton = screen.getByRole('button', {
            name: /move id down/i,
        });
        fireEvent.click(moveIdDownButton);

        const changedOrder = useGridStore.getState().columnOrder;
        expect(changedOrder).not.toEqual(defaultOrder);

        // Reset button (inside the command panel itself)
        const resetButton = screen.getByRole('button', { name: /reset/i });
        fireEvent.click(resetButton);

        const finalOrder = useGridStore.getState().columnOrder;

        // In this project, "default order" is represented as an empty array.
        // (the table interprets [] as "use the natural column order").
        expect(finalOrder).toEqual([]);
    });

});
