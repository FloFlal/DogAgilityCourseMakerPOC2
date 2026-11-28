import { expect, type Page } from '@playwright/test';

/** Accessible name of the drawing area (canvas.groupLabel, en locale). */
export const CANVAS_LABEL = 'Agility course drawing area';

/** Size of one grid cell (toolSlice.ts gridSize default). */
export const GRID_SIZE = 25;

/**
 * Activates the given tool button then places one obstacle with a canvas
 * click at the given position, and waits for the status bar to report it.
 * Clicking the already-active tool would disarm it (toggle), so the button
 * is only clicked when it is not pressed yet.
 */
export async function placeObstacle(
  page: Page,
  toolName: string,
  x: number,
  y: number,
): Promise<void> {
  const tool = page.getByRole('button', { name: toolName, exact: true });

  if ((await tool.getAttribute('aria-pressed')) !== 'true') {
    await tool.click();
    await expect(tool).toHaveAttribute('aria-pressed', 'true');
  }
  await page
    .getByRole('group', { name: CANVAS_LABEL })
    .click({ position: { x, y } });
  await expect(page.getByTestId('status-count')).toHaveText('Obstacles: 1');
}

/** Selects the obstacle previously placed at (x, y) by clicking on it. */
export async function selectObstacle(
  page: Page,
  x: number,
  y: number,
): Promise<void> {
  await page
    .getByRole('group', { name: CANVAS_LABEL })
    .click({ position: { x, y } });
  await expect(page.getByTestId('status-selected')).toBeVisible();
}

/** Reads the reported (x, y) position of the selected obstacle. */
export async function readSelectedPosition(
  page: Page,
): Promise<{ x: number; y: number }> {
  const text = await page.getByTestId('status-selected').textContent();
  const match = text?.match(/x (-?\d+) px — y (-?\d+) px/);

  if (!match) {
    throw new Error(`Cannot parse selected position from: ${text}`);
  }

  return { x: Number(match[1]), y: Number(match[2]) };
}
