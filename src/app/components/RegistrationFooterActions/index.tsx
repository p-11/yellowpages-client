import styles from './styles.module.css';

export function RegistrationFooterActions({
  children
}: {
  children: React.ReactNode;
}) {
  return <div className={styles.registrationFooterActions}>{children}</div>;
}
