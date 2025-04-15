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
import styles from './styles.module.css';

export const RegistrationStep2 = () => {
  const { seedPhrase } = useRegistrationContext();
  const shuffledSeedPhraseWords = useMemo(
    () => shuffleSeedPhraseWords(seedPhrase.split(' ')),
    [seedPhrase]
  );
  const [selectedWords, setSelectedWords] = useState<Array<string>>([]);
  const router = useRouter();

  const selectWord = useCallback((selectedWord: string) => {
    setSelectedWords(prev =>
      prev.includes(selectedWord) ? prev : [...prev, selectedWord]
    );
  }, []);

  return (
    <main>
      <RegistrationHeader>
        <RegistrationProgressIndicator activeStep='Step 2' />
        <RegistrationStepTitle>Confirm your seed phrase</RegistrationStepTitle>
        <p>Select each word in the correct order to continue.</p>
      </RegistrationHeader>
      <div className={styles.grid}>
        {shuffledSeedPhraseWords.map((seedPhraseWord, index) => {
          const isSelected = selectedWords.includes(seedPhraseWord);

          return (
            <button
              key={index}
              onClick={() => selectWord(seedPhraseWord)}
              disabled={isSelected}
              className={styles.button}
            >
              {isSelected && (
                <span className={styles.selectedIndicator}>
                  {selectedWords.indexOf(seedPhraseWord) + 1}
                </span>
              )}
              {seedPhraseWord}
            </button>
          );
        })}
      </div>
      <RegistrationFooter>
        <RegistrationFooterButton
          variant='secondary'
          onClick={() => router.back()}
        >
          <ArrowLeftIcon />
          Back
        </RegistrationFooterButton>
        <RegistrationFooterButton
          variant='primary'
          onClick={() => router.push('/register/step-3')}
          disabled={selectedWords.length !== shuffledSeedPhraseWords.length}
        >
          Confirm <ArrowRightIcon />
        </RegistrationFooterButton>
      </RegistrationFooter>
    </main>
  );
};

// Fisher–Yates shuffle
const shuffleSeedPhraseWords = (seedPhrase: Array<string>) => {
  const shuffled = [...seedPhrase];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
