'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RegistrationProgressIndicator } from '@/app/components/RegistrationProgressIndicator';
import { RegistrationStepTitle } from '@/app/components/RegistrationStepTitle';
import { RegistrationHeader } from '@/app/components/RegistrationHeader';
import { Button } from '@/app/components/Button';
import { ArrowLeftIcon } from '@/app/icons/ArrowLeftIcon';
import { ArrowRightIcon } from '@/app/icons/ArrowRightIcon';
import { ToolbarButton } from '@/app/components/ToolbarButton';
import { RefreshIcon } from '@/app/icons/RefreshIcon';
import { RegistrationFooterActions } from '@/app/components/RegistrationFooterActions';
import { Alert } from '@/app/components/Alert';
import { EyeOffIcon } from '@/app/icons/EyeOffIcon';
import { EyeIcon } from '@/app/icons/EyeIcon';
import { useRegistrationSessionContext } from '@/app/providers/RegistrationSessionProvider';
import { UndoIcon } from '@/app/icons/UndoIcon';
import styles from './styles.module.css';

export const RegistrationStep2 = () => {
  const router = useRouter();
  const { hasConfirmedSeedPhrase, setHasConfirmedSeedPhrase } =
    useRegistrationSessionContext();
  const [isNavigating, startNavigating] = useTransition();

  const shouldShowConfirmedState = !isNavigating && hasConfirmedSeedPhrase;

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  const continueToNextStep = useCallback(() => {
    router.push('/register/step-3');
  }, [router]);

  const onSeedPhraseConfirmed = useCallback(() => {
    setHasConfirmedSeedPhrase(true);

    startNavigating(() => {
      router.push('/register/step-3');
    });
  }, [router, setHasConfirmedSeedPhrase]);

  if (shouldShowConfirmedState) {
    return (
      <main>
        <RegistrationHeader>
          <RegistrationProgressIndicator activeStep='Step 2' />
          <RegistrationStepTitle>
            Confirm your seed phrase
          </RegistrationStepTitle>
        </RegistrationHeader>
        <Alert className={styles.confirmedAlert} type='success'>
          Seed phrase confirmed
        </Alert>
        <div className={styles.registrationFooter}>
          <RegistrationFooterActions>
            <Button variant='secondary' onClick={goBack}>
              <ArrowLeftIcon />
              Back
            </Button>
            <Button variant='primary' onClick={continueToNextStep}>
              Continue <ArrowRightIcon />
            </Button>
          </RegistrationFooterActions>
        </div>
      </main>
    );
  } else {
    return <SeedPhraseConfirmationStep onSuccess={onSeedPhraseConfirmed} />;
  }
};

const SeedPhraseConfirmationStep = ({
  onSuccess
}: {
  onSuccess: () => void;
}) => {
  const router = useRouter();
  const [isFailedAttempt, setIsFailedAttempt] = useState(false);
  const {
    shuffledSeedWords,
    selectedSeedWordIndices,
    addSelectedSeedWordIndex,
    verifySelectedSeedWords,
    clearSelectedSeedWordIndices,
    clearSensitiveState,
    removeLastSeedWordIndex
  } = useSensitiveState();
  const [showSeedWords, setShowSeedWords] = useState(false);

  const selectionCompleted =
    shuffledSeedWords.length > 0 &&
    selectedSeedWordIndices.length === shuffledSeedWords.length;
  const selectionStarted = selectedSeedWordIndices.length > 0;

  const confirmSelection = useCallback(() => {
    const isCorrect = verifySelectedSeedWords();

    if (isCorrect) {
      onSuccess();
    } else {
      clearSelectedSeedWordIndices();
      setIsFailedAttempt(true);
    }
  }, [verifySelectedSeedWords, clearSelectedSeedWordIndices, onSuccess]);

  const tryAgain = useCallback(() => {
    window.scrollTo(0, 0);
    setIsFailedAttempt(false);
  }, []);

  const restart = useCallback(() => {
    window.scrollTo(0, 0);
    clearSelectedSeedWordIndices();
  }, [clearSelectedSeedWordIndices]);

  const goBack = useCallback(() => {
    clearSensitiveState();
    router.back();
  }, [router, clearSensitiveState]);

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
        <p>Select each word in the correct order to continue.</p>
      </RegistrationHeader>
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
          const isSelected = selectedSeedWordIndices.includes(index);

          return (
            <button
              key={index}
              onClick={() => addSelectedSeedWordIndex(index)}
              disabled={isSelected}
              className={styles.gridButton}
            >
              <span className={styles.gridButtonIndicator}>
                {isSelected ? selectedSeedWordIndices.indexOf(index) + 1 : ''}
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
        <ToolbarButton onClick={removeLastSeedWordIndex}>
          <UndoIcon /> Undo selection
        </ToolbarButton>
      </div>
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
              <Button
                variant='primary'
                onClick={confirmSelection}
                disabled={!selectionCompleted}
              >
                Confirm <ArrowRightIcon />
              </Button>
            </>
          )}
        </RegistrationFooterActions>
      </div>
    </main>
  );
};

const useSensitiveState = () => {
  const [shuffledSeedWords, setShuffledSeedWords] = useState<Array<string>>([]);
  const [selectedSeedWordIndices, setSelectedSeedWordIndices] = useState<
    Array<number>
  >([]);
  const { seedPhrase } = useRegistrationSessionContext();

  const clearSensitiveState = useCallback(() => {
    setSelectedSeedWordIndices([]);
    setShuffledSeedWords([]);
  }, []);

  useEffect(() => {
    if (seedPhrase) {
      let seedWords: Array<string> | undefined = seedPhrase.split(' ');
      setShuffledSeedWords(shuffleSeedWords(seedWords));
      seedWords.fill('');
      seedWords = undefined;
    }

    return function cleanup() {
      clearSensitiveState();
    };
  }, [seedPhrase, clearSensitiveState]);

  const addSelectedSeedWordIndex = useCallback(
    (index: number) => {
      // guard against adding duplicate indices
      if (!selectedSeedWordIndices.includes(index)) {
        setSelectedSeedWordIndices(current => [...current, index]);
      }
    },
    [selectedSeedWordIndices]
  );

  const removeLastSeedWordIndex = useCallback(() => {
    setSelectedSeedWordIndices(current => current.slice(0, -1));
  }, []);

  const clearSelectedSeedWordIndices = useCallback(
    () => setSelectedSeedWordIndices([]),
    []
  );

  const verifySelectedSeedWords = useCallback(() => {
    const selectedSeedWords = selectedSeedWordIndices.map(
      index => shuffledSeedWords[index]
    );
    const selectedSeedPhrase = selectedSeedWords.join(' ');

    return selectedSeedPhrase === seedPhrase;
  }, [selectedSeedWordIndices, shuffledSeedWords, seedPhrase]);

  return {
    shuffledSeedWords,
    selectedSeedWordIndices,
    addSelectedSeedWordIndex,
    clearSensitiveState,
    clearSelectedSeedWordIndices,
    verifySelectedSeedWords,
    removeLastSeedWordIndex
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
