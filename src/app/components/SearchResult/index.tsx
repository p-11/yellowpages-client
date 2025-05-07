'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/app/components/Button';
import { useSearchContext } from '@/app/providers/SearchProvider';
import { ArrowLeftIcon } from '@/app/icons/ArrowLeftIcon';
import { Alert } from '@/app/components/Alert';
import styles from './styles.module.css';

export function SearchResult() {
  const router = useRouter();
  const { result, bitcoinAddress, setBitcoinAddress } = useSearchContext();

  useEffect(() => {
    if (result === undefined) {
      router.replace('/');
    }
  }, [router, result]);

  const navigateToHomepage = useCallback(() => {
    router.push('/');
  }, [router]);

  const searchAgain = useCallback(() => {
    setBitcoinAddress('');
    router.push('/search');
  }, [router, setBitcoinAddress]);

  if (result === undefined) return null;

  return (
    <main>
      <h1 className={styles.title}>Result:</h1>
      {result ? (
        <>
          <div className={styles.alertSection}>
            <Alert type='success'>
              Registered and cryptographically linked to a post-quantum address
            </Alert>
          </div>
          <div className={styles.pqAddressSection}>
            <div className={styles.connectingBlocks}>
              <div className={styles.connectingBlock} />
              <div className={styles.connectingLine} />
              <div className={styles.connectingBlock} />
            </div>
            <div className={styles.pqAddress}>
              <span className={styles.pqAddressLabel}>PQC address:</span>
              <span className={styles.pqAddressText}>
                {result.ml_dsa_44_address}
              </span>
            </div>
          </div>
          <div className={styles.bitcoinAddress}>
            <span className={styles.bitcoinAddressLabel}>BTC address</span>
            <div>
              <span className={styles.bitcoinAddressText}>
                {bitcoinAddress}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.noResult}>
          <p>
            Bitcoin address &quot;
            <span className={styles.bitcoinAddressText}>{bitcoinAddress}</span>
            &quot; is not on the registry.
          </p>
          <p className={styles.registerText}>
            Do you own this address?{' '}
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
