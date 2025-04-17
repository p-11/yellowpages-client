'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
import { CheckIcon } from '@/app/icons/CheckIcon';
import { CopyIcon } from '@/app/icons/CopyIcon';
import { RegistrationFooterButton } from '@/app/components/RegistrationFooterButton';
import { ArrowRightIcon } from '@/app/icons/ArrowRightIcon';
import { registrationData } from '@/core/registrationData';
import styles from './styles.module.css';

export function RegistrationStep1() {
  const [isSeedPhraseVisible, setIsSeedPhraseVisible] = useState(false);
  const [isCopiedIndicatorVisible, setIsCopiedIndicatorVisible] =
    useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const router = useRouter();
  const { seedPhrase, clearSensitiveState } = useSensitiveState();

  const copySeedPhrase = useCallback(() => {
    navigator.clipboard.writeText(seedPhrase);

    setIsCopiedIndicatorVisible(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsCopiedIndicatorVisible(false);
      timeoutRef.current = null;
    }, 1000);
  }, [seedPhrase]);

  const toggleSeedPhraseVisibility = useCallback(
    () => setIsSeedPhraseVisible(!isSeedPhraseVisible),
    [isSeedPhraseVisible]
  );

  const cancelRegistration = useCallback(() => {
    clearSensitiveState();
    registrationData.clearSeedPhrase();
    router.replace('/');
  }, [router, clearSensitiveState]);

  const continueToNextStep = useCallback(() => {
    clearSensitiveState();
    router.push('/register/step-2');
  }, [router, clearSensitiveState]);

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
        <ToolbarButton onClick={copySeedPhrase}>
          {isCopiedIndicatorVisible ? (
            <>
              <CheckIcon stroke='#7fd17f' />
              Copied
            </>
          ) : (
            <>
              <CopyIcon />
              Copy
            </>
          )}
        </ToolbarButton>
      </Toolbar>
      <RegistrationFooter>
        <RegistrationFooterButton
          variant='secondary'
          onClick={cancelRegistration}
        >
          Cancel
        </RegistrationFooterButton>
        <RegistrationFooterButton
          variant='primary'
          onClick={continueToNextStep}
        >
          Continue <ArrowRightIcon />
        </RegistrationFooterButton>
      </RegistrationFooter>
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
