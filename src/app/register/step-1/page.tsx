'use client';

import { RegistrationProgressIndicator } from '@/app/components/RegistrationProgressIndicator';
import { RegistrationStepTitle } from '@/app/components/RegistrationStepTitle';
import { HighlightedBox } from '@/app/components/HighlightedBox';
import { Toolbar } from '@/app/components/Toolbar';
import { ToolbarButton } from '@/app/components/ToolbarButton';
import { CopyIcon } from '@/app/icons/CopyIcon';
import { EyeIcon } from '@/app/icons/EyeIcon';
import { useCallback, useState } from 'react';
import { EyeOffIcon } from '@/app/icons/EyeOffIcon';
import { mockSeedPhrase } from '@/mock-data';
import styles from './styles.module.css';

export default function RegistrationStep1Page() {
  const [isSeedPhraseVisible, setIsSeedPhraseVisible] = useState(false);
  const [seedPhrase] = useState(mockSeedPhrase);

  const copySeedPhrase = useCallback(
    () => navigator.clipboard.writeText(seedPhrase),
    [seedPhrase]
  );
  const toggleSeedPhraseVisibility = useCallback(
    () => setIsSeedPhraseVisible(!isSeedPhraseVisible),
    [isSeedPhraseVisible]
  );

  return (
    <main className={styles.mainArea}>
      <div>
        <RegistrationProgressIndicator activeStep='Step 1' />
        <RegistrationStepTitle>
          Make a backup of your Post-Quantum seed phrase
        </RegistrationStepTitle>
        <p>
          This is the 24-word seed phrase for your new Post-Quantum address.
        </p>
      </div>
      <div>
        <HighlightedBox>
          <span
            className={`${styles.seedPhrase} ${isSeedPhraseVisible ? styles.visibleSeedPhrase : ''}`}
          >
            {seedPhrase}
          </span>
        </HighlightedBox>
        <Toolbar>
          <ToolbarButton onClick={copySeedPhrase}>
            <CopyIcon />
            Copy
          </ToolbarButton>
          <ToolbarButton onClick={toggleSeedPhraseVisibility}>
            {isSeedPhraseVisible ? (
              <>
                <EyeOffIcon />
                Conceal
              </>
            ) : (
              <>
                <EyeIcon />
                Reveal
              </>
            )}
          </ToolbarButton>
        </Toolbar>
      </div>
    </main>
  );
}
