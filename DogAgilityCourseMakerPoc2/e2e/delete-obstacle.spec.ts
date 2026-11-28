import { expect, test } from '@playwright/test';
import { placeObstacle, selectObstacle } from './utils';

const DELETE_BUTTON = 'Delete the selected obstacle';

test.describe('Obstacle deletion', () => {
  test('deletes the selection with the sidebar button', async ({ page }) => {
    await page.goto('/');

    await placeObstacle(page, 'Jump', 300, 200);
    await selectObstacle(page, 300, 200);

    await page.getByRole('button', { name: DELETE_BUTTON }).click();

    await expect(page.getByTestId('status-count')).toHaveText('Obstacles: 0');
    await expect(page.getByTestId('status-selected')).toHaveCount(0);
    await expect(page.getByRole('button', { name: DELETE_BUTTON })).toHaveCount(
      0,
    );
  });

  test('deletes the selection with the Delete key', async ({ page }) => {
    await page.goto('/');

    await placeObstacle(page, 'Jump', 300, 200);
    await selectObstacle(page, 300, 200);

    // Focus the drawing area (the keyboard listener is window-level and
    // ignores input fields), then press Delete.
    await page
      .getByRole('group', { name: 'Agility course drawing area' })
      .press('Delete');

    await expect(page.getByTestId('status-count')).toHaveText('Obstacles: 0');
    await expect(page.getByTestId('status-selected')).toHaveCount(0);
  });
});
