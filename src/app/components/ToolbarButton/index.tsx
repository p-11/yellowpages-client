import { ButtonHTMLAttributes } from 'react';
import styles from './styles.module.css';

export function ToolbarButton(
  props: { children: React.ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <button {...props} className={styles.toolbarButton}>
      {props.children}
    </button>
  );
}
