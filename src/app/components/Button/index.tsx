import { ButtonHTMLAttributes } from 'react';
import styles from './styles.module.css';

export function Button(
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
          ? styles.primaryButton
          : styles.secondaryButton
      }
    >
      {props.children}
    </button>
  );
}
