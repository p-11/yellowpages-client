'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/app/components/Button';
import { Alert } from '@/app/components/Alert';
import { useRegistrationContext } from '@/app/providers/RegistrationProvider';
import { DirectoryEntry } from '@/app/components/DirectoryEntry';
import { CopyTextToolbarButton } from '@/app/components/CopyTextToolbarButton';
import { ToolbarButton } from '@/app/components/ToolbarButton';
import { DownloadIcon } from '@/app/icons/DownloadIcon';
import { ProofDialog } from '@/app/components/ProofDialog';
import { Dialog, DialogTitle } from '@/app/components/Dialog';
import { ShareIcon } from '@/app/icons/ShareIcon';
import styles from './styles.module.css';

export function RegistrationComplete() {
  const { proof } = useRegistrationContext();
  const router = useRouter();
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  useEffect(
    function handleRedirection() {
      if (!proof) {
        router.push('/');
      }
    },
    [router, proof]
  );

  const navigateToHomepage = useCallback(() => {
    router.push('/');
  }, [router]);

  const toggleProofDialog = useCallback(() => {
    setShowProofDialog(!showProofDialog);
  }, [showProofDialog]);

  const toggleShareDialog = useCallback(() => {
    setShowShareDialog(!showShareDialog);
  }, [showShareDialog]);

  const encodedBitcoinAddress = useMemo(
    () => (proof ? encodeURIComponent(proof.btc_address) : ''),
    [proof]
  );
  const encodedMldsa44Address = useMemo(
    () => (proof ? encodeURIComponent(proof.ml_dsa_44_address) : ''),
    [proof]
  );
  const encodedSlhdsaSha2S128Address = useMemo(
    () => (proof ? encodeURIComponent(proof.slh_dsa_sha2_s_128_address) : ''),
    [proof]
  );

  const shareLink = useMemo(() => {
    return `https://yellowpages.xyz/share/?btc=${encodedBitcoinAddress}&mldsa44=${encodedMldsa44Address}&slhdsaSha2S128=${encodedSlhdsaSha2S128Address}`;
  }, [
    encodedBitcoinAddress,
    encodedMldsa44Address,
    encodedSlhdsaSha2S128Address
  ]);

  const copyShareLink = useCallback(() => {
    navigator.clipboard.writeText(shareLink);
  }, [shareLink]);

  if (!proof) return null;

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
            bitcoinAddress={proof.btc_address}
            mldsa44Address={proof.ml_dsa_44_address}
            slhdsaSha2S128Address={proof.slh_dsa_sha2_s_128_address}
            showCopyButton
          />
        </div>
        <div className={styles.entryToolbar}>
          <ToolbarButton onClick={toggleProofDialog}>
            <DownloadIcon /> View and download proof
          </ToolbarButton>
          <ToolbarButton onClick={toggleShareDialog}>
            <ShareIcon /> Share your entry
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
            Own multiple addresses? You can{' '}
            <Link href='/register/step-1'>register</Link> as many addresses as
            you need to. Each address will be linked to a different post-quantum
            address suite.
          </p>
        </div>
        <div className={styles.footer}>
          <Button variant='primary' onClick={navigateToHomepage}>
            Directory home
          </Button>
        </div>
      </div>
      {showProofDialog && (
        <ProofDialog
          proofData={JSON.stringify(proof, null, 2)}
          onExit={toggleProofDialog}
        />
      )}
      {showShareDialog && (
        <Dialog large>
          <DialogTitle>Share your entry</DialogTitle>
          <div className={styles.shareDialogContent}>
            <Image
              className={styles.ogImage}
              width={702}
              height={368}
              alt='yellowpages entry'
              src={`/og-image?btc=${encodedBitcoinAddress}&mldsa44=${encodedMldsa44Address}&slhdsaSha2S128=${encodedSlhdsaSha2S128Address}`}
            />
          </div>
          <div className={styles.shareLinkBox}>
            <span className={styles.shareLink}>{shareLink}</span>
          </div>
          <CopyTextToolbarButton label='Copy link' onClick={copyShareLink} />
          <div className={styles.shareDialogFooter}>
            <Button variant='primary' onClick={toggleShareDialog}>
              Close
            </Button>
          </div>
        </Dialog>
      )}
    </main>
  );
}
