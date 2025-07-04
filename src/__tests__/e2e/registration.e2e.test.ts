import { test, expect, Page } from '@playwright/test';
import { generateMnemonic, mnemonicToSeedSync } from '@scure/bip39';
import { sign as signBitcoinMessage } from 'bitcoinjs-message';
import * as bitcoin from 'bitcoinjs-lib';
import { HDKey } from '@scure/bip32';
import { wordlist } from '@scure/bip39/wordlists/english';

/* eslint no-console: "off" */

let skipTests = false;

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('/register/step-1');

  if (
    await page
      .getByText('Registration is temporarily paused', { exact: true })
      .isVisible()
  ) {
    skipTests = true;
  }
});

test.beforeEach(() => {
  if (skipTests) {
    test.skip(true, 'Skipping test due to paused registrations.');
  }
});

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
    (await page.locator('span:near(:text("Copy"))').first().textContent()) ??
    ''; // find text nearest to the 'Copy' button
  return seedPhrase.split(' ');
};

test('successful registration and search result', async ({
  page
}, testInfo) => {
  testInfo.setTimeout(60000);
  page.on('websocket', ws => {
    console.log(`WebSocket opened: ${ws.url()}>`);
    ws.on('framesent', event => console.log('framesent', event.payload));
    ws.on('framereceived', event =>
      console.log('framereceived', event.payload)
    );
    ws.on('socketerror', event => console.log('socketerror', event));
    ws.on('close', () => console.log('WebSocket closed'));
  });

  const btcWallet = generateBtcWallet();

  // Homepage
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();

  // Step 1 page
  const seedWords = await getSeedWords(page);
  expect(seedWords).toHaveLength(24);

  await page.getByRole('button', { name: 'Continue', exact: true }).click();

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

  await expect(
    page.getByText('I want to permanently link my Bitcoin address')
  ).toBeVisible();
  const signingMessage =
    (await page.locator('span:above(:text("Copy"))').first().textContent()) ??
    ''; // find nearest text above the 'Copy' button
  const signature = signMessage(btcWallet.mnemonic, signingMessage);

  await page.getByLabel('3. Enter the generated signature').fill(signature);
  await page.getByRole('button', { name: 'Complete', disabled: false }).click();

  // Registration complete page
  await page.getByRole('button', { name: 'View and download proof' }).click();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('link', { name: 'searching the directory' }).click();

  // Search page
  await page.getByLabel('Bitcoin address:').fill(btcWallet.address);
  await page.getByRole('button', { name: 'Search' }).click();

  // Search result page
  await page.getByRole('button', { name: 'View and download proof' }).click();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(
    page.getByText(
      'Registered and cryptographically linked to post-quantum addresses'
    )
  ).toBeVisible();
});

test('successful registration when the Bitcoin address is changed', async ({
  page
}, testInfo) => {
  testInfo.setTimeout(60000);
  page.on('websocket', ws => {
    console.log(`WebSocket opened: ${ws.url()}>`);
    ws.on('framesent', event => console.log('framesent', event.payload));
    ws.on('framereceived', event =>
      console.log('framereceived', event.payload)
    );
    ws.on('socketerror', event => console.log('socketerror', event));
    ws.on('close', () => console.log('WebSocket closed'));
  });

  const btcWallet = generateBtcWallet();
  const btcWallet2 = generateBtcWallet();

  // Homepage
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();

  // Step 1 page
  const seedWords = await getSeedWords(page);
  expect(seedWords).toHaveLength(24);

  await page.getByRole('button', { name: 'Continue', exact: true }).click();

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

  const firstSigningMessage =
    (await page.locator('span:above(:text("Copy"))').first().textContent()) ??
    ''; // find nearest text above the 'Copy' button
  const firstSignature = signMessage(btcWallet.mnemonic, firstSigningMessage);
  await page
    .getByLabel('3. Enter the generated signature')
    .fill(firstSignature);

  await page.getByRole('button', { name: 'Edit', disabled: false }).click();

  await page
    .getByLabel('1. Enter your public Bitcoin address')
    .fill(btcWallet2.address);
  await page.getByRole('button', { name: 'Confirm' }).click();

  await expect(
    page.getByText(`Bitcoin address: ${btcWallet2.address}`)
  ).toBeVisible();
  await expect(page.getByLabel('3. Enter the generated signature')).toBeEmpty();

  const secondSigningMessage =
    (await page.locator('span:above(:text("Copy"))').first().textContent()) ??
    ''; // find nearest text above the 'Copy' button
  const secondSignature = signMessage(
    btcWallet2.mnemonic,
    secondSigningMessage
  );
  await page
    .getByLabel('3. Enter the generated signature')
    .fill(secondSignature);

  await page.getByRole('button', { name: 'Complete', disabled: false }).click();

  // Registration complete page
  await expect(page.getByText('Registration Complete!')).toBeVisible({
    timeout: 60000
  });
  await expect(page.getByText(btcWallet2.address)).toBeVisible();
});

