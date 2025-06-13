import type { NextConfig } from 'next';
import { domains } from '@/lib/domains';

const scriptSrcDirective = [
  "'self'",
  'https://challenges.cloudflare.com',
  "'unsafe-inline'",
  process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : null
]
  .filter(Boolean)
  .join(' ');

const contentSecurityPolicy = `
default-src 'self';
connect-src 'self' ${domains.proofService} ${domains.verificationService};
script-src ${scriptSrcDirective};
style-src 'self' 'unsafe-inline';
frame-src https://challenges.cloudflare.com https://status.projecteleven.com;
img-src 'self';
font-src 'self';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
${process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' || process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' ? 'upgrade-insecure-requests;' : ''}
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
            value: contentSecurityPolicy.replace(/\n/g, ' ').trim()
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp'
          }
        ]
      },
      {
        source: '/images/og-image.png',
        headers: [
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin'
          }
        ]
      },
      {
        source: '/og-image',
        headers: [
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
