import { chromium, type FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(baseURL!);

  const isDevelopmentBannerVisible = await page
    .getByText(
      'Note, this is a development environment. Do not register a Bitcoin address with mainnet funds.',
      { exact: true }
    )
    .isVisible();

  if (isDevelopmentBannerVisible) {
    await browser.close(); // and continue
  } else {
    throw new Error('Development banner not found. Cancelling all tests.');
  }
}

export default globalSetup;
