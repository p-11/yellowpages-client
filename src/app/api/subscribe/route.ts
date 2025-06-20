import { BeehiivClient } from '@beehiiv/sdk';

const client = new BeehiivClient({ token: process.env.BEEHIV_API_KEY || '' });

export async function POST(request: Request) {
  try {
    const body = await request.json();
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
