'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/app/components/Button';
import { useSearchContext } from '@/app/providers/SearchProvider';
import { ArrowLeftIcon } from '@/app/icons/ArrowLeftIcon';
import { Alert } from '@/app/components/Alert';
import { DirectoryEntry } from '@/app/components/DirectoryEntry';
import { ToolbarButton } from '@/app/components/ToolbarButton';
import { DownloadIcon } from '@/app/icons/DownloadIcon';
import { ProofDialog } from '@/app/components/ProofDialog';
import styles from './styles.module.css';

export function SearchResult() {
  const router = useRouter();
  const { result, bitcoinAddress, setBitcoinAddress } = useSearchContext();
  const [showProofDialog, setShowProofDialog] = useState(false);

  useEffect(() => {
    if (result === undefined) {
      router.replace('/');
    }
  }, [router, result]);

  const navigateToHomepage = useCallback(() => {
    router.push('/');
  }, [router]);

  const searchAgain = useCallback(() => {
    setBitcoinAddress('');
    router.push('/search');
  }, [router, setBitcoinAddress]);

  const toggleProofDialog = useCallback(() => {
    setShowProofDialog(!showProofDialog);
  }, [showProofDialog]);

  if (result === undefined) return null;

  return (
    <main>
      <h1 className={styles.title}>Result:</h1>
      {result ? (
        <>
          <div className={styles.alertSection}>
            <Alert type='success'>
              Registered and cryptographically linked to post-quantum addresses
            </Alert>
          </div>
          <div className={styles.entrySection}>
            <DirectoryEntry
              bitcoinAddress={bitcoinAddress}
              mldsa44Address={result.ml_dsa_44_address}
              slhdsaSha2S128Address={result.slh_dsa_sha2_s_128_address}
            />
          </div>
          <div className={styles.entryDetailsSection}>
            <ToolbarButton onClick={toggleProofDialog}>
              <DownloadIcon /> View and download proof
            </ToolbarButton>
          </div>
        </>
      ) : (
        <div className={styles.noResult}>
          <p>
            Bitcoin address &quot;
            <span className={styles.bitcoinAddressText}>{bitcoinAddress}</span>
            &quot; is not in the directory.
          </p>
          <p>
            Do you own this address?{' '}
            <Link href='/register/step-1'>Register now</Link>.
          </p>
        </div>
      )}
      <div className={styles.footer}>
        <Button variant='secondary' onClick={searchAgain}>
          <ArrowLeftIcon /> Search
        </Button>
        <Button variant='primary' onClick={navigateToHomepage}>
          Homepage
        </Button>
      </div>
      {showProofDialog && result && (
        <ProofDialog
          proofData={JSON.stringify(result, null, 2)}
          onExit={toggleProofDialog}
        />
      )}
    </main>
  );
}
