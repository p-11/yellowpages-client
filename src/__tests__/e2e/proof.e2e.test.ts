import { test, expect } from '@playwright/test';

test('register flow', async ({ page }) => {
  // Homepage
  await page.goto('/');

  await page.getByRole('link', { name: 'Register' }).click();

  // Step 1
  await expect(page.getByText('Register: Step 1')).toBeVisible();

  await page.getByRole('button', { name: 'Copy' }).click();

  const handle = await page.evaluateHandle(() =>
    navigator.clipboard.readText()
  );
  const clipboardContent = await handle.jsonValue();

  const seedWords = clipboardContent.split(' ');

  expect(seedWords).toHaveLength(24);

  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 2
  await expect(page.getByText('Register: Step 2')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Confirm' })).toBeDisabled();

  await page.getByRole('button', { name: 'Reveal words' }).click();

  for (const seedWord of seedWords) {
    await page
      .getByRole('button', { name: seedWord, exact: true })
      .first()
      .click();
  }

  await page.getByRole('button', { name: 'Confirm' }).click();

  // Step 3
  await expect(page.getByText('Register: Step 3')).toBeVisible();
});
