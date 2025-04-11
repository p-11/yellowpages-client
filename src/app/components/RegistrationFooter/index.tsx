import styles from './styles.module.css';

export function RegistrationFooter({
  children
}: {
  children: React.ReactNode;
}) {
  return <div className={styles.registrationFooter}>{children}</div>;
}
