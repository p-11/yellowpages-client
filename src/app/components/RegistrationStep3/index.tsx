'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegistrationProgressIndicator } from '@/app/components/RegistrationProgressIndicator';
import { RegistrationStepTitle } from '@/app/components/RegistrationStepTitle';
import { Warning } from '@/app/components/Warning';
import { RegistrationHeader } from '@/app/components/RegistrationHeader';
import { RegistrationFooter } from '@/app/components/RegistrationFooter';
import { HighlightedBox } from '@/app/components/HighlightedBox';
import { Toolbar } from '@/app/components/Toolbar';
import { ToolbarButton } from '@/app/components/ToolbarButton';
import { CheckIcon } from '@/app/icons/CheckIcon';
import { CopyIcon } from '@/app/icons/CopyIcon';
import { RegistrationFooterButton } from '@/app/components/RegistrationFooterButton';
import { ArrowRightIcon } from '@/app/icons/ArrowRightIcon';
import { registrationData } from '@/core/registrationData';
import { ArrowLeftIcon } from '@/app/icons/ArrowLeftIcon';
import { SquarePenIcon } from '@/app/icons/SquarePenIcon';
import styles from './styles.module.css';

export function RegistrationStep3() {
  const [isCopiedIndicatorVisible, setIsCopiedIndicatorVisible] =
    useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const router = useRouter();
  const {
    signingMessage,
    bitcoinAddress,
    signature,
    changeBitcoinAddress,
    changeSignature,
    resetSignature,
    generateSigningMessage,
    clearSensitiveState
  } = useSensitiveState();
  const [hasConfirmedBitcoinAddress, setHasConfirmedBitcoinAddress] =
    useState(false);

  const isBitcoinAddressPopulated = bitcoinAddress.length > 0;
  const isSignaturePopulated = signature.length > 0;

  const copyMessage = useCallback(() => {
    navigator.clipboard.writeText(signingMessage);

    setIsCopiedIndicatorVisible(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsCopiedIndicatorVisible(false);
      timeoutRef.current = null;
    }, 1000);
  }, [signingMessage]);

  const confirmBitcoinAddress = useCallback(() => {
    setHasConfirmedBitcoinAddress(true);
    generateSigningMessage();
  }, [generateSigningMessage]);

  const editBitcoinAddress = useCallback(() => {
    setHasConfirmedBitcoinAddress(false);
    resetSignature();
  }, [resetSignature]);

  const goBack = useCallback(() => {
    clearSensitiveState();
    router.back();
  }, [router, clearSensitiveState]);

  const completeRegistration = useCallback(() => {
    clearSensitiveState();
    router.push('/registration-complete');
  }, [router, clearSensitiveState]);

  return (
    <main className={hasConfirmedBitcoinAddress ? styles.confirmed : ''}>
      <RegistrationHeader>
        <RegistrationProgressIndicator activeStep='Step 3' />
        <RegistrationStepTitle>Generate your signature</RegistrationStepTitle>
      </RegistrationHeader>
      <Warning className={styles.warning}>
        Your wallet must support message signing with arbitrary data.
      </Warning>
      <div className={styles.step1}>
        <div className={styles.inputBox}>
          <label htmlFor='publicBitcoinAddress' className={styles.inputLabel}>
            1. Enter your public Bitcoin address
          </label>
          <input
            id='publicBitcoinAddress'
            hidden={hasConfirmedBitcoinAddress}
            disabled={hasConfirmedBitcoinAddress}
            value={bitcoinAddress}
            autoComplete='off'
            autoCorrect='off'
            autoCapitalize='off'
            onChange={e => changeBitcoinAddress(e.target.value)}
          />
          {hasConfirmedBitcoinAddress && (
            <span className={styles.confirmedInput}>{bitcoinAddress}</span>
          )}
        </div>
        <Toolbar>
          {hasConfirmedBitcoinAddress ? (
            <ToolbarButton onClick={editBitcoinAddress}>
              <SquarePenIcon />
              Edit
            </ToolbarButton>
          ) : (
            <button
              className={styles.confirmButton}
              onClick={confirmBitcoinAddress}
              disabled={!isBitcoinAddressPopulated}
            >
              Confirm <CheckIcon />
            </button>
          )}
        </Toolbar>
      </div>
      <div className={styles.step2}>
        <span className={styles.inputLabel}>
          2. Sign this message with your wallet
        </span>
        <HighlightedBox>
          <span className={styles.signingMessage}>{signingMessage}</span>
        </HighlightedBox>
        <Toolbar>
          <ToolbarButton onClick={copyMessage}>
            {isCopiedIndicatorVisible ? (
              <>
                <CheckIcon stroke='#7fd17f' />
                Copied
              </>
            ) : (
              <>
                <CopyIcon />
                Copy
              </>
            )}
          </ToolbarButton>
        </Toolbar>
      </div>
      <div className={styles.step3}>
        <div className={styles.inputBox}>
          <label htmlFor='signature' className={styles.inputLabel}>
            3. Enter the generated signature
          </label>
          <textarea
            id='signature'
            value={signature}
            autoComplete='off'
            autoCorrect='off'
            autoCapitalize='off'
            onChange={e => changeSignature(e.target.value)}
          />
        </div>
      </div>
      <div
        className={`${styles.footer} ${!hasConfirmedBitcoinAddress ? styles.stickyFooter : ''}`}
      >
        <RegistrationFooter>
          <RegistrationFooterButton variant='secondary' onClick={goBack}>
            <ArrowLeftIcon />
            Back
          </RegistrationFooterButton>
          <RegistrationFooterButton
            variant='primary'
            onClick={completeRegistration}
            disabled={!isSignaturePopulated}
          >
            Complete <ArrowRightIcon />
          </RegistrationFooterButton>
        </RegistrationFooter>
      </div>
    </main>
  );
}

const useSensitiveState = () => {
  const [bitcoinAddress, setBitcoinAddress] = useState('');
  const [signingMessage, setSigningMessage] = useState('');
  const [signature, setSignature] = useState('');

  const clearSensitiveState = useCallback(() => {
    setBitcoinAddress('');
    setSigningMessage('');
    setSignature('');
  }, []);

  useEffect(() => {
    return function cleanup() {
      clearSensitiveState();
    };
  }, [clearSensitiveState]);

  const generateSigningMessage = useCallback(() => {
    setSigningMessage(registrationData.generateSigningMessage());
  }, []);

  const changeBitcoinAddress = useCallback((value: string) => {
    setBitcoinAddress(value);
  }, []);

  const changeSignature = useCallback((value: string) => {
    setSignature(value);
  }, []);

  const resetSignature = useCallback(() => {
    setSignature('');
  }, []);

  return {
    bitcoinAddress,
    signingMessage,
    signature,
    changeBitcoinAddress,
    generateSigningMessage,
    changeSignature,
    resetSignature,
    clearSensitiveState
  };
};
