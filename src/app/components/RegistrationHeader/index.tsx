import styles from './styles.module.css';

export function RegistrationHeader({
  children
}: {
  children: React.ReactNode;
}) {
  return <div className={styles.registrationHeader}>{children}</div>;
}
