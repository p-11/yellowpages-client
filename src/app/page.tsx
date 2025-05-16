import { Metadata } from 'next';
import Link from 'next/link';
import styles from './page.module.css';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

export const metadata: Metadata = {
  title: 'yellowpages',
  description:
    'Find yourself in the post quantum world - join the yellowpages.',
  openGraph: {
    images: ['/images/og-image.png'],
    type: 'website',
    url: 'https://yellowpages.xyz/',
    title: 'yellowpages',
    description:
      'Find yourself in the post quantum world - join the yellowpages.',
    siteName: 'yellowpages'
  }
};

export default function HomePage() {
  return (
    <main className={styles.homepage}>
      <h1 className={styles.title}>yellowpages.xyz</h1>
      <div className={styles.content}>
        <p>Find yourself in the post quantum world - join the yellowpages.</p>
        <p>
          The yellowpages is the only public, anonymous post-quantum proof of
          Bitcoin ownership.{' '}
          <Link href='/faqs'>Read our FAQs to learn more</Link>.
        </p>
      </div>
      <div className={styles.links}>
        <Link className={styles.primaryLink} href='/register/step-1'>
          Register <ArrowRightIcon />
        </Link>
        <Link className={styles.secondaryLink} href='/search'>
          Check the directory <ArrowRightIcon />
        </Link>
      </div>
    </main>
  );
}
