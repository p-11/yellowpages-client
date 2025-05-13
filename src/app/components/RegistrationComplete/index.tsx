'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/Button';
import { Alert } from '@/app/components/Alert';
import { useRegistrationSessionContext } from '@/app/providers/RegistrationSessionProvider';
import { DirectoryEntry } from '@/app/components/DirectoryEntry';
import { Dialog, DialogTitle } from '@/app/components/Dialog';
import { CopyTextToolbarButton } from '@/app/components/CopyTextToolbarButton';
import { ToolbarButton } from '@/app/components/ToolbarButton';
import { DownloadIcon } from '@/app/icons/DownloadIcon';
import styles from './styles.module.css';

export function RegistrationComplete() {
  const { signedMessages, bitcoinAddress, proofData } =
    useRegistrationSessionContext();
  const router = useRouter();
  const [showProofDialog, setShowProofDialog] = useState(true);

  const navigateToHomepage = useCallback(() => {
    router.push('/');
  }, [router]);

  const toggleProofDialog = useCallback(() => {
    setShowProofDialog(!showProofDialog);
  }, [showProofDialog]);

  const downloadProofData = useCallback(() => {
    if (!proofData) return;

    const blob = new Blob([proofData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'proof.json';
    link.click();

    URL.revokeObjectURL(url);
  }, [proofData]);

  const copyProofData = useCallback(() => {
    if (!proofData) return;

    navigator.clipboard.writeText(proofData);
  }, [proofData]);

  if (!bitcoinAddress || !signedMessages) return null;

  return (
    <main>
      <h1 className={styles.title}>Registration complete!</h1>
      <div className={styles.content}>
        <p>
          Your post-quantum (PQ) address has been created and cryptographically
          linked to your Bitcoin address.
        </p>
        <div className={styles.warningSection}>
          <Alert>Remember to save your new post-quantum addresses</Alert>
        </div>
        <div className={styles.entrySection}>
          <DirectoryEntry
            bitcoinAddress={bitcoinAddress}
            mldsa44Address={signedMessages.ML_DSA_44.address}
            showCopyButton
          />
        </div>
        <div className={styles.entryDetailsSection}>
          <ToolbarButton onClick={toggleProofDialog}>
            <DownloadIcon /> View and download your proof
          </ToolbarButton>
        </div>
        <div>
          <h2 className={styles.sectionTitle}>What&apos;s next?</h2>
          <p>
            Check your registration by{' '}
            <Link href='/search'>searching the directory</Link> or visit our{' '}
            <Link href='/faqs'>FAQs page</Link> to learn more.
          </p>
          <p>
            Own multiple wallets? You can register more than one address. Please
            note that each address will be linked to a different post-quantum
            address.
          </p>
        </div>
        <div className={styles.footer}>
          <Button variant='primary' onClick={navigateToHomepage}>
            Directory home
          </Button>
        </div>
      </div>
      {showProofDialog && (
        <Dialog large>
          <DialogTitle>Proof</DialogTitle>
          <div className={styles.proofSection}>
            <pre className={styles.proofData}>{proofData}</pre>
            <div className={styles.proofDialogToolbar}>
              <ToolbarButton onClick={downloadProofData}>
                <DownloadIcon /> Download
              </ToolbarButton>
              <CopyTextToolbarButton onClick={copyProofData} />
            </div>
          </div>
          <div className={styles.proofDialogFooter}>
            <Button variant='primary' onClick={toggleProofDialog}>
              Continue
            </Button>
          </div>
        </Dialog>
      )}
    </main>
  );
}
