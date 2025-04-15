'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegistrationProgressIndicator } from '@/app/components/RegistrationProgressIndicator';
import { RegistrationStepTitle } from '@/app/components/RegistrationStepTitle';
import { RegistrationHeader } from '@/app/components/RegistrationHeader';
import { RegistrationFooterButton } from '@/app/components/RegistrationFooterButton';
import { ArrowLeftIcon } from '@/app/icons/ArrowLeftIcon';
import { ArrowRightIcon } from '@/app/icons/ArrowRightIcon';
import { useRegistrationContext } from '@/app/providers/RegistrationProvider';
import { ToolbarButton } from '../ToolbarButton';
import { RefreshIcon } from '@/app/icons/RefreshIcon';
import { Warning } from '@/app/components/Warning';
import styles from './styles.module.css';

export const RegistrationStep2 = () => {
  const { push, back } = useRouter();
  const { seedPhrase } = useRegistrationContext();
  const [selectedSeedWords, setSelectedSeedWords] = useState<Array<string>>([]);
  const [progress, setProgress] = useState<
    'started' | 'selected' | 'selectionCompleted' | 'attemptFailed'
  >('started');

  const shuffledSeedWords = useMemo(() => {
    const seedWords = seedPhrase.length ? seedPhrase.split(' ') : [];
    return shuffleSeedWords(seedWords);
  }, [seedPhrase]);

  const selectSeedWord = useCallback(
    (selectedSeedWord: string) => {
      const newSelectedSeedWords = [...selectedSeedWords, selectedSeedWord];
      setSelectedSeedWords(newSelectedSeedWords);

      if (newSelectedSeedWords.length < shuffledSeedWords.length) {
        setProgress('selected');
      } else {
        setProgress('selectionCompleted');
      }
    },
    [selectedSeedWords, shuffledSeedWords]
  );

  const restart = useCallback(() => {
    window.scrollTo(0, 0);
    setSelectedSeedWords([]);
    setProgress('started');
  }, []);

  const confirmSelection = useCallback(() => {
    const selectedSeedPhrase = selectedSeedWords.join(' ');

    if (selectedSeedPhrase === seedPhrase) {
      push('/register/step-3');
    } else {
      setSelectedSeedWords([]);
      setProgress('attemptFailed');
    }
  }, [selectedSeedWords, seedPhrase, push]);

  return (
    <main className={styles[progress]}>
      <RegistrationHeader>
        <RegistrationProgressIndicator activeStep='Step 2' />
        <RegistrationStepTitle>Confirm your seed phrase</RegistrationStepTitle>
        <p>Select each word in the correct order to continue.</p>
      </RegistrationHeader>
      <div className={styles.grid}>
        {shuffledSeedWords.map((seedWord, index) => {
          const isSelected = selectedSeedWords.includes(seedWord);

          return (
            <button
              key={index}
              onClick={() => selectSeedWord(seedWord)}
              disabled={isSelected}
              className={styles.button}
            >
              <span className={styles.buttonIndicator}>
                {isSelected ? selectedSeedWords.indexOf(seedWord) + 1 : ''}
              </span>
              {seedWord}
            </button>
          );
        })}
      </div>
      <div className={styles.toolbar}>
        <ToolbarButton onClick={restart}>
          <RefreshIcon /> Start again
        </ToolbarButton>
      </div>
      <div className={styles.registrationFooter}>
        <div className={styles.alertOverlay}>
          <div className={styles.alertMessage}>
            <Warning>Incorrect order, please try again</Warning>
          </div>
        </div>
        <div className={styles.registrationFooterActions}>
          {progress === 'attemptFailed' ? (
            <RegistrationFooterButton variant='primary' onClick={restart}>
              Try again
            </RegistrationFooterButton>
          ) : (
            <>
              <RegistrationFooterButton variant='secondary' onClick={back}>
                <ArrowLeftIcon />
                Back
              </RegistrationFooterButton>
              <RegistrationFooterButton
                variant='primary'
                onClick={confirmSelection}
                disabled={progress !== 'selectionCompleted'}
              >
                Confirm <ArrowRightIcon />
              </RegistrationFooterButton>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

// Fisher–Yates shuffle
const shuffleSeedWords = (seedPhrase: Array<string>) => {
  const shuffled = [...seedPhrase];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
