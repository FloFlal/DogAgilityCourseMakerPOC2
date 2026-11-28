import { expect, test } from '@playwright/test';
import {
  GRID_SIZE,
  placeObstacle,
  readSelectedPosition,
  selectObstacle,
} from './utils';

test.describe('Keyboard move (arrow keys)', () => {
  test('arrow moves the selection with a 1 px fine step', async ({ page }) => {
    await page.goto('/');

    await placeObstacle(page, 'Jump', 300, 200);
    await selectObstacle(page, 300, 200);

    const start = await readSelectedPosition(page);

    const canvas = page.getByRole('group', {
      name: 'Agility course drawing area',
    });
    for (let i = 0; i < 5; i += 1) {
      await canvas.press('ArrowRight');
    }
    for (let i = 0; i < 2; i += 1) {
      await canvas.press('ArrowDown');
    }

    await expect
      .poll(() => readSelectedPosition(page))
      .toEqual({ x: start.x + 5, y: start.y + 2 });
  });

  test('Shift + arrow moves the selection by a whole grid cell', async ({
    page,
  }) => {
    await page.goto('/');

    await placeObstacle(page, 'Jump', 300, 200);
    await selectObstacle(page, 300, 200);

    const start = await readSelectedPosition(page);

    const canvas = page.getByRole('group', {
      name: 'Agility course drawing area',
    });
    await canvas.press('Shift+ArrowLeft');
    await canvas.press('Shift+ArrowUp');

    await expect
      .poll(() => readSelectedPosition(page))
      .toEqual({ x: start.x - GRID_SIZE, y: start.y - GRID_SIZE });
  });
});
