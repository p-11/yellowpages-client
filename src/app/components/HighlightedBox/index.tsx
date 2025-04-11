import styles from './styles.module.css';

export function HighlightedBox({
  label,
  children,
  className
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {!!label && <span>{label}</span>}
      <div className={styles.highlightedBox}>{children}</div>
    </div>
  );
}
