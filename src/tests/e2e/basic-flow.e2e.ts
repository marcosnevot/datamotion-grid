// src/tests/e2e/basic-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('DataMotion Grid – basic flow', () => {
  test('filters, toggles column visibility and shows row details', async ({ page }) => {
    // 1) Abrir la app
    await page.goto('/');

    // 2) Esperar a que el grid principal esté visible
    const table = page.getByRole('table');
    await expect(table).toBeVisible();

    // 3) Usar la búsqueda global (ajusta el selector si tu placeholder/texto es distinto)
    const searchInput = page
      .getByRole('textbox', { name: /search/i })
      .or(page.getByPlaceholder(/search/i));

    await searchInput.fill('Smith');

    // Pequeña espera para debounce / render
    await page.waitForTimeout(300);

    // 4) Verificar que el stats bar refleja algún cambio
    const statsBar = page.getByText(/showing .* rows/i);
    await expect(statsBar).toBeVisible();

    // 5) Abrir panel de columnas y ocultar una columna concreta
    const columnsButton = page.getByRole('button', { name: /columns/i });
    await columnsButton.click();

    const amountCheckbox = page.getByRole('checkbox', { name: /amount/i });
    await amountCheckbox.check();

    // Verificar que el header de esa columna ya no está visible
    await expect(
      page.getByRole('columnheader', { name: /amount/i }),
    ).toHaveCount(0);

    // 6) Seleccionar una fila y comprobar que el SidePanel está visible
    const firstRow = table.getByRole('row').nth(1); // saltamos header
    await firstRow.click();

    const sidePanel = page.getByText(/grid insight panel/i);
    await expect(sidePanel).toBeVisible();

    // 7) Recargar y comprobar que el grid vuelve a renderizar
    await page.reload();
    await expect(page.getByRole('table')).toBeVisible();
  });
});
