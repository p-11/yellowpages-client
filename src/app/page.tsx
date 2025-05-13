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
      <p className={styles.message}>
        Find yourself in the post quantum world - join the yellowpages.
      </p>
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
