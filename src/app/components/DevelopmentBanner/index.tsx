'use client';

import styles from './styles.module.css';

export function DevelopmentBanner() {
  return (
    <div className={styles.banner}>
      <div className={styles.bannerContent}>
        <span>Note, this is a development environment.</span>
      </div>
    </div>
  );
}
