import { expect, type Page } from '@playwright/test';

let counter = 0;

export function uniqueEmail(): string {
  counter += 1;
  return `e2e-${Date.now()}-${counter}@example.com`;
}

/** Register a fresh account via the UI and land on the authenticated home. */
export async function registerNewUser(page: Page, password = 'password123'): Promise<string> {
  const email = uniqueEmail();
  await page.goto('/register');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.getByRole('heading', { name: 'Todo' })).toBeVisible();
  return email;
}
