'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/app/components/Button';
import { useVerificationContext } from '@/app/providers/VerificationProvider';
import { ArrowLeftIcon } from '@/app/icons/ArrowLeftIcon';
import styles from './styles.module.css';

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
              {result.ml_dsa_44_address}
            </span>
          </div>
        </div>
      ) : (
        <div className={styles.emptyResult}>
          <p>
            Bitcoin address{' '}
            <span className={styles.bitcoinAddress}>{bitcoinAddress}</span> is
            not on the registry.
          </p>
          <p>
            Do you own this Bitcoin address?{' '}
            <Link href='/register/step-1'>Register now</Link>.
          </p>
        </div>
      )}
      <div className={styles.footer}>
        <Button variant='secondary' onClick={searchAgain}>
          <ArrowLeftIcon /> Search
        </Button>
        <Button variant='primary' onClick={navigateToHomepage}>
          Homepage
        </Button>
      </div>
    </main>
  );
}
