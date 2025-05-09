import { Metadata } from 'next';
import Link from 'next/link';
import styles from './page.module.css';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

export const metadata: Metadata = {
  title: 'Home'
};

export default function HomePage() {
  return (
    <main className={styles.homepage}>
      <h1 className={styles.title}>yellowpages.xyz</h1>
      <p className={styles.message}>
        Prepare your Bitcoin for a post-quantum world.
      </p>
      <div className={styles.links}>
        <Link className={styles.primaryLink} href='/register/step-1'>
          Register <ArrowRightIcon />
        </Link>
        <Link className={styles.secondaryLink} href='/search'>
          Check the directory
        </Link>
      </div>
    </main>
  );
}
