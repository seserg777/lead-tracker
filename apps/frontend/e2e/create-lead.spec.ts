import { expect, test } from '@playwright/test';

test.describe('create lead', () => {
  test('submits the form and shows the new lead on the list', async ({
    page,
  }) => {
    const uniqueName = `pw-create-${Date.now()}`;
    await page.goto('/leads/new');
    await page.getByRole('textbox', { name: /Name/i }).fill(uniqueName);
    await page.getByRole('button', { name: 'Create lead' }).click();
    await expect(page).toHaveURL(/\/leads$/);
    await expect(page.getByText('Loading leads…')).toBeHidden();
    await expect(
      page.locator('tbody tr').filter({ hasText: uniqueName }),
    ).toHaveCount(1);
  });
});
