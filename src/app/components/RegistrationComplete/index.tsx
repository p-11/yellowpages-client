'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/Button';
import { Alert } from '@/app/components/Alert';
import { useRegistrationSessionContext } from '@/app/providers/RegistrationSessionProvider';
import { DirectoryEntry } from '@/app/components/DirectoryEntry';
import styles from './styles.module.css';

export function RegistrationComplete() {
  const { signedMessages, bitcoinAddress } = useRegistrationSessionContext();
  const router = useRouter();

  const navigateToHomepage = useCallback(() => {
    router.push('/');
  }, [router]);

  if (!bitcoinAddress || !signedMessages) return null;

  return (
    <main>
      <h1 className={styles.title}>Registration complete!</h1>
      <div className={styles.content}>
        <p>
          Your post-quantum (PQ) address has been created and cryptographically
          linked to your Bitcoin address.
        </p>
        <div className={styles.entrySection}>
          <DirectoryEntry
            bitcoinAddress={bitcoinAddress}
            mldsa44Address={signedMessages.ML_DSA_44.address}
            showCopyButton
          />
        </div>
        <div className={styles.warningSection}>
          <Alert>Remember to save your new post-quantum addresses</Alert>
        </div>
        <div>
          <h2 className={styles.sectionTitle}>What&apos;s next?</h2>
          <p>
            Check your registration by{' '}
            <Link href='/search'>searching the directory</Link> or visit our{' '}
            <Link href='/faqs'>FAQs page</Link> to learn more.
          </p>
          <p>
            Own multiple wallets? You can register more than one address. Please
            note that each address will be linked to a different post-quantum
            address.
          </p>
        </div>
        <div className={styles.footer}>
          <Button variant='primary' onClick={navigateToHomepage}>
            Directory home
          </Button>
        </div>
      </div>
    </main>
  );
}
