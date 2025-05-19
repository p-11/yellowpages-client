'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
import { RegistrationFooterActions } from '@/app/components/RegistrationFooterActions';
import { CopyTextToolbarButton } from '@/app/components/CopyTextToolbarButton';
import { Alert } from '@/app/components/Alert';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogTitle
} from '@/app/components/Dialog';
import { useRegistrationSessionContext } from '@/app/providers/RegistrationSessionProvider';
import {
  BitcoinAddress,
  generateMessage,
  generateSignedMessages,
  isValidBitcoinAddress,
  isValidBitcoinSignature,
  Message,
  SignedMessage
} from '@/core/cryptography';
import { createProof, searchYellowpagesByBtcAddress } from '@/core/api';
import { LoaderCircleIcon } from '@/app/icons/LoaderCircleIcon';
import styles from './styles.module.css';

export function RegistrationStep3() {
  const router = useRouter();
  const {
    signingMessage,
    signature,
    changeSignature,
    resetSignature,
    setSigningMessage
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
  const [showFailedRequestAlert, setShowFailedRequestAlert] = useState(false);
  const {
    bitcoinAddress,
    seedPhrase,
    signedMessages,
    setBitcoinAddress,
    setSignedMessages,
    setProofData
  } = useRegistrationSessionContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const copySigningMessageButtonRef = useRef<HTMLButtonElement>(null);

  const isBitcoinAddressPopulated = bitcoinAddress && bitcoinAddress.length > 0;
  const isSignaturePopulated = signature && signature.length > 0;

  const copySigningMessage = useCallback(() => {
    if (signingMessage) {
      navigator.clipboard.writeText(signingMessage);
    }
  }, [signingMessage]);

  const acknowledgeBitcoinAddressAlert = useCallback(() => {
    setShowInvalidBitcoinAddressAlert(false);
  }, []);

  const acknowledgeSignatureAlert = useCallback(() => {
    setShowInvalidSignatureAlert(false);
  }, []);

  const acknowledgeFailedRequestAlert = useCallback(() => {
    setShowFailedRequestAlert(false);
  }, []);

  const confirmBitcoinAddress = useCallback(() => {
    if (bitcoinAddress && seedPhrase && isValidBitcoinAddress(bitcoinAddress)) {
      const signedMessages = generateSignedMessages(seedPhrase, bitcoinAddress);
      setSignedMessages(signedMessages);

      const { message } = generateMessage({
        bitcoinAddress,
        mldsa44Address: signedMessages.ML_DSA_44.address
      });
      setSigningMessage(message);

      setIsBitcoinAddressConfirmed(true);
    } else {
      setShowInvalidBitcoinAddressAlert(true);
    }
  }, [bitcoinAddress, seedPhrase, setSigningMessage, setSignedMessages]);

  const editBitcoinAddress = useCallback(() => {
    setAutoFocusBitcoinAddressField(true);
    setIsBitcoinAddressConfirmed(false);
    resetSignature();
  }, [resetSignature]);

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  const completeRegistration = useCallback(async () => {
    if (
      signedMessages &&
      signingMessage &&
      signature &&
      bitcoinAddress &&
      isValidBitcoinSignature(signingMessage, signature, bitcoinAddress)
    ) {
      try {
        setIsSubmitting(true);

        await createProof({
          btcAddress: bitcoinAddress,
          btcSignedMessage: signature,
          mldsa44Address: signedMessages.ML_DSA_44.address,
          mldsa44PublicKey: signedMessages.ML_DSA_44.publicKey,
          mldsa44SignedMessage: signedMessages.ML_DSA_44.signedMessage
        });

        const proof = await searchYellowpagesByBtcAddress(bitcoinAddress);

        setProofData(JSON.stringify(proof, null, 2));

        router.push('/registration-complete');
      } catch {
        setShowFailedRequestAlert(true);
        setIsSubmitting(false);
      }
    } else {
      setShowInvalidSignatureAlert(true);
    }
  }, [
    router,
    signature,
    bitcoinAddress,
    signingMessage,
    signedMessages,
    setProofData
  ]);

  const tryAgain = useCallback(() => {
    resetSignature();
    setIsFailedAttempt(false);
  }, [resetSignature]);

  const changeBitcoinAddress = useCallback(
    (value: string) => {
      setBitcoinAddress(value as BitcoinAddress);
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
              value={bitcoinAddress ?? ''}
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
          <button
            className={styles.signingMessageButton}
            onClick={copySigningMessageButtonRef.current?.click}
          >
            <HighlightedBox>
              <span className={styles.signingMessage}>
                {signingMessage ?? ''}
              </span>
            </HighlightedBox>
          </button>
          <Toolbar>
            <CopyTextToolbarButton
              ref={copySigningMessageButtonRef}
              onClick={copySigningMessage}
            />
          </Toolbar>
        </div>
        <div className={styles.step3}>
          <div className={styles.inputBox}>
            <label htmlFor='signature' className={styles.inputLabel}>
              3. Enter the generated signature
            </label>
            <textarea
              id='signature'
              value={signature ?? ''}
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
              disabled={!isSignaturePopulated || isSubmitting}
            >
              Complete{' '}
              {isSubmitting ? <LoaderCircleIcon /> : <ArrowRightIcon />}
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
      {showFailedRequestAlert && (
        <Dialog>
          <DialogTitle>Oops, something went wrong</DialogTitle>
          <DialogDescription>
            Please make sure that your Bitcoin address and signature are correct
            and try again.
          </DialogDescription>
          <Alert>
            If the error persists, please reach out to{' '}
            <a
              href='mailto:team@projecteleven.com'
              className={styles.contactLink}
            >
              team@projecteleven.com
            </a>
          </Alert>
          <DialogFooter>
            <Button variant='primary' onClick={acknowledgeFailedRequestAlert}>
              Continue
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </main>
  );
}

const useSensitiveState = () => {
  const [signingMessage, setSigningMessage] = useState<Message>();
  const [signature, setSignature] = useState<SignedMessage>();

  const clearSensitiveState = useCallback(() => {
    setSigningMessage(undefined);
    setSignature(undefined);
  }, []);

  useEffect(() => {
    return function cleanup() {
      clearSensitiveState();
    };
  }, [clearSensitiveState]);

  const changeSignature = useCallback((value: string) => {
    setSignature(value as SignedMessage);
  }, []);

  const resetSignature = useCallback(() => {
    setSignature(undefined);
  }, []);

  return {
    signingMessage,
    signature,
    changeSignature,
    resetSignature,
    clearSensitiveState,
    setSigningMessage
  };
};
