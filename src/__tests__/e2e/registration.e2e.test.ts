import { test, expect, Page } from '@playwright/test';
import { generateMnemonic, mnemonicToSeedSync } from '@scure/bip39';
import { sign as signBitcoinMessage } from 'bitcoinjs-message';
import * as bitcoin from 'bitcoinjs-lib';
import { HDKey } from '@scure/bip32';
import { wordlist } from '@scure/bip39/wordlists/english';

const generateBtcWallet = () => {
  const mnemonic = generateMnemonic(wordlist, 256);
  const seed = mnemonicToSeedSync(mnemonic);
  const masterNode = HDKey.fromMasterSeed(seed);
  const path = "m/44'/0'/0'/0/0";
  const child = masterNode.derive(path);
  if (!child.privateKey) {
    throw new Error('Could not derive private key');
  }
  if (!child.publicKey) {
    throw new Error('Could not derive public key');
  }
  const { address } = bitcoin.payments.p2wpkh({
    pubkey: Buffer.from(child.publicKey),
    network: bitcoin.networks.bitcoin
  });
  if (!address) {
    throw new Error('Address generation failed');
  }
  return {
    address,
    mnemonic
  };
};

const signMessage = (mnemonic: string, message: string): string => {
  // Re-create seed + root
  const seed = mnemonicToSeedSync(mnemonic);
  const masterNode = HDKey.fromMasterSeed(seed);
  const path = "m/44'/0'/0'/0/0";
  const child = masterNode.derive(path);
  if (!child.privateKey) {
    throw new Error('Could not derive private key');
  }
  if (!child.publicKey) {
    throw new Error('Could not derive public key');
  }
  // Sign the message (Bitcoin signed message format)
  const signature = signBitcoinMessage(
    message,
    Buffer.from(child.privateKey),
    true
  );

  // Return base64
  return signature.toString('base64');
};

const getSeedWords = async (page: Page) => {
  const seedPhrase =
    (await page.locator('span:above(:text("Copy"))').first().textContent()) ??
    ''; // find nearest text above the 'Copy' button
  return seedPhrase.split(' ');
};

test('successful registration and search result', async ({ page }) => {
  const btcWallet = generateBtcWallet();

  // Homepage
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();

  // Step 1 page
  await page.getByRole('button', { name: 'Copy' }).click();

  const seedWords = await getSeedWords(page);
  expect(seedWords).toHaveLength(24);

  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 2 page
  await expect(
    page.getByRole('button', { name: 'Confirm', exact: true })
  ).toBeDisabled();

  await page.getByRole('button', { name: 'Reveal words' }).click();

  for (const seedWord of seedWords) {
    await page
      .getByRole('button', { name: seedWord, exact: true, disabled: false })
      .first()
      .click();
  }

  await page.getByRole('button', { name: 'Confirm', exact: true }).click();

  // Step 3 page
  await page
    .getByLabel('1. Enter your public Bitcoin address')
    .fill(btcWallet.address);
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.getByRole('button', { name: 'Copy' }).click();

  const signingMessage =
    (await page.locator('span:above(:text("Copy"))').first().textContent()) ??
    ''; // find nearest text above the 'Copy' button
  const signature = signMessage(btcWallet.mnemonic, signingMessage);

  await page.getByLabel('3. Enter the generated signature').fill(signature);
  await page.getByRole('button', { name: 'Complete' }).click();

  // Registration complete page
  await page.getByRole('link', { name: 'searching the registry' }).click();

  // Search page
  await page.getByLabel('Bitcoin address:').fill(btcWallet.address);
  await page.getByRole('button', { name: 'Search' }).click();

  // Search result page
  await expect(
    page.getByText(
      'Registered and cryptographically linked to a post-quantum address'
    )
  ).toBeVisible();
});

test('unsuccessful registration attempt when the order of the seed phrase selected is incorrect', async ({
  page
}) => {
  // Homepage
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();

  // Step 1 page
  await page.getByRole('button', { name: 'Copy' }).click();

  const seedWords = await getSeedWords(page);
  expect(seedWords).toHaveLength(24);

  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 2 page
  await expect(
    page.getByRole('button', { name: 'Confirm', exact: true })
  ).toBeDisabled();

  await page.getByRole('button', { name: 'Reveal words' }).click();

  // reverse seed words to cause an incorrect selection
  seedWords.reverse();

  for (const seedWord of seedWords) {
    await page
      .getByRole('button', { name: seedWord, exact: true, disabled: false })
      .first()
      .click();
  }

  await page.getByRole('button', { name: 'Confirm', exact: true }).click();

  await expect(
    page.getByText('Incorrect order, please try again.')
  ).toBeVisible();

  await page.getByRole('button', { name: 'Try again', exact: true }).click();

  // ensure the seed words can be selected
  await expect(
    page.getByRole('button', {
      name: seedWords[0],
      exact: true,
      disabled: false
    })
  ).toBeVisible();
});

