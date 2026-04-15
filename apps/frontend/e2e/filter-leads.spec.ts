import { expect, test } from '@playwright/test';
import { getApiBaseUrl } from './test-env';

test.describe('filter leads', () => {
  test('filters by search text and by status', async ({ page, request }) => {
    const suffix = `pw-${Date.now()}-${test.info().workerIndex}`;
    const alphaName = `Alpha-${suffix}`;
    const betaName = `Beta-${suffix}`;
    const uniqueCompany = `UniqueCo-${suffix}`;
    const api = getApiBaseUrl();
    const createResNew = await request.post(`${api}/api/leads`, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        name: alphaName,
        company: uniqueCompany,
        status: 'NEW',
      },
    });
    expect(createResNew.ok()).toBeTruthy();
    const createResWon = await request.post(`${api}/api/leads`, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        name: betaName,
        company: `OtherCo-${suffix}`,
        status: 'WON',
      },
    });
    expect(createResWon.ok()).toBeTruthy();
    await page.goto('/leads');
    await expect(page.getByText('Loading leads…')).toBeHidden();
    await page.getByLabel('Search').fill(uniqueCompany);
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(
      page.locator('tbody tr').filter({ hasText: alphaName }),
    ).toHaveCount(1);
    await expect(
      page.locator('tbody tr').filter({ hasText: betaName }),
    ).toHaveCount(0);
    await page.getByLabel('Search').fill('');
    await page.getByRole('button', { name: 'Apply' }).click();
    await page.getByLabel('Status').selectOption('WON');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(
      page.locator('tbody tr').filter({ hasText: betaName }),
    ).toHaveCount(1);
    await expect(
      page.locator('tbody tr').filter({ hasText: alphaName }),
    ).toHaveCount(0);
  });

  test('reset clears search, status, sort, order and restores defaults', async ({
    page,
    request,
  }) => {
    const suffix = `pw-reset-${Date.now()}-${test.info().workerIndex}`;
    const alphaName = `Alpha-${suffix}`;
    const uniqueCompany = `UniqueCo-${suffix}`;
    const api = getApiBaseUrl();
    const createRes = await request.post(`${api}/api/leads`, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        name: alphaName,
        company: uniqueCompany,
        status: 'NEW',
      },
    });
    expect(createRes.ok()).toBeTruthy();
    await page.goto('/leads');
    await expect(page.getByText('Loading leads…')).toBeHidden();
    await page.getByLabel('Search').fill(uniqueCompany);
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(
      page.locator('tbody tr').filter({ hasText: alphaName }),
    ).toHaveCount(1);
    await page.getByLabel('Sort').selectOption('updatedAt');
    await page.getByLabel('Order').selectOption('asc');
    await page.getByLabel('Status').selectOption('WON');
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page.getByRole('button', { name: 'Reset' })).toBeDisabled();
    await expect(page.getByLabel('Search')).toHaveValue('');
    await expect(page.getByLabel('Sort')).toHaveValue('createdAt');
    await expect(page.getByLabel('Order')).toHaveValue('desc');
    await expect(page.getByLabel('Status')).toHaveValue('');
    await page.getByLabel('Search').fill(uniqueCompany);
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(
      page.locator('tbody tr').filter({ hasText: alphaName }),
    ).toHaveCount(1);
  });
});
