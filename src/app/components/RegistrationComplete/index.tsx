'use client';

import { useCallback, useEffect, useState } from 'react';
import { HighlightedBox } from '@/app/components/HighlightedBox';
import { registrationData } from '@/core/registrationData';
import { Toolbar } from '@/app/components/Toolbar';
import { CopyTextToolbarButton } from '@/app/components/CopyTextToolbarButton';
import { Warning } from '@/app/components/Warning';
import styles from './styles.module.css';

export function RegistrationComplete() {
  const { pqAddress } = useSensitiveState();

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
        <span className={styles.pqAddressLabel}>Your PQ address</span>
        <HighlightedBox className={styles.pqAddressBox}>
          <span className={styles.pqAddress}>{pqAddress}</span>
        </HighlightedBox>
        <Toolbar>
          <CopyTextToolbarButton onClick={copyPqAddress} />
        </Toolbar>
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
