import { useCallback } from 'react';
import styles from './styles.module.css';
import { CopyTextToolbarButton } from '../CopyTextToolbarButton';

export function DirectoryEntry({
  bitcoinAddress,
  mldsa44Address,
  showCopyButton = false
}: {
  bitcoinAddress: string;
  mldsa44Address: string;
  showCopyButton?: boolean;
}) {
  const copyMldsa44Address = useCallback(() => {
    navigator.clipboard.writeText(mldsa44Address);
  }, [mldsa44Address]);

  return (
    <div
      className={`${styles.entry} ${showCopyButton ? styles.withCopyButton : ''}`}
    >
      <div className={styles.entryTitleBlock}>
        <span className={styles.entryTitle}>ENTRY</span>
      </div>
      <div className={styles.headerRow}>
        <span className={styles.rowHeaderText}>Bitcoin address</span>
        <div className={styles.separator} />
      </div>
      <div className={`${styles.row} ${styles.indented}`}>
        <span className={styles.address}>{bitcoinAddress}</span>
      </div>
      <div className={styles.headerRow}>
        <span className={styles.rowHeaderText}>
          Post-Quantum ML-DSA-44 address
        </span>
        <div className={styles.separator} />
      </div>
      <div className={`${styles.row} ${styles.indented} ${styles.addressRow}`}>
        <div>
          <span className={styles.address}>{mldsa44Address}</span>
        </div>
        {showCopyButton && (
          <CopyTextToolbarButton onClick={copyMldsa44Address} />
        )}
      </div>
    </div>
  );
}
