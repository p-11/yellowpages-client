'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegistrationProgressIndicator } from '@/app/components/RegistrationProgressIndicator';
import { RegistrationStepTitle } from '@/app/components/RegistrationStepTitle';
import { RegistrationHeader } from '@/app/components/RegistrationHeader';
import { Button } from '@/app/components/Button';
import { ArrowLeftIcon } from '@/app/icons/ArrowLeftIcon';
import { ArrowRightIcon } from '@/app/icons/ArrowRightIcon';
import { ToolbarButton } from '../ToolbarButton';
import { RefreshIcon } from '@/app/icons/RefreshIcon';
import { registrationData } from '@/core/registrationData';
import { RegistrationFooterActions } from '../RegistrationFooterActions';
import { Alert } from '@/app/components/Alert';
import { EyeOffIcon } from '@/app/icons/EyeOffIcon';
import { EyeIcon } from '@/app/icons/EyeIcon';
import { useRegistrationSessionContext } from '@/app/providers/RegistrationSessionProvider';
import styles from './styles.module.css';

export const RegistrationStep2 = () => {
  const router = useRouter();
  const [isFailedAttempt, setIsFailedAttempt] = useState(false);
  const {
    selectedSeedWords,
    shuffledSeedWords,
    addSelectedSeedWord,
    verifySelectedSeedWords,
    clearSelectedSeedWords,
    clearSensitiveState
  } = useSensitiveState();
  const { hasConfirmedSeedPhrase } = useRegistrationSessionContext();
  const [showSeedWords, setShowSeedWords] = useState(false);

  const selectionCompleted =
    shuffledSeedWords.length > 0 &&
    selectedSeedWords.length === shuffledSeedWords.length;
  const selectionStarted = selectedSeedWords.length > 0;

  const confirmSelection = useCallback(() => {
    const isCorrect = verifySelectedSeedWords();

    if (isCorrect) {
      clearSensitiveState();
      router.push('/register/step-3');
    } else {
      clearSelectedSeedWords();
      setIsFailedAttempt(true);
    }
  }, [
    verifySelectedSeedWords,
    clearSelectedSeedWords,
    clearSensitiveState,
    router
  ]);

  const tryAgain = useCallback(() => {
    window.scrollTo(0, 0);
    setIsFailedAttempt(false);
  }, []);

  const restart = useCallback(() => {
    window.scrollTo(0, 0);
    clearSelectedSeedWords();
  }, [clearSelectedSeedWords]);

  const goBack = useCallback(() => {
    clearSensitiveState();
    router.back();
  }, [router, clearSensitiveState]);

  const continueToNextStep = useCallback(() => {
    router.push('/register/step-3');
  }, [router]);

  const toggleSeedWordsVisibility = useCallback(
    () => setShowSeedWords(!showSeedWords),
    [showSeedWords]
  );

  return (
    <main
      className={`${isFailedAttempt ? styles.failedAttempt : ''} ${selectionStarted ? styles.selectionStarted : ''} ${selectionCompleted ? styles.selectionCompleted : ''} ${showSeedWords ? styles.showSeedWords : ''}`}
    >
      <RegistrationHeader>
        <RegistrationProgressIndicator activeStep='Step 2' />
        <RegistrationStepTitle>Confirm your seed phrase</RegistrationStepTitle>
        {!hasConfirmedSeedPhrase && (
          <p>Select each word in the correct order to continue.</p>
        )}
      </RegistrationHeader>
      {hasConfirmedSeedPhrase ? (
        <Alert className={styles.confirmedAlert} type='success'>
          Seed phrase confirmed
        </Alert>
      ) : (
        <>
          <ToolbarButton onClick={toggleSeedWordsVisibility}>
            {showSeedWords ? (
              <>
                <EyeOffIcon />
                Hide words
              </>
            ) : (
              <>
                <EyeIcon />
                Reveal words
              </>
            )}
          </ToolbarButton>
          <div className={styles.grid}>
            {shuffledSeedWords.map((seedWord, index) => {
              const isSelected = selectedSeedWords.includes(seedWord);

              return (
                <button
                  key={index}
                  onClick={() => addSelectedSeedWord(seedWord)}
                  disabled={isSelected}
                  className={styles.gridButton}
                >
                  <span className={styles.gridButtonIndicator}>
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
        </>
      )}
      <div className={styles.registrationFooter}>
        <div className={styles.warningOverlay}>
          <div className={styles.warningMessage}>
            <Alert>Incorrect order, please try again.</Alert>
          </div>
        </div>
        <RegistrationFooterActions>
          {isFailedAttempt ? (
            <Button variant='primary' onClick={tryAgain}>
              Try again
            </Button>
          ) : (
            <>
              <Button variant='secondary' onClick={goBack}>
                <ArrowLeftIcon />
                Back
              </Button>
              {hasConfirmedSeedPhrase ? (
                <Button variant='primary' onClick={continueToNextStep}>
                  Continue <ArrowRightIcon />
                </Button>
              ) : (
                <Button
                  variant='primary'
                  onClick={confirmSelection}
                  disabled={!selectionCompleted}
                >
                  Confirm <ArrowRightIcon />
                </Button>
              )}
            </>
          )}
        </RegistrationFooterActions>
      </div>
    </main>
  );
};

const useSensitiveState = () => {
  const [selectedSeedWords, setSelectedSeedWords] = useState<Array<string>>([]);
  const [shuffledSeedWords, setShuffledSeedWords] = useState<Array<string>>([]);

  const clearSensitiveState = useCallback(() => {
    setSelectedSeedWords([]);
    setShuffledSeedWords([]);
  }, []);

  useEffect(() => {
    const seedWords = registrationData.getSeedPhrase().split(' ');
    setShuffledSeedWords(shuffleSeedWords(seedWords));

    return function cleanup() {
      clearSensitiveState();
    };
  }, [clearSensitiveState]);

  const addSelectedSeedWord = useCallback(
    (selectedSeedWord: string) =>
      setSelectedSeedWords(current => [...current, selectedSeedWord]),
    []
  );

  const clearSelectedSeedWords = useCallback(
    () => setSelectedSeedWords([]),
    []
  );

  const verifySelectedSeedWords = useCallback(() => {
    const selectedSeedPhrase = selectedSeedWords.join(' ');
    return selectedSeedPhrase === registrationData.getSeedPhrase();
  }, [selectedSeedWords]);

  return {
    selectedSeedWords,
    shuffledSeedWords,
    addSelectedSeedWord,
    clearSelectedSeedWords,
    clearSensitiveState,
    verifySelectedSeedWords
  };
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
