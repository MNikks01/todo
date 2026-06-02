import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { registerNewUser } from './helpers';

// Accessibility pass (docs/testing.md §8, WCAG 2.1 AA core flows). We gate on
// serious/critical violations; moderate findings are tracked, not blocking.
function seriousViolations(violations: { impact?: string | null | undefined }[]) {
  return violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
}

test('login page has no serious accessibility violations', async ({ page }) => {
  await page.goto('/login');
  const results = await new AxeBuilder({ page }).analyze();
  expect(seriousViolations(results.violations)).toEqual([]);
});

test('register page has no serious accessibility violations', async ({ page }) => {
  await page.goto('/register');
  const results = await new AxeBuilder({ page }).analyze();
  expect(seriousViolations(results.violations)).toEqual([]);
});

test('authenticated todos page has no serious accessibility violations', async ({ page }) => {
  await registerNewUser(page);
  await page.getByLabel('New todo').fill('a11y check');
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByText('a11y check')).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(seriousViolations(results.violations)).toEqual([]);
});