test('step 2 should show a confirmed state when completed', async ({
  page
}) => {
  // Homepage
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();

  // Step 1 page
  const seedWords = await getSeedWords(page);
  expect(seedWords).toHaveLength(24);

  await page.getByRole('button', { name: 'Continue', exact: true }).click();

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
  await page.getByRole('button', { name: 'Back' }).click();

  // Step 2 page
  await expect(page.getByText('Seed phrase confirmed')).toBeVisible();
});

test('step 2 should not show a confirmed state when the session has refreshed', async ({
  page
}) => {
  // Homepage
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();

  // Step 1 page
  const seedWords = await getSeedWords(page);
  expect(seedWords).toHaveLength(24);

  await page.getByRole('button', { name: 'Continue', exact: true }).click();

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

  // Step 1 page
  await expect(page.getByText('Your session has refreshed')).toBeVisible();
  await page
    .locator(
      'button:has-text("continue"):below(:text("Your session has refreshed"))'
    )
    .first()
    .click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();

  // Step 2 page
  await expect(page.getByText('Register: Step 2')).toBeVisible();
  await expect(page.getByText('Seed phrase confirmed')).not.toBeVisible();
});

test('step 2 should not show a confirmed state when the previous session has expired', async ({
  page
}) => {
  await page.clock.install({ time: new Date() });

  // Homepage
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();

  // Step 1 page
  const seedWords = await getSeedWords(page);
  expect(seedWords).toHaveLength(24);

  await page.getByRole('button', { name: 'Continue', exact: true }).click();

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

  // Session expired page
  await page.getByRole('button', { name: 'Start again' }).click();

  // Step 1 page
  await page.getByRole('button', { name: 'Continue', exact: true }).click();

  // Step 2 page
  await expect(page.getByText('Register: Step 2')).toBeVisible();
  await expect(page.getByText('Seed phrase confirmed')).not.toBeVisible();
});

test('step 2 should not show a confirmed state when the previous session was cancelled', async ({
  page
}) => {
  await page.clock.install({ time: new Date() });

  // Homepage
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();

  // Step 1 page
  const seedWords = await getSeedWords(page);
  expect(seedWords).toHaveLength(24);

  await page.getByRole('button', { name: 'Continue', exact: true }).click();

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
  await page.getByRole('button', { name: 'Back' }).click();

  // Step 2 page
  await expect(page.getByText('Register: Step 2')).toBeVisible();
  await page.getByRole('button', { name: 'Back' }).click();

  // Step 1 page
  await expect(page.getByText('Register: Step 1')).toBeVisible();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();

  // Homepage
  await page.getByRole('link', { name: 'Register' }).click();

  // Step 1 page
  await page.getByRole('button', { name: 'Continue', exact: true }).click();

  // Step 2 page
  await expect(page.getByText('Register: Step 2')).toBeVisible();
  await expect(page.getByText('Seed phrase confirmed')).not.toBeVisible();
});

