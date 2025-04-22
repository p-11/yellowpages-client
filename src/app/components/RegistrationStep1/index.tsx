'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegistrationProgressIndicator } from '@/app/components/RegistrationProgressIndicator';
import { RegistrationStepTitle } from '@/app/components/RegistrationStepTitle';
import { Warning } from '@/app/components/Warning';
import { RegistrationHeader } from '@/app/components/RegistrationHeader';
import { RegistrationFooter } from '@/app/components/RegistrationFooter';
import { HighlightedBox } from '@/app/components/HighlightedBox';
import { Toolbar } from '@/app/components/Toolbar';
import { ToolbarButton } from '@/app/components/ToolbarButton';
import { EyeOffIcon } from '@/app/icons/EyeOffIcon';
import { EyeIcon } from '@/app/icons/EyeIcon';
import { Button } from '@/app/components/Button';
import { ArrowRightIcon } from '@/app/icons/ArrowRightIcon';
import { registrationData } from '@/core/registrationData';
import { CopyTextToolbarButton } from '@/app/components/CopyTextToolbarButton';
import { useRegistrationProgressContext } from '@/app/providers/RegistrationProgressProvider';
import { useRegistrationSessionStore } from '@/app/hooks/useRegistrationSessionStore';
import styles from './styles.module.css';

export function RegistrationStep1() {
  const [isSeedPhraseVisible, setIsSeedPhraseVisible] = useState(false);
  const router = useRouter();
  const { seedPhrase, clearSensitiveState } = useSensitiveState();
  const { isRegistrationInProgress, setIsRegistrationInProgress } =
    useRegistrationProgressContext();
  const {
    saveRegistrationProgress,
    clearRegistrationSessionStore,
    hasExistingRegistrationProgress
  } = useRegistrationSessionStore();
  const [showSessionWarning, setShowSessionWarning] = useState(false);

  useEffect(() => {
    if (!isRegistrationInProgress) {
      setShowSessionWarning(hasExistingRegistrationProgress());
      setIsRegistrationInProgress(true);
    }
  }, [
    isRegistrationInProgress,
    hasExistingRegistrationProgress,
    clearRegistrationSessionStore,
    setIsRegistrationInProgress
  ]);

  const copySeedPhrase = useCallback(() => {
    navigator.clipboard.writeText(seedPhrase);
  }, [seedPhrase]);

  const toggleSeedPhraseVisibility = useCallback(
    () => setIsSeedPhraseVisible(!isSeedPhraseVisible),
    [isSeedPhraseVisible]
  );

  const cancelRegistration = useCallback(() => {
    clearSensitiveState();
    clearRegistrationSessionStore();
    registrationData.clearSeedPhrase();
    router.replace('/');
  }, [router, clearSensitiveState, clearRegistrationSessionStore]);

  const continueToNextStep = useCallback(() => {
    clearSensitiveState();
    saveRegistrationProgress();
    router.push('/register/step-2');
  }, [router, clearSensitiveState, saveRegistrationProgress]);

  const acknowledgeSessionWarning = useCallback(() => {
    setShowSessionWarning(false);
    clearRegistrationSessionStore();
  }, [clearRegistrationSessionStore]);

  if (!seedPhrase) return null;

  return (
    <main>
      <RegistrationHeader>
        <RegistrationProgressIndicator activeStep='Step 1' />
        <RegistrationStepTitle>
          Make a backup of your Post-Quantum seed phrase
        </RegistrationStepTitle>
        <p>
          This is the 24-word seed phrase for your new Post-Quantum address.
        </p>
      </RegistrationHeader>
      <Warning className={styles.warning}>
        Save it somewhere safe and do not share it with anyone
      </Warning>
      <HighlightedBox>
        <span
          className={`${styles.seedPhrase} ${isSeedPhraseVisible ? styles.visibleSeedPhrase : ''}`}
        >
          {seedPhrase}
        </span>
      </HighlightedBox>
      <Toolbar>
        <ToolbarButton onClick={toggleSeedPhraseVisibility}>
          {isSeedPhraseVisible ? (
            <>
              <EyeOffIcon />
              Hide
            </>
          ) : (
            <>
              <EyeIcon />
              Show
            </>
          )}
        </ToolbarButton>
        <CopyTextToolbarButton onClick={copySeedPhrase} />
      </Toolbar>
      <RegistrationFooter>
        <Button variant='secondary' onClick={cancelRegistration}>
          Cancel
        </Button>
        <Button variant='primary' onClick={continueToNextStep}>
          Continue <ArrowRightIcon />
        </Button>
      </RegistrationFooter>
      {showSessionWarning && (
        <div className={styles.dialog}>
          <div className={styles.dialogContent}>
            <p className={styles.dialogTitle}>Your session has refreshed</p>
            <p className={styles.dialogDescription}>
              Your progress has reset and a new seed phrase has been generated.
            </p>
            <Warning>
              If you saved the previous seed phrase, please discard it and
              securely save the new one.
            </Warning>
            <div className={styles.dialogFooter}>
              <Button variant='primary' onClick={acknowledgeSessionWarning}>
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

const useSensitiveState = () => {
  const [seedPhrase, setSeedPhrase] = useState('');

  const clearSensitiveState = useCallback(() => {
    setSeedPhrase('');
  }, []);

  useEffect(() => {
    setSeedPhrase(registrationData.generateSeedPhrase());

    return function cleanup() {
      clearSensitiveState();
    };
  }, [clearSensitiveState]);

  return {
    seedPhrase,
    clearSensitiveState
  };
};
