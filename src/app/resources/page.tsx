import { Metadata } from 'next';
import Link from 'next/link';
import styles from './styles.module.css';

export const metadata: Metadata = {
  title: 'Resources'
};

export default function ResourcesPage() {
  return (
    <main className={styles.main}>
      <Link href='/'>yellowpages.xyz</Link>
      <h1 className={styles.title}>Resources</h1>
      <div>
        <h2 className={styles.itemHeading}>
          Whitepaper:{' '}
          <span>
            <Link href='/whitepaper/v0.0.1.pdf' target='_blank'>
              https://www.yellowpages.xyz/whitepaper/v0.0.1.pdf
            </Link>
          </span>
        </h2>
        <h2 className={styles.itemHeading}>
          Overview:{' '}
          <span>
            <Link
              href='https://blog.projecteleven.com/posts/hello-yellowpages'
              target='_blank'
            >
              https://blog.projecteleven.com/posts/hello-yellowpages
            </Link>
          </span>
        </h2>
      </div>
    </main>
  );
}
