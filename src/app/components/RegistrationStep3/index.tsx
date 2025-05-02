'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegistrationProgressIndicator } from '@/app/components/RegistrationProgressIndicator';
import { RegistrationStepTitle } from '@/app/components/RegistrationStepTitle';
import { RegistrationHeader } from '@/app/components/RegistrationHeader';
import { HighlightedBox } from '@/app/components/HighlightedBox';
import { Toolbar } from '@/app/components/Toolbar';
import { ToolbarButton } from '@/app/components/ToolbarButton';
import { CheckIcon } from '@/app/icons/CheckIcon';
import { Button } from '@/app/components/Button';
import { ArrowRightIcon } from '@/app/icons/ArrowRightIcon';
import { ArrowLeftIcon } from '@/app/icons/ArrowLeftIcon';
import { SquarePenIcon } from '@/app/icons/SquarePenIcon';
import { RegistrationFooterActions } from '../RegistrationFooterActions';
import { CopyTextToolbarButton } from '../CopyTextToolbarButton';
import { Alert } from '@/app/components/Alert';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogTitle
} from '../Dialog';
import { useRegistrationSessionContext } from '@/app/providers/RegistrationSessionProvider';
import {
  generateSignedMessages,
  isValidBitcoinAddress,
  isValidBitcoinSignature
} from '@/core/cryptography';
import styles from './styles.module.css';

