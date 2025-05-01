'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/Button';
import { useVerificationContext } from '@/app/providers/VerificationProvider';
import styles from './styles.module.css';
import Link from 'next/link';

export function VerificationResult() {
  const router = useRouter();
  const { result, bitcoinAddress } = useVerificationContext();

  useEffect(() => {
    if (result === undefined) {
      router.replace('/');
    }
  }, [router, result]);

  const navigateToHomepage = useCallback(() => {
    router.push('/');
  }, [router]);

  const searchAgain = useCallback(() => {
    router.push('/verification');
  }, [router]);

  if (result === undefined) return null;

  return (
    <main>
      <h1 className={styles.title}>
        {result ? 'Registered' : 'Not registered'}
      </h1>
      {result ? (
        <div className={styles.registration}>
          <div className={styles.registrationCardRow}>
            <p className={styles.registrationDetailsLabel}>BTC address:</p>
            <span className={styles.registrationDetailsValue}>
              {bitcoinAddress}
            </span>
          </div>
          <div className={styles.registrationCardRow}>
            <p className={styles.registrationDetailsLabel}>PQC address:</p>
            <span className={styles.registrationDetailsValue}>
              {result.pqAddress}
            </span>
          </div>
          <div className={styles.registrationCardRow}>
            <p className={styles.registrationDetailsLabel}>Date registered:</p>
            <span className={styles.registrationDetailsValue}>
              {new Date(result.createdAt).toDateString()}
            </span>
          </div>
        </div>
      ) : (
        <div className={styles.emptyResult}>
          <p>
            BTC address{' '}
            <span className={styles.bitcoinAddress}>{bitcoinAddress}</span> is
            not on the registry.
          </p>
          <p>
            Do you own this address?{' '}
            <Link href='/register/step-1'>Register now</Link>.
          </p>
        </div>
      )}
      <div className={styles.footer}>
        <Button variant='primary' onClick={searchAgain}>
          Search again
        </Button>
        <Button variant='secondary' onClick={navigateToHomepage}>
          Registry home
        </Button>
      </div>
    </main>
  );
}
