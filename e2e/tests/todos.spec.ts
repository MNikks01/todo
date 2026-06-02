import { expect, test } from '@playwright/test';
import { registerNewUser } from './helpers';

test.beforeEach(async ({ page }) => {
  await registerNewUser(page);
});

test('create, complete, and delete a todo', async ({ page }) => {
  // Create
  await page.getByLabel('New todo').fill('Buy milk');
  await page.getByRole('button', { name: 'Add' }).click();
  const item = page.getByRole('listitem').filter({ hasText: 'Buy milk' });
  await expect(item).toBeVisible();

  // Complete (optimistic toggle — controlled checkbox, so click + assert)
  await item.getByRole('checkbox').click();
  await expect(item.getByRole('checkbox')).toBeChecked();

  // Delete
  await item.getByRole('button', { name: /delete/i }).click();
  await expect(page.getByText('Buy milk')).toHaveCount(0);
});

test('created todos persist across reload', async ({ page }) => {
  await page.getByLabel('New todo').fill('Persistent task');
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByText('Persistent task')).toBeVisible();

  await page.reload();
  await expect(page.getByText('Persistent task')).toBeVisible();
});

test('filter by status hides completed todos', async ({ page }) => {
  await page.getByLabel('New todo').fill('Active task');
  await page.getByRole('button', { name: 'Add' }).click();
  const item = page.getByRole('listitem').filter({ hasText: 'Active task' });
  await item.getByRole('checkbox').click();
  await expect(item.getByRole('checkbox')).toBeChecked();

  // Show only active → completed item disappears.
  await page.getByLabel('Status').selectOption('false');
  await expect(page.getByText('Active task')).toHaveCount(0);

  // Show completed → reappears.
  await page.getByLabel('Status').selectOption('true');
  await expect(page.getByText('Active task')).toBeVisible();
});

test('logout returns to login and protects the home route', async ({ page }) => {
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
});
