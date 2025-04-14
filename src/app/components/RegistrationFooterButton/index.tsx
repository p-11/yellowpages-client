import { ButtonHTMLAttributes } from 'react';
import styles from './styles.module.css';

export function RegistrationFooterButton(
  props: ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
    variant: 'primary' | 'secondary';
  }
) {
  return (
    <button
      {...props}
      className={
        props.variant === 'primary'
          ? styles.primaryRegistrationFooterButton
          : styles.secondaryRegistrationFooterButton
      }
    >
      {props.children}
    </button>
  );
}
