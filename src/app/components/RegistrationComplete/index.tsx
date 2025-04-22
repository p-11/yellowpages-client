'use client';

import { useCallback, useEffect, useState } from 'react';
import { RegistrationStepTitle } from '@/app/components/RegistrationStepTitle';
import { RegistrationHeader } from '@/app/components/RegistrationHeader';
import { HighlightedBox } from '@/app/components/HighlightedBox';
import { registrationData } from '@/core/registrationData';
import styles from './styles.module.css';

export function RegistrationComplete() {
  const { bitcoinAddress, pqAddress } = useSensitiveState();

  return (
    <main>
      <RegistrationHeader>
        <RegistrationStepTitle>Registration complete!</RegistrationStepTitle>
      </RegistrationHeader>
      <div className={styles.content}>
        <HighlightedBox>
          <span>{pqAddress}</span>
        </HighlightedBox>
        <div>
          <span>{bitcoinAddress}</span>
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