test('unsuccessful registration attempt when an invalid Bitcoin address is entered', async ({
  page
}) => {
  // Homepage
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();

  // Step 1 page
  await page.getByRole('button', { name: 'Copy' }).click();

  const seedWords = await getSeedWords(page);
  expect(seedWords).toHaveLength(24);

  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 2 page
  await expect(
    page.getByRole('button', { name: 'Confirm', exact: true })
  ).toBeDisabled();

  await page.getByRole('button', { name: 'Reveal words' }).click();

  for (const seedWord of seedWords) {
    await page
      .getByRole('button', { name: seedWord, exact: true, disabled: false })
      .first()
      .click();
  }

  await page.getByRole('button', { name: 'Confirm', exact: true }).click();

  // Step 3
  await page
    .getByLabel('1. Enter your public Bitcoin address')
    .fill('invalid-bitcoin-address');
  await page.getByRole('button', { name: 'Confirm' }).click();

  await expect(page.getByText('Invalid Bitcoin address')).toBeVisible();
});

test('unsuccessful registration attempt when the session expires on step 1', async ({
  page
}) => {
  await page.clock.install({ time: new Date() });

  // Homepage
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();

  // Step 1 page
  await expect(page.getByText('Register: Step 1')).toBeVisible();

  await page.clock.fastForward('30:00');

  await expect(
    page.getByText('Session expired', { exact: true })
  ).toBeVisible();
});

test('unsuccessful registration attempt when the session expires on step 2', async ({
  page
}) => {
  await page.clock.install({ time: new Date() });

  // Homepage
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();

  // Step 1 page
  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 2 page
  await expect(page.getByText('Register: Step 2')).toBeVisible();

  await page.clock.fastForward('30:00');

  await expect(
    page.getByText('Session expired', { exact: true })
  ).toBeVisible();
});

test('unsuccessful registration attempt when the session expires on step 3', async ({
  page
}) => {
  await page.clock.install({ time: new Date() });

  // Homepage
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();

  // Step 1 page
  await page.getByRole('button', { name: 'Copy' }).click();

  const seedWords = await getSeedWords(page);
  expect(seedWords).toHaveLength(24);

  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 2 page
  await expect(
    page.getByRole('button', { name: 'Confirm', exact: true })
  ).toBeDisabled();

  await page.getByRole('button', { name: 'Reveal words' }).click();

  for (const seedWord of seedWords) {
    await page
      .getByRole('button', { name: seedWord, exact: true, disabled: false })
      .first()
      .click();
  }

  await page.getByRole('button', { name: 'Confirm', exact: true }).click();

  // Step 3 page
  await expect(page.getByText('Register: Step 3')).toBeVisible();

  await page.clock.fastForward('30:00');

  await expect(
    page.getByText('Session expired', { exact: true })
  ).toBeVisible();
});

test('unsuccessful registration attempt when the session is refreshed on step 1', async ({
  page
}) => {
  // Homepage
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();

  // Step 1 page
  await expect(page.getByText('Register: Step 1')).toBeVisible();

  await page.reload();

  await expect(page.getByText('Your session has refreshed')).toBeVisible();
});

test('unsuccessful registration attempt when the session is refreshed on step 2', async ({
  page
}) => {
  // Homepage
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();

  // Step 1 page
  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 2 page
  await expect(page.getByText('Register: Step 2')).toBeVisible();

  await page.reload();

  await expect(page.getByText('Your session has refreshed')).toBeVisible();
});

test('unsuccessful registration attempt when the session is refreshed on step 3', async ({
  page
}) => {
  // Homepage
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();

  // Step 1 page
  await page.getByRole('button', { name: 'Copy' }).click();

  const seedWords = await getSeedWords(page);
  expect(seedWords).toHaveLength(24);

  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 2 page
  await expect(
    page.getByRole('button', { name: 'Confirm', exact: true })
  ).toBeDisabled();

  await page.getByRole('button', { name: 'Reveal words' }).click();

  for (const seedWord of seedWords) {
    await page
      .getByRole('button', { name: seedWord, exact: true, disabled: false })
      .first()
      .click();
  }

  await page.getByRole('button', { name: 'Confirm', exact: true }).click();

  // Step 3 page
  await expect(page.getByText('Register: Step 3')).toBeVisible();

  await page.reload();

  await expect(page.getByText('Your session has refreshed')).toBeVisible();
});

test('unsuccessful search attempt when an invalid Bitcoin address is entered', async ({
  page
}) => {
  // Home page
  await page.goto('/');

  // Search page
  await page.getByRole('link', { name: 'Check the registry' }).click();
  await page.getByLabel('Bitcoin address:').fill('invalid-bitcoin-address');
  await page.getByRole('button', { name: 'Search' }).click();

  await expect(page.getByText('Invalid Bitcoin address')).toBeVisible();
});

test('search result when the Bitcoin address entered is not registered', async ({
  page
}) => {
  const btcWallet = generateBtcWallet();

  // Home page
  await page.goto('/');

  // Search page
  await page.getByRole('link', { name: 'Check the registry' }).click();
  await page.getByLabel('Bitcoin address:').fill(btcWallet.address);
  await page.getByRole('button', { name: 'Search' }).click();

  // Search result page
  await expect(
    page.getByText(
      `Bitcoin address "${btcWallet.address}" is not on the registry.`
    )
  ).toBeVisible();
});
