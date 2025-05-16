'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegistrationProgressIndicator } from '@/app/components/RegistrationProgressIndicator';
import { RegistrationStepTitle } from '@/app/components/RegistrationStepTitle';
import { RegistrationHeader } from '@/app/components/RegistrationHeader';
import { RegistrationFooter } from '@/app/components/RegistrationFooter';
import { HighlightedBox } from '@/app/components/HighlightedBox';
import { Toolbar } from '@/app/components/Toolbar';
import { ToolbarButton } from '@/app/components/ToolbarButton';
import { EyeOffIcon } from '@/app/icons/EyeOffIcon';
import { EyeIcon } from '@/app/icons/EyeIcon';
import { Button } from '@/app/components/Button';
import { ArrowRightIcon } from '@/app/icons/ArrowRightIcon';
import { CopyTextToolbarButton } from '@/app/components/CopyTextToolbarButton';
import { Alert } from '@/app/components/Alert';
import { useRegistrationSessionContext } from '@/app/providers/RegistrationSessionProvider';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogTitle
} from '@/app/components/Dialog';
import styles from './styles.module.css';

export function RegistrationStep1() {
  const [isSeedPhraseVisible, setIsSeedPhraseVisible] = useState(false);
  const router = useRouter();
  const { seedPhrase, showNewSessionAlert, setShowNewSessionAlert } =
    useRegistrationSessionContext();

  const copySeedPhrase = useCallback(() => {
    if (seedPhrase) {
      navigator.clipboard.writeText(seedPhrase);
    }
  }, [seedPhrase]);

  const toggleSeedPhraseVisibility = useCallback(
    () => setIsSeedPhraseVisible(!isSeedPhraseVisible),
    [isSeedPhraseVisible]
  );

  const cancelRegistration = useCallback(() => {
    router.replace('/');
  }, [router]);

  const continueToNextStep = useCallback(() => {
    router.push('/register/step-2');
  }, [router]);

  const acknowledgeNewSessionAlert = useCallback(() => {
    setShowNewSessionAlert(false);
  }, [setShowNewSessionAlert]);

  if (!seedPhrase) return null;

  return (
    <main>
      <RegistrationHeader>
        <RegistrationProgressIndicator activeStep='Step 1' />
        <RegistrationStepTitle>
          Make a backup of your Post-Quantum seed phrase
        </RegistrationStepTitle>
        <p>
          This is the 24-word seed phrase for your new Post-Quantum addresses.
        </p>
      </RegistrationHeader>
      <Alert className={styles.alert}>
        Save it somewhere safe and do not share it with anyone
      </Alert>
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
      {showNewSessionAlert && (
        <Dialog>
          <DialogTitle>Your session has refreshed</DialogTitle>
          <DialogDescription>
            Your progress has reset and a new seed phrase has been generated.
          </DialogDescription>
          <Alert>
            If you saved the previous seed phrase, please discard it and
            securely save the new one.
          </Alert>
          <DialogFooter>
            <Button variant='primary' onClick={acknowledgeNewSessionAlert}>
              Continue
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </main>
  );
}
