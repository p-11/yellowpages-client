import { ButtonHTMLAttributes } from 'react';
import styles from './styles.module.css';

export function Button(
  props: ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
    variant: 'primary' | 'secondary';
  }
) {
  const { children, variant, ...buttonAttributes } = props;

  return (
    <button
      {...buttonAttributes}
      className={
        variant === 'primary' ? styles.primaryButton : styles.secondaryButton
      }
    >
      {children}
    </button>
  );
}
