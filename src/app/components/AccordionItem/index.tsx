'use client';

import { useCallback, useState } from 'react';
import styles from './styles.module.css';

export const AccordionItem = ({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggle = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  return (
    <div className={styles.accordion}>
      <button className={styles.accordionHeader} onClick={toggle}>
        <h3>{title}</h3>
        <div className={styles.accordionSeparator} />
        <span className={styles.accordionIndicator}>
          {isExpanded ? '-' : '+'}
        </span>
      </button>
      {isExpanded && <div className={styles.accordionContent}>{children}</div>}
    </div>
  );
};
