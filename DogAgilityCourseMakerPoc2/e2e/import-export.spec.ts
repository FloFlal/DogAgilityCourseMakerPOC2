import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { placeObstacle } from './utils';

const IMPORT_EXPORT_SECTION = 'Import/Export';

test.describe('Course import and export (.dacm.json)', () => {
  test('exports a valid .dacm.json carrying the FCI dimensions', async ({
    page,
  }) => {
    await page.goto('/');

    await placeObstacle(page, 'Jump', 300, 200);

    // Open the Import/Export accordion section, then export.
    await page
      .getByRole('button', { name: IMPORT_EXPORT_SECTION })
      .click();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Export', exact: true }).click(),
    ]);

    expect(download.suggestedFilename()).toBe('myCourse.dacm.json');

    const course = JSON.parse(
      await fs.readFile(await download.path(), 'utf-8'),
    ) as Array<Record<string, unknown>>;

    expect(course).toHaveLength(1);
    // FCI jump dimensions (OBSTACLE_SIZES.jump: hurdleDepth 40 px wide,
    // barWidth + 2 x hurdleWidth = 230 px tall).
    expect(course[0]).toMatchObject({
      type: 'jump',
      width: 40,
      height: 230,
      x: 300,
      y: 200,
      rotation: 0,
    });
    expect(typeof course[0].id).toBe('string');
    expect(course[0].fill).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  test('re-imports an exported course without error', async ({ page }) => {
    await page.goto('/');

    await placeObstacle(page, 'Jump', 300, 200);

    await page.getByRole('button', { name: IMPORT_EXPORT_SECTION }).click();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Export', exact: true }).click(),
    ]);
    const coursePath = await download.path();

    // Reload: the course lives only in memory, the grid starts empty.
    await page.reload();
    await expect(page.getByTestId('status-count')).toHaveText('Obstacles: 0');

    await page
      .getByRole('button', { name: IMPORT_EXPORT_SECTION })
      .click();
    await page
      .getByLabel('Course file to import')
      .setInputFiles(coursePath as string);

    await expect(page.getByTestId('status-count')).toHaveText('Obstacles: 1');
    await expect(page.getByRole('alert')).toHaveCount(0);
  });

  test('reports a translated error on an invalid import', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: IMPORT_EXPORT_SECTION }).click();
    // Write the invalid payload to a real temp file (setInputFiles with an
    // in-memory buffer is not reliable on every Chromium build).
    const brokenPath = path.join(os.tmpdir(), 'broken.dacm.json');
    await fs.writeFile(brokenPath, '{ not json', 'utf-8');

    await page.getByLabel('Course file to import').setInputFiles(brokenPath);

    // The error toast is translated in the current language (structured
    // i18n codes translated by the UI, review A5 / #71). The notification
    // hook clears the store error right after toasting, so the toast is
    // the user-visible feedback for an invalid import.
    await expect(page.getByText('Invalid JSON syntax')).toBeVisible();
    await expect(page.getByTestId('status-count')).toHaveText('Obstacles: 0');
  });
});
