import { test, expect } from '@playwright/test';

test('navigate to search from homepage', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Check the directory' }).click();

  await expect(page.getByLabel('Bitcoin address:')).toBeVisible();
});

test('unsuccessful search attempt when an invalid Bitcoin address is entered', async ({
  page
}) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Check the directory' }).click();
  await page.getByLabel('Bitcoin address:').fill('invalid-bitcoin-address');
  await page.getByRole('button', { name: 'Search' }).click();

  await expect(page.getByText('Invalid Bitcoin address')).toBeVisible();
});

test('search result when the Bitcoin address entered is not registered', async ({
  page
}) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Check the directory' }).click();
  await page
    .getByLabel('Bitcoin address:')
    .fill('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4');
  await page.getByRole('button', { name: 'Search' }).click();

  await expect(
    page.getByText(
      'Bitcoin address "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4" is not in the directory.'
    )
  ).toBeVisible();
});

test('successful search and proof retrieval for a registered address', async ({
  page
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Check the directory' }).click();

  await page
    .getByLabel('Bitcoin address:')
    .fill('bc1qppc0tmftkscwhqwlt4r9la9xvwd9nnjtugu2ky');
  await page.getByRole('button', { name: 'Search' }).click();

  await expect(
    page.getByText(
      'Registered and cryptographically linked to post-quantum addresses'
    )
  ).toBeVisible();

  await page.getByRole('button', { name: 'View and download proof' }).click();
  await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
});
