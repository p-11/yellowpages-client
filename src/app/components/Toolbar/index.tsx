import styles from './styles.module.css';

export function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className={styles.toolbar}>{children}</div>;
}
