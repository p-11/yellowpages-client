import Link, { LinkProps } from 'next/link';
import styles from './styles.module.css';

export function RegistrationFooterLink(
  props: LinkProps & {
    children: React.ReactNode;
    variant: 'primary' | 'secondary';
  }
) {
  return (
    <Link
      {...props}
      className={
        props.variant === 'primary'
          ? styles.primaryRegistrationFooterLink
          : styles.secondaryRegistrationFooterLink
      }
    >
      {props.children}
    </Link>
  );
}
