'use client';

import { FormEventHandler, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/Button';
import { ArrowRightIcon } from '@/app/icons/ArrowRightIcon';
import { useVerificationContext } from '@/app/providers/VerificationProvider';
import { searchYellowpagesByBtcAddress } from '@/core/api';
import { LoaderCircleIcon } from '@/app/icons/LoaderCircleIcon';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogTitle
} from '@/app/components/Dialog';
import { isValidBitcoinAddress } from '@/core/cryptography';
import styles from './styles.module.css';

export function Verification() {
  const router = useRouter();
  const { setResult, bitcoinAddress, setBitcoinAddress } =
    useVerificationContext();
  const [showInvalidBitcoinAddressAlert, setShowInvalidBitcoinAddressAlert] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const changeBitcoinAddress = useCallback(
    (value: string) => {
      setBitcoinAddress(value.trim());
    },
    [setBitcoinAddress]
  );

  const cancel = useCallback(() => {
    router.push('/');
  }, [router]);

  const onSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    async e => {
      e.preventDefault();

      if (isValidBitcoinAddress(bitcoinAddress)) {
        setIsSubmitting(true);

        try {
          const result = await searchYellowpagesByBtcAddress(bitcoinAddress);
          setResult(result);
        } catch {
          setResult(null);
        }

        setIsSubmitting(false);
        router.push('/verification/result');
      } else {
        setShowInvalidBitcoinAddressAlert(true);
      }
    },
    [router, bitcoinAddress, setResult]
  );

  const acknowledgeInvalidBitcoinAddressAlert = useCallback(() => {
    setShowInvalidBitcoinAddressAlert(false);
  }, []);

  return (
    <main>
      <h1 className={styles.title}>Search the yellowpages</h1>
      <p>Enter a Bitcoin address to check if it&apos;s post-quantum secure.</p>
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
          <Button variant='primary' type='submit' disabled={isSubmitting}>
            Search
            {isSubmitting ? <LoaderCircleIcon /> : <ArrowRightIcon />}
          </Button>
        </div>
      </form>
      {showInvalidBitcoinAddressAlert && (
        <Dialog>
          <DialogTitle>Invalid Bitcoin address</DialogTitle>
          <DialogDescription>
            Please check the Bitcoin address entered and try again.
          </DialogDescription>
          <DialogFooter>
            <Button
              variant='primary'
              onClick={acknowledgeInvalidBitcoinAddressAlert}
            >
              Continue
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </main>
  );
}
