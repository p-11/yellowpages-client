/**
 * Types
 */
interface Proof {
  id: string;
  btc_address: string;
  ml_dsa_44_address: string;
  creation_date: string;
  version: string;
  proof: string;
  // if major version is 1, aws_nitro_pcr_measurement_set will be returned
  aws_nitro_pcr_measurement_set?: {
    id: string;
    creation_date: string;
    version: string;
    pcr_0: string;
    pcr_1: string;
    pcr_2: string;
    pcr_8: string;
  };
}

/**
 * Base domains per service and environment.
 */
const IS_PROD = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
const domains = {
  verificationService: IS_PROD
    ? 'https://verification-api.yellowpages.xyz'
    : 'https://verification-api.yellowpages-development.xyz',
  proofService: IS_PROD
    ? 'https://bar.foo.com'
    : 'https://yellowpages-proof-service.app-0883710b5780.enclave.evervault.com'
};

/**
 * Low-level wrapper around fetch.
 * - Throws on network errors.
 * - Throws on HTTP errors (non-2xx), including response text.
 * - Parses JSON.
 */
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      // set default headers here
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {})
      },
      ...options
    });
  } catch (e) {
    // networkError is e.g. DNS failure, offline, CORS issues, etc.
    throw new Error(`Network error while fetching ${url}: ${e}`);
  }

  // HTTP-level error
  if (!response.ok) {
    let errBody: unknown;
    try {
      errBody = await response.json();
    } catch {
      errBody = await response.text().catch(() => '');
    }
    const msg =
      typeof errBody === 'string'
        ? errBody
        : /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          ((errBody as any).error ?? JSON.stringify(errBody));
    throw new Error(`${response.status} ${response.statusText} ${msg}`);
  }

  // No content
  if (response.status === 204) {
    return {} as T;
  }

  // Try to parse JSON
  try {
    return (await response.json()) as T;
  } catch (parseError) {
    throw new Error(`Failed to parse JSON from ${url}: ${parseError}`);
  }
}

/**
 * Search yellowpages by BTC address
 */
export async function searchYellowpagesByBtcAddress(
  btcAddress: string
): Promise<Proof> {
  const url = `${domains.verificationService}/v1/proofs/by-btc-address/${encodeURIComponent(btcAddress)}`;
  return await request(url, { method: 'GET' });
}

/**
 * Create proof
 */
export async function createProof(body: {
  btcAddress: string;
  btcSignedMessage: string;
  mldsa44Address: string;
  mldsa44SignedMessage: string;
  mldsa44PublicKey: string;
}): Promise<void> {
  const url = `${domains.proofService}/prove`;
  return await request(url, {
    method: 'POST',
    body: JSON.stringify({
      bitcoin_address: body.btcAddress,
      bitcoin_signed_message: body.btcSignedMessage,
      ml_dsa_address: body.mldsa44Address,
      ml_dsa_signed_message: body.mldsa44SignedMessage,
      ml_dsa_public_key: body.mldsa44PublicKey
    })
  });
}

export const TEMP_BILLY_TO_REMOVE = async () => {
  try {
    const proof = await searchYellowpagesByBtcAddress(
      'bc1qpttqp409mq8jdvhcepvxqpek7ckvxqw28l5jac'
    );
    console.log(proof);
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
    else console.error(String(error));
  }
};
