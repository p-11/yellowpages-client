import { CircleAlertIcon } from '@/app/icons/CircleAlertIcon';
import { CircleCheckIcon } from '@/app/icons/CircleCheckIcon';
import styles from './styles.module.css';

export function Alert({
  children,
  type = 'warning',
  className
}: {
  children: React.ReactNode;
  type?: 'warning' | 'success';
  className?: string;
}) {
  return (
    <div className={`${styles.alert} ${styles[type] ?? ''} ${className ?? ''}`}>
      {type === 'warning' ? <CircleAlertIcon /> : <CircleCheckIcon />}
      <span className={styles.alertText}>{children}</span>
    </div>
  );
}
