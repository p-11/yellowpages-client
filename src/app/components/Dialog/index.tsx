import styles from './styles.module.css';

export function Dialog({
  children,
  large = false
}: {
  children: React.ReactNode;
  large?: boolean;
}) {
  return (
    <div className={styles.dialog}>
      <div className={`${styles.dialogContent} ${large ? styles.large : ''}`}>
        {children}
      </div>
    </div>
  );
}

export const DialogTitle = ({ children }: { children: React.ReactNode }) => (
  <p className={styles.dialogTitle}>{children}</p>
);
export const DialogDescription = ({
  children
}: {
  children: React.ReactNode;
}) => <p className={styles.dialogDescription}>{children}</p>;
export const DialogFooter = ({ children }: { children: React.ReactNode }) => (
  <div className={styles.dialogFooter}>{children}</div>
);
