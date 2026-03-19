'use client';

import Link from 'next/link';
import styles from '../../page.module.css';
import { ArrowRightIcon } from '../../icons/ArrowRightIcon';

export function HomeContent() {
  return (
    <main className={styles.homepage}>
      <h1 className={styles.title}>yellowpages is winding down</h1>
      <div className={styles.content}>
        <p>
          New proof creation is no longer available. If you previously created a
          proof, you can still retrieve it below.
        </p>
        <p className={styles.emailCta}>
          This isn&apos;t the end. We&apos;re building what comes next. Join
          20,000 others by subscribing to the{' '}
          <Link href='https://www.projecteleven.com/subscribe' target='_blank'>
            P11 Bulletin
          </Link>{' '}
          for future product updates and critical quantum-meets-blockchain news.
        </p>
      </div>
      <div className={styles.links}>
        <Link className={styles.primaryLink} href='/search'>
          Check the directory <ArrowRightIcon />
        </Link>
      </div>
      <div className={styles.footer}>
        <p>
          Built by{' '}
          <Link href='https://projecteleven.com' target='_blank'>
            Project Eleven
          </Link>
        </p>
        <span className={styles.footerSeparator} />
        <p>
          <Link href='https://status.projecteleven.com' target='_blank'>
            System status
          </Link>
        </p>
      </div>
    </main>
  );
}
