import { test, expect } from '@playwright/test';

test('registers, checks out, and sees order history', async ({ page }) => {
  const username = `qae2e-${Date.now()}`;
  const password = 'Password123!';

  await page.goto('/auth');

  await page.getByRole('tab', { name: 'Register' }).click();
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Register account' }).click();

  await expect(page.getByTestId('signed-in-user')).toContainText(username);

  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();

  await page.getByRole('button', { name: /Add Wireless Headphones to cart/i }).click();
  await expect(page.getByRole('link', { name: /Shopping cart with 1 items/i })).toBeVisible();

  await page.getByRole('link', { name: /Shopping cart with 1 items/i }).click();
  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();

  await page.getByLabel('Full Name').fill('QA E2E User');
  await page.getByLabel('Email').fill('qae2e@example.com');
  await page.getByLabel('Shipping Address').fill('123 High Street');
  await page.getByLabel('City').fill('Columbus');
  await page.getByLabel('State').selectOption({ label: 'Ohio' });
  await page.getByLabel('Zip Code').fill('43210');

  await page.getByRole('button', { name: 'Place your order' }).click();

  await expect(page.getByTestId('order-confirmation')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Order placed successfully!' })).toBeVisible();

  await page.getByRole('link', { name: 'Order History' }).click();

  await expect(page.getByTestId('order-history-list')).toBeVisible();
  await expect(page.getByTestId('order-history-item').first()).toContainText('Wireless Headphones x1');
});
