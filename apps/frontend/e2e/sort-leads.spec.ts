import { expect, test } from '@playwright/test';
import { getApiBaseUrl } from './test-env';

test.describe('sort leads', () => {
  test('sorts by created date when order changes', async ({
    page,
    request,
  }) => {
    const suffix = `pw-${Date.now()}-${test.info().workerIndex}`;
    const sharedCompany = `SortCo-${suffix}`;
    const firstName = `SortA-${suffix}`;
    const secondName = `SortB-${suffix}`;
    const api = getApiBaseUrl();
    const firstRes = await request.post(`${api}/api/leads`, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        name: firstName,
        company: sharedCompany,
        status: 'NEW',
      },
    });
    expect(firstRes.ok()).toBeTruthy();
    await new Promise((resolve) => setTimeout(resolve, 1100));
    const secondRes = await request.post(`${api}/api/leads`, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        name: secondName,
        company: sharedCompany,
        status: 'NEW',
      },
    });
    expect(secondRes.ok()).toBeTruthy();
    await page.goto('/leads');
    await expect(page.getByText('Loading leads…')).toBeHidden();
    await page.getByLabel('Search').fill(sharedCompany);
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(
      page.locator('tbody tr').filter({ hasText: secondName }),
    ).toHaveCount(1);
    await expect(
      page.locator('tbody tr').filter({ hasText: firstName }),
    ).toHaveCount(1);
    await expect(page.locator('tbody tr').first()).toContainText(secondName);
    await page.getByLabel('Order').selectOption('asc');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.locator('tbody tr').first()).toContainText(firstName);
    await expect(page.locator('tbody tr').nth(1)).toContainText(secondName);
  });
});
