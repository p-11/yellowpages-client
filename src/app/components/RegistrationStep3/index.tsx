'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Turnstile } from '@marsidev/react-turnstile';
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
  isValidBitcoinAddress,
  isValidBitcoinSignature,
  Message,
  SignedMessage
} from '@/core/cryptography';
import { createProof, searchYellowpagesByBtcAddress } from '@/core/api';
import { LoaderCircleIcon } from '@/app/icons/LoaderCircleIcon';
import { createGenerateSignedMessagesTask } from '@/core/cryptographyInWorkers';
import { useRegistrationContext } from '@/app/providers/RegistrationProvider';
import styles from './styles.module.css';

export function RegistrationStep3() {
  const router = useRouter();
  const {
    signingMessage,
    signature,
    bitcoinAddress,
    setSignature,
    setBitcoinAddress,
    setSigningMessage
  } = useSensitiveState();
  const [isBitcoinAddressConfirmed, setIsBitcoinAddressConfirmed] =
    useState(false);
  const [autoFocusBitcoinAddressField, setAutoFocusBitcoinAddressField] =
    useState(false);
  const [showInvalidBitcoinAddressAlert, setShowInvalidBitcoinAddressAlert] =
    useState(false);
  const [showInvalidSignatureAlert, setShowInvalidSignatureAlert] =
    useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const { seedPhrase, pqAddresses, generateAddressesTaskRef, setPqAddresses } =
    useRegistrationSessionContext();
  const { setProof } = useRegistrationContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const copyTextToolbarButtonRef = useRef<{ showSuccessIndicator: () => void }>(
    null
  );
  const [cfTurnstileToken, setCfTurnstileToken] = useState<string | null>(null);
  const generateSignedMessagesTaskRef = useRef(
    createGenerateSignedMessagesTask()
  );

  const isBitcoinAddressPopulated = bitcoinAddress && bitcoinAddress.length > 0;
  const isSignaturePopulated = signature && signature.length > 0;

  useEffect(() => {
    const generateSignedMessagesTask = generateSignedMessagesTaskRef.current;

    return function cleanup() {
      generateSignedMessagesTask.terminate();
    };
  }, []);

  const copySigningMessage = useCallback(() => {
    if (signingMessage) {
      navigator.clipboard.writeText(signingMessage);
    }
  }, [signingMessage]);

  const signingMessageClickHandler = useCallback(() => {
    copySigningMessage();
    copyTextToolbarButtonRef.current?.showSuccessIndicator();
  }, [copySigningMessage]);

  const acknowledgeBitcoinAddressAlert = useCallback(() => {
    setShowInvalidBitcoinAddressAlert(false);
  }, []);

  const acknowledgeSignatureAlert = useCallback(() => {
    setShowInvalidSignatureAlert(false);
  }, []);

  const acknowledgeErrorDialog = useCallback(() => {
    setShowErrorDialog(false);
  }, []);

  const confirmBitcoinAddress = useCallback(async () => {
    try {
      if (bitcoinAddress && isValidBitcoinAddress(bitcoinAddress)) {
        setIsBitcoinAddressConfirmed(true);

        const pqAddressesResult =
          pqAddresses ??
          (await generateAddressesTaskRef.current.waitForResult());

        if (!pqAddressesResult) throw new Error('Invalid PQ addresses');

        const { message } = generateMessage({
          bitcoinAddress,
          mldsa44Address: pqAddressesResult.mldsa44Address,
          slhdsaSha2S128Address: pqAddressesResult.slhdsaSha2S128Address
        });
        setSigningMessage(message);

        if (!pqAddresses) {
          setPqAddresses(pqAddressesResult);
        }

        if (!seedPhrase) throw new Error('Invalid seed phrase');

        generateSignedMessagesTaskRef.current.start({
          mnemonic24: seedPhrase,
          bitcoinAddress
        });
      } else {
        setShowInvalidBitcoinAddressAlert(true);
      }
    } catch {
      setShowErrorDialog(true);
    }
  }, [
    pqAddresses,
    bitcoinAddress,
    seedPhrase,
    generateSignedMessagesTaskRef,
    generateAddressesTaskRef,
    setSigningMessage,
    setPqAddresses
  ]);

  const editBitcoinAddress = useCallback(() => {
    setAutoFocusBitcoinAddressField(true);
    setIsBitcoinAddressConfirmed(false);
    setSignature(undefined);
    generateSignedMessagesTaskRef.current.terminate();
  }, [setSignature]);

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  const completeRegistration = useCallback(async () => {
    try {
      if (!signingMessage) throw new Error('Invalid signing message');
      if (!bitcoinAddress) throw new Error('Invalid Bitcoin address');
      if (!cfTurnstileToken) throw new Error('Invalid CF Turnstile token');

      if (
        signature &&
        isValidBitcoinSignature(signingMessage, signature, bitcoinAddress)
      ) {
        setIsSubmitting(true);

        try {
          const signedMessages =
            await generateSignedMessagesTaskRef.current.waitForResult();

          if (!signedMessages) throw new Error('Invalid signedMessages result');

          await createProof(
            {
              btcAddress: bitcoinAddress,
              btcSignedMessage: signature,
              mldsa44Address: signedMessages.ML_DSA_44.address,
              mldsa44PublicKey: signedMessages.ML_DSA_44.publicKey,
              mldsa44SignedMessage: signedMessages.ML_DSA_44.signedMessage,
              slhdsaSha2S128Address: signedMessages.SLH_DSA_SHA2_S_128.address,
              slhdsaSha2S128PublicKey:
                signedMessages.SLH_DSA_SHA2_S_128.publicKey,
              slhdsaSha2S128SignedMessage:
                signedMessages.SLH_DSA_SHA2_S_128.signedMessage
            },
            cfTurnstileToken
          );

          const proof = await searchYellowpagesByBtcAddress(bitcoinAddress);

          setProof(proof);

          router.push('/registration-complete');
        } catch {
          setShowErrorDialog(true);
        }

        setIsSubmitting(false);
      } else {
        setShowInvalidSignatureAlert(true);
      }
    } catch {
      setShowErrorDialog(true);
    }
  }, [
    router,
    signature,
    bitcoinAddress,
    signingMessage,
    generateSignedMessagesTaskRef,
    cfTurnstileToken,
    setProof
  ]);

  const changeBitcoinAddress = useCallback(
    (value: string) => {
      setBitcoinAddress(value as BitcoinAddress);
    },
    [setBitcoinAddress]
  );

  return (
    <main className={isBitcoinAddressConfirmed ? styles.confirmed : undefined}>
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
              <ToolbarButton
                disabled={!signingMessage}
                onClick={editBitcoinAddress}
              >
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
            onClick={signingMessageClickHandler}
          >
            <HighlightedBox>
              {signingMessage ? (
                <span className={styles.signingMessage}>{signingMessage}</span>
              ) : (
                <LoaderCircleIcon />
              )}
            </HighlightedBox>
          </button>
          <Toolbar>
            <CopyTextToolbarButton
              ref={copyTextToolbarButtonRef}
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
              onChange={e =>
                setSignature(
                  e.target.value ? (e.target.value as SignedMessage) : undefined
                )
              }
            />
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <div
          className={`${styles.captchaContainer} ${isSignaturePopulated ? styles.showCaptcha : ''}`}
        >
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY!}
            onSuccess={setCfTurnstileToken}
            onExpire={() => setCfTurnstileToken(null)}
            options={{ theme: 'dark' }}
          />
        </div>
        <RegistrationFooterActions>
          <Button variant='secondary' onClick={goBack}>
            <ArrowLeftIcon />
            Back
          </Button>
          <Button
            variant='primary'
            onClick={completeRegistration}
            disabled={
              !isSignaturePopulated || !cfTurnstileToken || isSubmitting
            }
          >
            Complete {isSubmitting ? <LoaderCircleIcon /> : <ArrowRightIcon />}
          </Button>
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
      {showErrorDialog && (
        <Dialog>
          <DialogTitle>Oops, something went wrong</DialogTitle>
          <DialogDescription>
            Please make sure that your Bitcoin address and signature are correct
            and try again.
          </DialogDescription>
          <Alert>
            If the error persists, please reach out to{' '}
            <a
              href='mailto:support@projecteleven.com'
              className={styles.contactLink}
            >
              support@projecteleven.com
            </a>
          </Alert>
          <DialogFooter>
            <Button variant='primary' onClick={acknowledgeErrorDialog}>
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
  const [bitcoinAddress, setBitcoinAddress] = useState<BitcoinAddress>();

  const clearSensitiveState = useCallback(() => {
    setSigningMessage(undefined);
    setSignature(undefined);
    setBitcoinAddress(undefined);
  }, []);

  useEffect(() => {
    return function cleanup() {
      clearSensitiveState();
    };
  }, [clearSensitiveState]);

  return {
    signingMessage,
    signature,
    bitcoinAddress,
    clearSensitiveState,
    setSigningMessage,
    setSignature,
    setBitcoinAddress
  };
};
