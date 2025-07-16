/**
 * Base domains per service and environment.
 */
const IS_PROD = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
export const domains = {
  verificationService: IS_PROD
    ? 'https://verification-api.yellowpages.xyz'
    : 'https://verification-api.yellowpages-development.xyz',
  proofService: IS_PROD
    ? 'wss://yellowpages-proof-service.app-d1312b66384d.enclave.evervault.com'
    : 'ws://localhost:8008'
};
