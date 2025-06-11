import type { NextConfig } from 'next';
import { domains } from '@/lib/domains';

const contentSecurityPolicyValue = `
default-src 'self';
connect-src 'self' ${domains.proofService} ${domains.verificationService};
script-src 'self' https://challenges.cloudflare.com 'unsafe-inline'${process.env.NODE_ENV === 'production' ? '' : " 'unsafe-eval'"};
style-src 'self' 'unsafe-inline';
frame-src https://challenges.cloudflare.com https://status.projecteleven.com;
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
