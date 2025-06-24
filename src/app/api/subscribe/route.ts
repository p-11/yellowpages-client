import { BeehiivClient } from '@beehiiv/sdk';

const client = new BeehiivClient({ token: process.env.BEEHIV_API_KEY || '' });

export async function POST(request: Request) {
  try {
    if (process.env.BOT_PROTECTION_ENABLED === 'true') {
      return Response.json({}, { status: 500 });
    }

    const cfTurnstileToken = request.headers.get('X-CF-Turnstile-Token');
    const body = await request.json();

    if (!process.env.EMAIL_SIGN_UP_CLOUDFLARE_TURNSTILE_SECRET_KEY) {
      throw new Error('Invalid CF Turnstile secret key');
    }

    if (!cfTurnstileToken) {
      throw new Error('Invalid CF Turnstile token');
    }

    const formData = new FormData();

    formData.append(
      'secret',
      process.env.EMAIL_SIGN_UP_CLOUDFLARE_TURNSTILE_SECRET_KEY
    );
    formData.append('response', cfTurnstileToken);

    const cfVerificationResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        body: formData,
        method: 'POST'
      }
    );

    const cfVerificationResult = await cfVerificationResponse.json();

    if (!cfVerificationResult.success) {
      throw new Error('CF Turnstile verification failed');
    }

    await client.subscriptions.create(process.env.BEEHIV_PUB_ID as string, {
      email: body.email,
      referringSite: 'https://www.yellowpages.xyz'
    });
    return Response.json({ status: 'ok' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return Response.json({ status: 'error' });
  }
}
