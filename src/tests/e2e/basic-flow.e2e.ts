// src/tests/e2e/basic-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('DataMotion Grid – basic flow', () => {
  test('filters, toggles column visibility and shows row details', async ({ page }) => {
    // 1) Open the app
    await page.goto('/');

    // 2) Wait until the main grid is visible
    const table = page.getByRole('table');
    await expect(table).toBeVisible();

    // 3) Use global search 
    const searchInput = page
      .getByRole('textbox', { name: /search/i })
      .or(page.getByPlaceholder(/search/i));

    await searchInput.fill('Smith');

    // Short wait for debounce/render
    await page.waitForTimeout(300);

    // 4) Verify that the stats bar reflects any change
    const statsBar = page.getByText(/showing .* rows/i);
    await expect(statsBar).toBeVisible();

    // 5) Open column panel and hide a specific column
    const columnsButton = page.getByRole('button', { name: /columns/i });
    await columnsButton.click();

    const amountCheckbox = page.getByRole('checkbox', { name: /amount/i });
    await amountCheckbox.check();

    // Verify that the header of that column is no longer visible
    await expect(
      page.getByRole('columnheader', { name: /amount/i }),
    ).toHaveCount(0);

    // 6) Select a row and verify that the SidePanel is visible
    const firstRow = table.getByRole('row').nth(1); // we skip header
    await firstRow.click();

    const sidePanel = page.getByText(/grid insight panel/i);
    await expect(sidePanel).toBeVisible();

    // 7) Reload and check that the grid is rendering again.
    await page.reload();
    await expect(page.getByRole('table')).toBeVisible();
  });
});