export function RegistrationStep3() {
  const router = useRouter();
  const {
    signingMessage,
    signature,
    changeSignature,
    resetSignature,
    generateSigningMessage
  } = useSensitiveState();
  const [isBitcoinAddressConfirmed, setIsBitcoinAddressConfirmed] =
    useState(false);
  const [isFailedAttempt, setIsFailedAttempt] = useState(false);
  const [autoFocusBitcoinAddressField, setAutoFocusBitcoinAddressField] =
    useState(false);
  const [showInvalidBitcoinAddressAlert, setShowInvalidBitcoinAddressAlert] =
    useState(false);
  const [showInvalidSignatureAlert, setShowInvalidSignatureAlert] =
    useState(false);
  const { bitcoinAddress, seedPhrase, setBitcoinAddress, setPqAddress } =
    useRegistrationSessionContext();

  const isBitcoinAddressPopulated = bitcoinAddress.length > 0;
  const isSignaturePopulated = signature.length > 0;

  const copySigningMessage = useCallback(() => {
    navigator.clipboard.writeText(signingMessage);
  }, [signingMessage]);

  const acknowledgeBitcoinAddressAlert = useCallback(() => {
    setShowInvalidBitcoinAddressAlert(false);
  }, []);

  const acknowledgeSignatureAlert = useCallback(() => {
    setShowInvalidSignatureAlert(false);
  }, []);

  const confirmBitcoinAddress = useCallback(() => {
    if (isValidBitcoinAddress(bitcoinAddress)) {
      setIsBitcoinAddressConfirmed(true);
      generateSigningMessage();
    } else {
      setShowInvalidBitcoinAddressAlert(true);
    }
  }, [generateSigningMessage, bitcoinAddress]);

  const editBitcoinAddress = useCallback(() => {
    setAutoFocusBitcoinAddressField(true);
    setIsBitcoinAddressConfirmed(false);
    resetSignature();
  }, [resetSignature]);

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  const completeRegistration = useCallback(() => {
    if (isValidBitcoinSignature(signingMessage, signature, bitcoinAddress)) {
      const signedMessages = generateSignedMessages(seedPhrase, signingMessage);

      setPqAddress(signedMessages.ML_DSA_44.address);

      router.push('/registration-complete');
    } else {
      setShowInvalidSignatureAlert(true);
    }
  }, [
    router,
    signature,
    bitcoinAddress,
    signingMessage,
    seedPhrase,
    setPqAddress
  ]);

  const tryAgain = useCallback(() => {
    resetSignature();
    setIsFailedAttempt(false);
  }, [resetSignature]);

  const changeBitcoinAddress = useCallback(
    (value: string) => {
      setBitcoinAddress(value);
    },
    [setBitcoinAddress]
  );

  return (
    <main
      className={`${isBitcoinAddressConfirmed ? styles.confirmed : ''} ${isFailedAttempt ? styles.failedAttempt : ''}`}
    >
      <RegistrationHeader>
        <RegistrationProgressIndicator activeStep='Step 3' />
        <RegistrationStepTitle>Generate your signature</RegistrationStepTitle>
      </RegistrationHeader>
      <div className={styles.content}>
        <Alert>
          Your wallet must support message signing with arbitrary data.
        </Alert>
        <div className={styles.step1}>
          <div className={styles.inputBox}>
            <label htmlFor='publicBitcoinAddress' className={styles.inputLabel}>
              1. Enter your public Bitcoin address
            </label>
            <input
              key={isBitcoinAddressConfirmed ? 'hidden' : undefined}
              id='publicBitcoinAddress'
              hidden={isBitcoinAddressConfirmed}
              disabled={isBitcoinAddressConfirmed}
              value={bitcoinAddress}
              autoFocus={autoFocusBitcoinAddressField}
              autoComplete='off'
              autoCorrect='off'
              autoCapitalize='off'
              onChange={e => changeBitcoinAddress(e.target.value)}
            />
            {isBitcoinAddressConfirmed && (
              <span className={styles.confirmedInput}>{bitcoinAddress}</span>
            )}
          </div>
          <Toolbar>
            {isBitcoinAddressConfirmed ? (
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
            <CopyTextToolbarButton onClick={copySigningMessage} />
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
      </div>
      <div className={styles.footer}>
        <div className={styles.floatingFooter}>
          <div className={styles.failedAttemptFooterOverlay}>
            <Alert>Verification failed. Please try again.</Alert>
          </div>
        </div>
        <RegistrationFooterActions>
          <Button variant='secondary' onClick={goBack}>
            <ArrowLeftIcon />
            Back
          </Button>
          {isFailedAttempt ? (
            <Button variant='primary' onClick={tryAgain}>
              Try again
            </Button>
          ) : (
            <Button
              variant='primary'
              onClick={completeRegistration}
              disabled={!isSignaturePopulated}
            >
              Complete <ArrowRightIcon />
            </Button>
          )}
        </RegistrationFooterActions>
      </div>
      {showInvalidBitcoinAddressAlert && (
        <Dialog>
          <DialogTitle>Invalid Bitcoin address</DialogTitle>
          <DialogDescription>
            Please check the Bitcoin address entered and try again.
          </DialogDescription>
          <Alert>Make sure to enter your public Bitcoin address</Alert>
          <DialogFooter>
            <Button variant='primary' onClick={acknowledgeBitcoinAddressAlert}>
              Continue
            </Button>
          </DialogFooter>
        </Dialog>
      )}
      {showInvalidSignatureAlert && (
        <Dialog>
          <DialogTitle>Invalid signature</DialogTitle>
          <DialogDescription>
            Please check the signature entered and try again.
          </DialogDescription>
          <DialogFooter>
            <Button variant='primary' onClick={acknowledgeSignatureAlert}>
              Continue
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </main>
  );
}

const useSensitiveState = () => {
  const [signingMessage, setSigningMessage] = useState('');
  const [signature, setSignature] = useState('');

  const clearSensitiveState = useCallback(() => {
    setSigningMessage('');
    setSignature('');
  }, []);

  useEffect(() => {
    return function cleanup() {
      clearSensitiveState();
    };
  }, [clearSensitiveState]);

  const generateSigningMessage = useCallback(() => {
    setSigningMessage('hello world'); // TODO: integrate with new core module function
  }, []);

  const changeSignature = useCallback((value: string) => {
    setSignature(value);
  }, []);

  const resetSignature = useCallback(() => {
    setSignature('');
  }, []);

  return {
    signingMessage,
    signature,
    generateSigningMessage,
    changeSignature,
    resetSignature,
    clearSensitiveState
  };
};
