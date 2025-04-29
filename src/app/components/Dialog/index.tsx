import styles from './styles.module.css';

export function Dialog({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.dialog}>
      <div className={styles.dialogContent}>{children}</div>
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
