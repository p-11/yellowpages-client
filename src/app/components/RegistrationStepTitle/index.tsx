import styles from './styles.module.css';

export function RegistrationStepTitle({
  children
}: {
  children: React.ReactNode;
}) {
  return <h1 className={styles.registrationStepTitle}>{children}</h1>;
}
