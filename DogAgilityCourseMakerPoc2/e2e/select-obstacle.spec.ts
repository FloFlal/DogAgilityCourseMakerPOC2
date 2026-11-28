import { expect, test } from '@playwright/test';
import { CANVAS_LABEL, placeObstacle, selectObstacle } from './utils';

const DELETE_BUTTON = 'Delete the selected obstacle';

test.describe('Obstacle selection', () => {
  test('clicking an obstacle deactivates the tool and shows the delete button', async ({
    page,
  }) => {
    await page.goto('/');

    await placeObstacle(page, 'Jump', 300, 200);

    // Tool still active before selection.
    const jumpTool = page.getByRole('button', { name: 'Jump', exact: true });
    await expect(jumpTool).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: DELETE_BUTTON })).toHaveCount(
      0,
    );

    await selectObstacle(page, 300, 200);

    // Mutual exclusion (US-027/A1): selecting deactivates the tool.
    await expect(jumpTool).toHaveAttribute('aria-pressed', 'false');
    // The delete action becomes available without any navigation.
    const deleteButton = page.getByRole('button', { name: DELETE_BUTTON });
    await expect(deleteButton).toBeVisible();
    await expect(page.getByTestId('status-selected')).toContainText(
      'Selected: Jump',
    );
  });

  test('clicking the background does not select anything', async ({ page }) => {
    await page.goto('/');

    await placeObstacle(page, 'Jump', 300, 200);
    // A background click with an active tool places another obstacle
    // instead of selecting (count goes to 2, no selection section).
    await page
      .getByRole('group', { name: CANVAS_LABEL })
      .click({ position: { x: 700, y: 500 } });

    await expect(page.getByTestId('status-count')).toHaveText('Obstacles: 2');
    await expect(page.getByRole('button', { name: DELETE_BUTTON })).toHaveCount(
      0,
    );
  });
});
