import { ButtonHTMLAttributes, forwardRef } from 'react';
import styles from './styles.module.css';

export const ToolbarButton = forwardRef<
  HTMLButtonElement,
  { children: React.ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>
>(function ToolbarButton({ children, ...props }, ref) {
  return (
    <button ref={ref} {...props} className={styles.toolbarButton}>
      {children}
    </button>
  );
});
