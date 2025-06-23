'use client';

import Link from 'next/link';
import styles from '../../page.module.css';
import { ArrowRightIcon } from '../../icons/ArrowRightIcon';
import { EmailDialog } from '@/app/components/EmailDialog';
import { useCallback, useState } from 'react';

export function HomeContent() {
  const [showEmailDialog, setShowEmailDialog] = useState(false);

  const toggleEmailDialog = useCallback(() => {
    setShowEmailDialog(!showEmailDialog);
  }, [showEmailDialog]);

  return (
    <main className={styles.homepage}>
      <h1 className={styles.title}>yellowpages.xyz</h1>
      <div className={styles.content}>
        <p>Find yourself in the post quantum world - join the yellowpages.</p>
        <p>
          yellowpages is the first public, anonymous, post-quantum proof of
          Bitcoin ownership.
        </p>
        <p>
          Read our <Link href='/faqs'>FAQs</Link>,{' '}
          <Link href='/resources'>resources</Link>, or{' '}
          <Link href='/changelog'>changelog</Link> to learn more.
        </p>
        <p className={styles.emailCta}>
          Learn more by{' '}
          <button onClick={toggleEmailDialog} className={styles.emailButton}>
            signing up to our e-mail bulletin
          </button>
          .
        </p>
      </div>
      <div className={styles.links}>
        <Link className={styles.primaryLink} href='/'>
          Registraion is temporarily disabled
        </Link>
        <Link className={styles.secondaryLink} href='/search'>
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
      {showEmailDialog && <EmailDialog onExit={toggleEmailDialog} />}
    </main>
  );
}
