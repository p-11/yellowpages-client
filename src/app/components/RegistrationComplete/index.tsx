'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { HighlightedBox } from '@/app/components/HighlightedBox';
import { registrationData } from '@/core/registrationData';
import { Toolbar } from '@/app/components/Toolbar';
import { CopyTextToolbarButton } from '@/app/components/CopyTextToolbarButton';
import { Warning } from '@/app/components/Warning';
import { Button } from '@/app/components/Button';
import styles from './styles.module.css';

export function RegistrationComplete() {
  const { bitcoinAddress, pqAddress } = useSensitiveState();

  const copyPqAddress = useCallback(() => {
    navigator.clipboard.writeText(pqAddress);
  }, [pqAddress]);

  return (
    <main>
      <h1 className={styles.title}>Registration complete!</h1>
      <div className={styles.content}>
        <p className={styles.description}>
          Your post-quantum (PQ) address has been created and cryptographically
          linked to your Bitcoin address.
        </p>
        <Warning className={styles.warning}>
          Remember to save your new PQ address
        </Warning>
        <div className={styles.addressSection}>
          <div className={styles.addressBlocks}>
            <div className={styles.addressBlock} />
            <div className={styles.connectingLine} />
            <div className={styles.addressBlock} />
          </div>
          <div className={styles.pqAddressSection}>
            <HighlightedBox
              className={styles.pqAddressBox}
              label='Your PQ address'
            >
              <span className={styles.pqAddress}>{pqAddress}</span>
            </HighlightedBox>
            <Toolbar>
              <CopyTextToolbarButton onClick={copyPqAddress} />
            </Toolbar>
          </div>
        </div>
        <div className={styles.bitcoinAddressBox}>
          <span className={styles.bitcoinAddress}>{bitcoinAddress}</span>
        </div>
        <h2 className={styles.sectionTitle}>What&apos;s next?</h2>
        <p>
          Check your registration by{' '}
          <Link href='/search'>searching the registry</Link> or visit our{' '}
          <Link href='/faqs'>FAQs page</Link> to learn more.
        </p>
        <div className={styles.footer}>
          <Button variant='primary'>Go to homepage</Button>
        </div>
      </div>
    </main>
  );
}

const useSensitiveState = () => {
  const [bitcoinAddress, setBitcoinAddress] = useState('');
  const [pqAddress, setPqAddress] = useState('');

  const clearSensitiveState = useCallback(() => {
    setBitcoinAddress('');
    setPqAddress('');
  }, []);

  useEffect(() => {
    setBitcoinAddress(registrationData.getBitcoinAddress());
    setPqAddress(registrationData.getPqAddress());

    return function cleanup() {
      clearSensitiveState();
    };
  }, [clearSensitiveState]);

  return {
    bitcoinAddress,
    pqAddress,
    clearSensitiveState
  };
};
