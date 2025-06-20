'use client';

import { useCallback, useRef, useState } from 'react';
import { Dialog, DialogTitle } from '@/app/components/Dialog';
import { Button } from '@/app/components/Button';
import { CheckIcon } from '@/app/icons/CheckIcon';
import { LoaderCircleIcon } from '@/app/icons/LoaderCircleIcon';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import styles from './styles.module.css';

export function EmailDialog({ onExit }: { onExit: () => void }) {
  const [email, setEmail] = useState('');
  const [showInvalidEmailAlert, setShowInvalidEmailAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [cfTurnstileToken, setCfTurnstileToken] = useState<string | null>(null);
  const cfTurnstileRef = useRef<TurnstileInstance>(null);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    setShowInvalidEmailAlert(false);
    setApiError(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!isValidEmail(email)) {
      setShowInvalidEmailAlert(true);
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      if (!cfTurnstileToken) throw new Error('Invalid CF Turnstile token');

      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CF-Turnstile-Token': cfTurnstileToken
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.status === 'error') {
        cfTurnstileRef.current?.reset();
        setApiError('Failed to subscribe. Please try again.');
        return;
      }

      setIsSuccess(true);
    } catch {
      cfTurnstileRef.current?.reset();
      setApiError('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, cfTurnstileToken]);

  if (isSuccess) {
    return (
      <Dialog large>
        <DialogTitle>Subscribe to our e-mail bulletin</DialogTitle>
        <div className={styles.emailSection}>
          <div className={styles.successMessage}>
            <CheckIcon />
            <p>Subscribed!</p>
          </div>
        </div>
        <div className={styles.emailDialogFooter}>
          <Button variant='primary' onClick={onExit}>
            Close
          </Button>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog large>
      <DialogTitle>Subscribe to our e-mail bulletin</DialogTitle>
      <div className={styles.emailSection}>
        <div className={styles.inputBox}>
          <label htmlFor='email' className={styles.inputLabel}>
            Enter your email address
          </label>
          <input
            id='email'
            type='email'
            value={email}
            onChange={e => handleEmailChange(e.target.value)}
            autoFocus
            autoComplete='email'
            className={styles.input}
            placeholder='satoshi@bitcoin.org'
            disabled={isSubmitting}
          />
          {showInvalidEmailAlert && (
            <div className={styles.errorMessage}>
              Please enter a valid email address
            </div>
          )}
          {apiError && <div className={styles.errorMessage}>{apiError}</div>}
        </div>
      </div>
      <Turnstile
        ref={cfTurnstileRef}
        siteKey={
          process.env.NEXT_PUBLIC_EMAIL_SIGN_UP_CLOUDFLARE_TURNSTILE_SITE_KEY!
        }
        onSuccess={setCfTurnstileToken}
        onExpire={() => setCfTurnstileToken(null)}
        options={{ theme: 'dark' }}
      />
      <div className={styles.emailDialogFooter}>
        <Button
          variant='primary'
          onClick={handleSubmit}
          disabled={!email || isSubmitting}
        >
          {isSubmitting ? (
            <>
              Subscribing <LoaderCircleIcon />
            </>
          ) : (
            <>
              Subscribe <CheckIcon />
            </>
          )}
        </Button>
        <Button variant='secondary' onClick={onExit} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </Dialog>
  );
}
