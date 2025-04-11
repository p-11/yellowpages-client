import { WarningIcon } from '@/app/icons/WarningIcon';
import styles from './styles.module.css';

export function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.warning}>
      <WarningIcon />
      <span className={styles.warningText}>{children}</span>
    </div>
  );
}
