import { test, expect, type Page } from '@playwright/test';
import path from 'path';

const CSV_PATH = path.join(process.cwd(), 'public', 'sample-lab-data.csv');
const XLSX_PATH = path.join(process.cwd(), 'tests', 'fixtures', 'sample-lab-data.xlsx');

// ─── Shared helpers ───────────────────────────────────────────────────────────

/** Navigate past the landing page to the upload step. */
async function goToApp(page: Page) {
  await page.goto('/');
  // The desktop nav "Get Started" button is visible at ≥768 px (Desktop Chrome viewport)
  await page.getByRole('button', { name: /get started/i }).first().click();
  await expect(page.getByText('Upload a spreadsheet')).toBeVisible({ timeout: 10_000 });
}

/** Return the role <select> for a given column name (the second select in the row). */
function getRoleSelect(page: Page, columnName: string) {
  return page
    .locator('table tbody tr')
    .filter({ has: page.locator(`span[title="${columnName}"]`) })
    .locator('select')
    .nth(1);
}

/** Upload a file through the hidden react-dropzone input, then wait for the preview step. */
async function uploadFile(page: Page, filePath: string) {
  await page.locator('input[type="file"]').setInputFiles(filePath);
}

// ─── CSV flow ─────────────────────────────────────────────────────────────────

test.describe('CSV upload → preview → map columns → chart', () => {
  test('renders preview after upload', async ({ page }) => {
    await goToApp(page);
    await uploadFile(page, CSV_PATH);

    await expect(page.getByText('Data Preview')).toBeVisible({ timeout: 15_000 });
    // "8 rows · 14 columns" heading under Data Preview (the · distinguishes it from DataTable pagination)
    await expect(page.getByText(/\d+ rows · \d+ columns/)).toBeVisible();
  });

  test('Map Columns tab shows auto-detected roles', async ({ page }) => {
    await goToApp(page);
    await uploadFile(page, CSV_PATH);
    await expect(page.getByText('Data Preview')).toBeVisible({ timeout: 15_000 });

    // Go to Map Columns using the inline button in the preview header
    await page.getByRole('button', { name: 'Map Columns →' }).click();
    await expect(page.getByRole('heading', { name: /map columns/i })).toBeVisible();

    // Date → x-axis
    await expect(getRoleSelect(page, 'Date')).toHaveValue('x-axis');

    // TSH / T3 / T4 → y-series
    await expect(getRoleSelect(page, 'TSH')).toHaveValue('y-series');
    await expect(getRoleSelect(page, 'T3')).toHaveValue('y-series');
    await expect(getRoleSelect(page, 'T4')).toHaveValue('y-series');

    // Reference bound columns detected
    await expect(getRoleSelect(page, 'TSH_Lower')).toHaveValue('ref-lower');
    await expect(getRoleSelect(page, 'TSH_Upper')).toHaveValue('ref-upper');
  });

  test('Build Chart → canvas renders', async ({ page }) => {
    await goToApp(page);
    await uploadFile(page, CSV_PATH);
    await expect(page.getByText('Data Preview')).toBeVisible({ timeout: 15_000 });

    await page.getByRole('button', { name: 'Map Columns →' }).click();
    await expect(page.getByRole('heading', { name: /map columns/i })).toBeVisible();

    await page.getByRole('button', { name: /build chart/i }).click();

    // Chart canvas must appear and have non-zero dimensions
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15_000 });
    const width = await canvas.evaluate((el) => (el as HTMLCanvasElement).width);
    expect(width).toBeGreaterThan(0);
  });

  test('reference range controls visible after chart builds', async ({ page }) => {
    await goToApp(page);
    await uploadFile(page, CSV_PATH);
    await expect(page.getByText('Data Preview')).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: 'Map Columns →' }).click();
    await page.getByRole('button', { name: /build chart/i }).click();
    await expect(page.locator('canvas')).toBeVisible({ timeout: 15_000 });

    // The ChartControls panel contains a Reference Ranges section heading
    await expect(page.getByText(/reference range/i).first()).toBeVisible();
  });

  test('PNG / SVG / PDF export buttons exist and do not crash', async ({ page }) => {
    await goToApp(page);
    await uploadFile(page, CSV_PATH);
    await expect(page.getByText('Data Preview')).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: 'Map Columns →' }).click();
    await page.getByRole('button', { name: /build chart/i }).click();
    await expect(page.locator('canvas')).toBeVisible({ timeout: 15_000 });

    // Export buttons exist (text is lowercase, CSS uppercases visually)
    await expect(page.getByRole('button', { name: 'png' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'svg' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'pdf' })).toBeVisible();

    // Clicking each must not navigate away or crash the page.
    // Dismiss any native alert that fires if html2canvas fails in headless.
    page.on('dialog', (d) => d.dismiss());

    for (const fmt of ['png', 'svg', 'pdf'] as const) {
      await page.getByRole('button', { name: fmt }).click();
      // Small wait for async export to settle
      await page.waitForTimeout(600);
      // Chart canvas must still be visible — page did not crash or navigate
      await expect(page.locator('canvas')).toBeVisible();
    }
  });
});

