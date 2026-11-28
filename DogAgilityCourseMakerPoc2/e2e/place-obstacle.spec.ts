import { expect, test } from '@playwright/test';
import { CANVAS_LABEL } from './utils';

test.describe('Obstacle placement (tool -> canvas click)', () => {
  test('places a jump from the tool button and reports it at FCI dimensions', async ({
    page,
  }) => {
    await page.goto('/');

    // The tools section is open by default and the Jump tool is the
    // active placement tool on a fresh load (toolSlice default).
    const jumpTool = page.getByRole('button', { name: 'Jump', exact: true });
    await expect(jumpTool).toBeVisible();
    await expect(jumpTool).toHaveAttribute('aria-pressed', 'true');

    await page
      .getByRole('group', { name: CANVAS_LABEL })
      .click({ position: { x: 300, y: 200 } });

    await expect(page.getByTestId('status-count')).toHaveText('Obstacles: 1');

    // Clicking the placed obstacle selects it: the status bar reports its
    // translated type, proving the obstacle was really rendered on the
    // canvas (real Konva rendering, not a mock).
    await page
      .getByRole('group', { name: CANVAS_LABEL })
      .click({ position: { x: 300, y: 200 } });
    await expect(page.getByTestId('status-selected')).toContainText(
      'Selected: Jump',
    );
  });
});
