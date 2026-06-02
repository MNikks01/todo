import { expect, test } from '@playwright/test';
import { registerNewUser } from './helpers';

test('unauthenticated visit to a protected route redirects to login', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
});

test('register lands the user on the todos home', async ({ page }) => {
  await registerNewUser(page);
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText(/no todos yet/i)).toBeVisible();
});

test('login with wrong password shows a generic error', async ({ page }) => {
  const email = await registerNewUser(page);
  // Log out, then attempt a bad login.
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('wrong-password');
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page.getByRole('alert')).toContainText(/invalid email or password/i);
  await expect(page).toHaveURL(/\/login$/);
});

test('session persists across reload (silent refresh)', async ({ page }) => {
  await registerNewUser(page);
  await page.reload();
  // Still authenticated → stays on home, not redirected to login.
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { name: 'Todo' })).toBeVisible();
});

test('login screen rejects an empty/invalid form client-side', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByText(/enter a valid email/i)).toBeVisible();
});