test('step 3 should reset when navigated away from', async ({ page }) => {
  const btcWallet = generateBtcWallet();

  await page.clock.install({ time: new Date() });

  // Homepage
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();

  // Step 1 page
  const seedWords = await getSeedWords(page);
  expect(seedWords).toHaveLength(24);

  await page.getByRole('button', { name: 'Continue', exact: true }).click();

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

  await expect(
    page.getByText('I want to permanently link my Bitcoin address')
  ).toBeVisible();

  await page.getByRole('button', { name: 'Back' }).click();

  // Step 2 page
  await expect(page.getByText('Register: Step 2')).toBeVisible();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();

  // Step 3 page
  await expect(
    page.getByText('I want to permanently link my Bitcoin address')
  ).not.toBeVisible();
});

test('confirm seed phrase successfully after undoing a selection', async ({
  page
}) => {
  // Homepage
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();

  // Step 1 page
  const seedWords = await getSeedWords(page);

  await page.getByRole('button', { name: 'Continue', exact: true }).click();

  // Step 2 page
  await page.getByRole('button', { name: 'Reveal words' }).click();

  for (let i = 0; i < seedWords.length - 2; i++) {
    await page
      .getByRole('button', { name: seedWords[i], exact: true, disabled: false })
      .first()
      .click();
  }

  // incorrect order
  await page
    .getByRole('button', {
      name: seedWords[seedWords.length - 1],
      exact: true,
      disabled: false
    })
    .first()
    .click();

  await page
    .getByRole('button', { name: 'Undo selection', exact: true })
    .click();

  // correct order
  await page
    .getByRole('button', {
      name: seedWords[seedWords.length - 2],
      exact: true,
      disabled: false
    })
    .first()
    .click();

  await page
    .getByRole('button', {
      name: seedWords[seedWords.length - 1],
      exact: true,
      disabled: false
    })
    .first()
    .click();

  await page.getByRole('button', { name: 'Confirm', exact: true }).click();

  // Step 3 page
  await expect(page.getByText('Register: Step 3')).toBeVisible();
});

test('unsuccessful registration attempt when the order of the seed phrase selected is incorrect', async ({
  page
}) => {
  // Homepage
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();

  // Step 1 page
  const seedWords = await getSeedWords(page);
  expect(seedWords).toHaveLength(24);

  await page.getByRole('button', { name: 'Continue', exact: true }).click();

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
    page
      .getByRole('button', {
        name: seedWords[0],
        exact: true,
        disabled: false
      })
      .first()
  ).toBeVisible();
});

test('unsuccessful registration attempt when an invalid Bitcoin address is entered', async ({
  page
}) => {
  // Homepage
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();

  // Step 1 page
  const seedWords = await getSeedWords(page);
  expect(seedWords).toHaveLength(24);

  await page.getByRole('button', { name: 'Continue', exact: true }).click();

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
  await page.getByRole('button', { name: 'Confirm', disabled: false }).click();

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
  await page.getByRole('button', { name: 'Continue', exact: true }).click();

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
  const seedWords = await getSeedWords(page);
  expect(seedWords).toHaveLength(24);

  await page.getByRole('button', { name: 'Continue', exact: true }).click();

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
  await page.getByRole('button', { name: 'Continue', exact: true }).click();

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
  const seedWords = await getSeedWords(page);
  expect(seedWords).toHaveLength(24);

  await page.getByRole('button', { name: 'Continue', exact: true }).click();

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

test('seed phrase visibility on step 1 should reset after 30 seconds', async ({
  page
}) => {
  await page.clock.install({ time: new Date() });

  // Homepage
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();

  // Step 1 page
  await page.getByRole('button', { name: 'Show' }).click();
  await expect(page.getByRole('button', { name: 'Hide' })).toBeVisible();

  await page.clock.fastForward('30');

  await expect(page.getByRole('button', { name: 'Show' })).toBeVisible();
});

test('unsuccessful search attempt when an invalid Bitcoin address is entered', async ({
  page
}) => {
  // Home page
  await page.goto('/');

  // Search page
  await page.getByRole('link', { name: 'Check the directory' }).click();
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
  await page.getByRole('link', { name: 'Check the directory' }).click();
  await page.getByLabel('Bitcoin address:').fill(btcWallet.address);
  await page.getByRole('button', { name: 'Search' }).click();

  // Search result page
  await expect(
    page.getByText(
      `Bitcoin address "${btcWallet.address}" is not in the directory.`
    )
  ).toBeVisible();
});
