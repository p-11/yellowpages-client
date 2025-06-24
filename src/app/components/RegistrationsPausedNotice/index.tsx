'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/Button';
import styles from './styles.module.css';

export function RegistrationsPausedNotice() {
  const router = useRouter();

  const navigateToHomepage = useCallback(() => {
    router.push('/');
  }, [router]);

  return (
    <main>
      <h1 className={styles.title}>Registration is temporarily paused</h1>
      <div className={styles.content}>
        <p>Please check back later and try again.</p>
        <div className={styles.footer}>
          <Button variant='primary' onClick={navigateToHomepage}>
            Directory home
          </Button>
        </div>
      </div>
    </main>
  );
}
