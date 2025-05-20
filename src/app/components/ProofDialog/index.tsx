import { useCallback } from 'react';
import { DownloadIcon } from '@/app/icons/DownloadIcon';
import { Dialog, DialogTitle } from '@/app/components/Dialog';
import { ToolbarButton } from '@/app/components/ToolbarButton';
import { CopyTextToolbarButton } from '@/app/components/CopyTextToolbarButton';
import { Button } from '@/app/components/Button';
import styles from './styles.module.css';

export function ProofDialog({
  proofData,
  onExit
}: {
  proofData: string;
  onExit: () => void;
}) {
  const downloadProofData = useCallback(() => {
    if (!proofData) return;

    const blob = new Blob([proofData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const linkElement = document.createElement('a');
    linkElement.href = url;
    linkElement.download = 'proof.json';
    linkElement.click();

    URL.revokeObjectURL(url);
  }, [proofData]);

  const copyProofData = useCallback(() => {
    if (!proofData) return;

    navigator.clipboard.writeText(proofData);
  }, [proofData]);

  return (
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
        <Button variant='primary' onClick={onExit}>
          Close
        </Button>
      </div>
    </Dialog>
  );
}
