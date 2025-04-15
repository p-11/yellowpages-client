import { WarningIcon } from '@/app/icons/WarningIcon';
import styles from './styles.module.css';

export function Warning({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`${styles.warning} ${className ?? ''}`}>
      <WarningIcon />
      <span className={styles.warningText}>{children}</span>
    </div>
  );
}
