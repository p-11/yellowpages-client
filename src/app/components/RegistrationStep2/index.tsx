'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegistrationProgressIndicator } from '@/app/components/RegistrationProgressIndicator';
import { RegistrationStepTitle } from '@/app/components/RegistrationStepTitle';
import { RegistrationHeader } from '@/app/components/RegistrationHeader';
import { RegistrationFooter } from '@/app/components/RegistrationFooter';
import { RegistrationFooterButton } from '@/app/components/RegistrationFooterButton';
import { ArrowLeftIcon } from '@/app/icons/ArrowLeftIcon';
import { ArrowRightIcon } from '@/app/icons/ArrowRightIcon';
import { useRegistrationContext } from '@/app/providers/RegistrationProvider';
import { ToolbarButton } from '../ToolbarButton';
import { RefreshIcon } from '@/app/icons/RefreshIcon';
import styles from './styles.module.css';

export const RegistrationStep2 = () => {
  const { push, back } = useRouter();
  const { seedPhrase } = useRegistrationContext();
  const [selectedSeedWords, setSelectedSeedWords] = useState<Array<string>>([]);

  const shuffledSeedWords = useMemo(() => {
    const seedWords = seedPhrase.split(' ');
    return shuffleSeedWords(seedWords);
  }, [seedPhrase]);

  const selectSeedWord = useCallback((selectedSeedWord: string) => {
    setSelectedSeedWords(prev => [...prev, selectedSeedWord]);
  }, []);

  const restart = useCallback(() => setSelectedSeedWords([]), []);

  const confirm = useCallback(() => {
    const selectedSeedPhrase = selectedSeedWords.join(' ');

    if (selectedSeedPhrase === seedPhrase) {
      push('/register/step-3');
    }
  }, [selectedSeedWords, seedPhrase, push]);

  return (
    <main>
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
              {isSelected && (
                <span className={styles.selectedIndicator}>
                  {selectedSeedWords.indexOf(seedWord) + 1}
                </span>
              )}
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
      <RegistrationFooter>
        <RegistrationFooterButton variant='secondary' onClick={back}>
          <ArrowLeftIcon />
          Back
        </RegistrationFooterButton>
        <RegistrationFooterButton
          variant='primary'
          onClick={confirm}
          disabled={selectedSeedWords.length !== shuffledSeedWords.length}
        >
          Confirm <ArrowRightIcon />
        </RegistrationFooterButton>
      </RegistrationFooter>
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
