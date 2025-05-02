'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HighlightedBox } from '@/app/components/HighlightedBox';
import { Toolbar } from '@/app/components/Toolbar';
import { CopyTextToolbarButton } from '@/app/components/CopyTextToolbarButton';
import { Button } from '@/app/components/Button';
import { Alert } from '@/app/components/Alert';
import { useRegistrationSessionContext } from '@/app/providers/RegistrationSessionProvider';
import styles from './styles.module.css';

export function RegistrationComplete() {
  const { pqAddress, bitcoinAddress } = useRegistrationSessionContext();
  const router = useRouter();

  const copyPqAddress = useCallback(() => {
    navigator.clipboard.writeText(pqAddress);
  }, [pqAddress]);

  const navigateToHomepage = useCallback(() => {
    router.push('/');
  }, [router]);

  if (!bitcoinAddress || !pqAddress) return null;

  return (
    <main>
      <h1 className={styles.title}>Registration complete!</h1>
      <div className={styles.content}>
        <p>
          Your post-quantum (PQ) address has been created and cryptographically
          linked to your Bitcoin address.
        </p>
        <div className={styles.pqAddressSection}>
          <div className={styles.connectingBlocks}>
            <div className={styles.connectingBlock} />
            <div className={styles.connectingLine} />
            <div className={styles.connectingBlock} />
          </div>
          <div className={styles.pqAddress}>
            <HighlightedBox
              className={styles.pqAddressBox}
              label='Post-Quantum address'
            >
              <span className={styles.pqAddressText}>{pqAddress}</span>
            </HighlightedBox>
            <Toolbar>
              <CopyTextToolbarButton onClick={copyPqAddress} />
            </Toolbar>
          </div>
        </div>
        <div className={styles.bitcoinAddress}>
          <span className={styles.bitcoinAddressLabel}>Bitcoin address</span>
          <div>
            <span className={styles.bitcoinAddressText}>{bitcoinAddress}</span>
          </div>
        </div>
        <div className={styles.warningSection}>
          <Alert>Remember to save your new post-quantum address</Alert>
        </div>
        <div>
          <h2 className={styles.sectionTitle}>What&apos;s next?</h2>
          <p>
            Check your registration by{' '}
            <Link href='/search'>searching the registry</Link> or visit our{' '}
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
            Registry home
          </Button>
        </div>
      </div>
    </main>
  );
}
