import type { NextConfig } from 'next';

const IS_PROD = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

const connectSrcValue = IS_PROD
  ? "'self' wss://yellowpages-proof-service.app-d1312b66384d.enclave.evervault.com https://verification-api.yellowpages.xyz"
  : "'self' wss://yellowpages-proof-service.app-0883710b5780.enclave.evervault.com https://verification-api.yellowpages-development.xyz";

const scriptSrcValue =
  process.env.NODE_ENV === 'production'
    ? "'self' 'unsafe-inline' https://challenges.cloudflare.com"
    : "'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com";

const contentSecurityPolicyValue = `
default-src 'self';
connect-src ${connectSrcValue};
script-src ${scriptSrcValue};
style-src 'self' 'unsafe-inline';
frame-src https://challenges.cloudflare.com;
img-src 'self' blob: data:;
font-src 'self';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests;
`;

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'Content-Security-Policy',
            value: contentSecurityPolicyValue.replace(/\n/g, ' ').trim()
          }
        ]
      }
    ];
  }
};

export default nextConfig;
