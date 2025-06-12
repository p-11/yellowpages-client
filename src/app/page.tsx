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
          Bitcoin ownership.
        </p>
        <p>
          Read our <Link href='/faqs'>faqs</Link> or{' '}
          <Link href='/changelog'>changelog</Link> to learn more.
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
      {process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' && (
        <div className={styles.footer}>
          <p>Built by <Link href='https://projecteleven.com' target='_blank'>Project Eleven</Link></p>
          <iframe
            src='https://status.projecteleven.com/badge?theme=light'
            width='250'
            height='30'
            scrolling='no'
            style={{ colorScheme: 'normal', border: 0 }}
          />
        </div>
      )}
    </main>
  );
}
