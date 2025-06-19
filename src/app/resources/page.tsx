import { Metadata } from 'next';
import Link from 'next/link';
import styles from './styles.module.css';

export const metadata: Metadata = {
  title: 'Resources'
};

const resources = [
  {
    heading: 'Whitepaper',
    url: '/whitepaper/v1.0.0.pdf',
    displayUrl: 'https://www.yellowpages.xyz/whitepaper/v1.0.0.pdf'
  },
  {
    heading: 'Overview',
    url: 'https://blog.projecteleven.com/posts/hello-yellowpages',
    displayUrl: 'https://blog.projecteleven.com/posts/hello-yellowpages'
  },
  {
    heading: 'Trust Model of v1',
    url: 'https://blog.projecteleven.com/posts/the-trust-model-of-yellowpages-v1',
    displayUrl:
      'https://blog.projecteleven.com/posts/the-trust-model-of-yellowpages-v1'
  },
  {
    heading: 'Technical Deep Dive',
    url: '/technical-deep-dive/v1.0.0.pdf',
    displayUrl: 'https://www.yellowpages.xyz/technical-deep-dive/v1.0.0.pdf'
  },
  {
    heading: 'yellowpages Client Repository',
    url: 'https://github.com/p-11/yellowpages-client',
    displayUrl: 'https://github.com/p-11/yellowpages-client'
  },
  {
    heading: 'yellowpages Proof Service',
    url: 'https://github.com/p-11/yellowpages-proof-service',
    displayUrl: 'https://github.com/p-11/yellowpages-proof-service'
  },
  {
    heading: 'PQ Address - Rust',
    url: 'https://github.com/p-11/pq-address-rs',
    displayUrl: 'https://github.com/p-11/pq-address-rs'
  },
  {
    heading: 'PQ Address - TypeScript',
    url: 'https://github.com/p-11/pq-address-ts',
    displayUrl: 'https://github.com/p-11/pq-address-ts'
  },
  {
    heading: 'Cryptography Audit',
    url: 'https://cure53.de/audit-report_project-11-crypto.pdf',
    displayUrl: 'https://cure53.de/audit-report_project-11-crypto.pdf'
  },
  {
    heading: 'Web App & API Penetration Test & Audit',
    url: 'https://cure53.de/pentest-report_project-11-web.pdf',
    displayUrl: 'https://cure53.de/pentest-report_project-11-web.pdf'
  }
];

export default function ResourcesPage() {
  return (
    <main className={styles.main}>
      <Link href='/'>yellowpages.xyz</Link>
      <h1 className={styles.title}>Resources</h1>
      <div>
        {resources
          .sort((a, b) => a.heading.localeCompare(b.heading))
          .map((resource, index) => (
            <h2 key={index} className={styles.itemHeading}>
              {resource.heading}:{' '}
              <span>
                <Link href={resource.url} target='_blank'>
                  {resource.displayUrl}
                </Link>
              </span>
            </h2>
          ))}
      </div>
    </main>
  );
}