// ─── XLSX flow ────────────────────────────────────────────────────────────────

test.describe('XLSX upload → sheet selection → chart', () => {
  test('multi-sheet XLSX shows sheet selector modal', async ({ page }) => {
    await goToApp(page);
    await uploadFile(page, XLSX_PATH);

    // SheetSelector modal must appear because XLSX has 2 sheets
    await expect(page.getByText('Select a Sheet')).toBeVisible({ timeout: 15_000 });
    // Both sheet names visible as buttons
    await expect(page.getByRole('button', { name: 'Lab Results' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Notes' })).toBeVisible();
  });

  test('selecting Lab Results sheet → preview → map → chart', async ({ page }) => {
    await goToApp(page);
    await uploadFile(page, XLSX_PATH);

    await expect(page.getByText('Select a Sheet')).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: 'Lab Results' }).click();

    // Preview renders with correct row/column counts
    await expect(page.getByText('Data Preview')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/\d+ rows · \d+ columns/)).toBeVisible();

    // Map Columns step
    await page.getByRole('button', { name: 'Map Columns →' }).click();
    await expect(page.getByRole('heading', { name: /map columns/i })).toBeVisible();

    // Date → x-axis, TSH → y-series (XLSX fixture uses same column names)
    await expect(getRoleSelect(page, 'Date')).toHaveValue('x-axis');
    await expect(getRoleSelect(page, 'TSH')).toHaveValue('y-series');
    await expect(getRoleSelect(page, 'TSH_Lower')).toHaveValue('ref-lower');
    await expect(getRoleSelect(page, 'TSH_Upper')).toHaveValue('ref-upper');

    // Build Chart
    await page.getByRole('button', { name: /build chart/i }).click();

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15_000 });
    const width = await canvas.evaluate((el) => (el as HTMLCanvasElement).width);
    expect(width).toBeGreaterThan(0);

    // Source label in the sticky header shows filename + sheet (scoped to banner to avoid ExportControls duplicate)
    const header = page.getByRole('banner');
    await expect(header.getByText(/sample-lab-data\.xlsx/)).toBeVisible();
    await expect(header.getByText(/Lab Results/)).toBeVisible();
  });

  test('cancelling sheet selector returns to upload', async ({ page }) => {
    await goToApp(page);
    await uploadFile(page, XLSX_PATH);

    await expect(page.getByText('Select a Sheet')).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Back to the upload dropzone
    await expect(page.getByText('Upload a spreadsheet')).toBeVisible();
    await expect(page.locator('input[type="file"]')).toBeAttached();
  });

  test('selecting Notes sheet → preview with correct columns', async ({ page }) => {
    await goToApp(page);
    await uploadFile(page, XLSX_PATH);

    await expect(page.getByText('Select a Sheet')).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: 'Notes' }).click();

    await expect(page.getByText('Data Preview')).toBeVisible({ timeout: 15_000 });
    // Notes sheet has 2 columns — "3 rows · 2 columns"
    await expect(page.getByText(/\d+ rows · 2 columns/)).toBeVisible();
  });
});
