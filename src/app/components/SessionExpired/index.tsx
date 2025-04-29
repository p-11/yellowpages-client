'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/Button';
import { Alert } from '@/app/components/Alert';
import styles from './styles.module.css';

export function SessionExpired() {
  const router = useRouter();

  const cancel = useCallback(() => {
    router.push('/');
  }, [router]);

  const register = useCallback(() => {
    router.push('/register/step-1');
  }, [router]);

  return (
    <main>
      <h1 className={styles.title}>Session expired</h1>
      <div className={styles.content}>
        <p>
          Your session has expired and your registraion has been cancelled for
          security purposes.
        </p>
        <div className={styles.warningSection}>
          <Alert>By starting again, a new seed phrase will be generated.</Alert>
        </div>
        <div className={styles.footer}>
          <Button variant='primary' onClick={register}>
            Start again
          </Button>
          <Button variant='secondary' onClick={cancel}>
            Registry home
          </Button>
        </div>
      </div>
    </main>
  );
}
