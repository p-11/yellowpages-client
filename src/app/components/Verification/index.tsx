'use client';

import { FormEventHandler, useCallback } from 'react';
import { Button } from '@/app/components/Button';
import { ArrowRightIcon } from '@/app/icons/ArrowRightIcon';
import { useRouter } from 'next/navigation';
import { useVerificationContext } from '@/app/providers/VerificationProvider';
import styles from './styles.module.css';

export function Verification() {
  const router = useRouter();
  const { setResult, bitcoinAddress, setBitcoinAddress } =
    useVerificationContext();

  const changeBitcoinAddress = useCallback(
    (value: string) => {
      setBitcoinAddress(value);
    },
    [setBitcoinAddress]
  );

  const cancel = useCallback(() => {
    router.push('/');
  }, [router]);

  const onSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    e => {
      e.preventDefault();

      // TODO: fetch result
      setResult(null);

      router.push('/verification/result');
    },
    [router, setResult]
  );

  return (
    <main>
      <h1 className={styles.title}>Check the registry</h1>
      <p>Enter a Bitcoin address to check it&apos;s post-quantum status.</p>
      <form className={styles.searchArea} onSubmit={onSubmit}>
        <div className={styles.inputBox}>
          <label htmlFor='publicBitcoinAddress' className={styles.inputLabel}>
            Bitcoin address:
          </label>
          <input
            required
            value={bitcoinAddress}
            autoComplete='off'
            autoCorrect='off'
            autoCapitalize='off'
            onChange={e => changeBitcoinAddress(e.target.value)}
          />
        </div>
        <div className={styles.footer}>
          <Button type='button' variant='secondary' onClick={cancel}>
            Cancel
          </Button>
          <Button variant='primary' type='submit'>
            Search
            <ArrowRightIcon />
          </Button>
        </div>
      </form>
    </main>
  );
}
