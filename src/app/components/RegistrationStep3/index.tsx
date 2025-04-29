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
import { registrationData } from '@/core/registrationData';
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
import styles from './styles.module.css';

export function RegistrationStep3() {
  const router = useRouter();
  const {
    signingMessage,
    bitcoinAddress,
    signature,
    changeBitcoinAddress,
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
    const isValid = registrationData.validateBitcoinAddress(bitcoinAddress);

    if (!isValid) {
      setShowInvalidBitcoinAddressAlert(true);
      return;
    }

    setIsBitcoinAddressConfirmed(true);
    generateSigningMessage();
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
    const isValid = registrationData.validateSignature(signature);

    if (isValid) {
      router.push('/registration-complete');
    } else {
      setShowInvalidSignatureAlert(true);
    }
  }, [router, signature]);

  const tryAgain = useCallback(() => {
    resetSignature();
    setIsFailedAttempt(false);
  }, [resetSignature]);

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
            The address provided isn&apos;t in a valid format. Please make sure
            this is your public Bitcoin address and try again.
          </DialogDescription>
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
  const [bitcoinAddress, setBitcoinAddress] = useState('');
  const [signingMessage, setSigningMessage] = useState('');
  const [signature, setSignature] = useState('');

  const clearSensitiveState = useCallback(() => {
    setBitcoinAddress('');
    setSigningMessage('');
    setSignature('');
  }, []);

  useEffect(() => {
    if (!registrationData.getPqAddress()) {
      registrationData.generatePqAddress();
    }

    return function cleanup() {
      clearSensitiveState();
    };
  }, [clearSensitiveState]);

  const generateSigningMessage = useCallback(() => {
    setSigningMessage(registrationData.generateSigningMessage());
  }, []);

  const changeBitcoinAddress = useCallback((value: string) => {
    registrationData.setBitcoinAddress(value);
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
