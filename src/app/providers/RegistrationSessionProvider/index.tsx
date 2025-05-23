'use client';

import { usePathname, useRouter } from 'next/navigation';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import {
  type BitcoinAddress,
  generateSeedPhrase,
  type Mnemonic24
} from '@/core/cryptography';
import { createGenerateAddressesTask } from '@/core/cryptographyInWorkers';

type RegistrationSessionContextType = {
  showNewSessionAlert: boolean;
  hasConfirmedSeedPhrase: boolean;
  seedPhrase?: Mnemonic24;
  bitcoinAddress?: BitcoinAddress;
  proofData?: string;
  pqAddresses?: Awaited<
    ReturnType<ReturnType<typeof createGenerateAddressesTask>['waitForResult']>
  >;
  setShowNewSessionAlert: (_value: boolean) => void;
  setBitcoinAddress: (_value: BitcoinAddress) => void;
  setProofData: (_value: string) => void;
};

const RegistrationSessionContext = createContext<
  RegistrationSessionContextType | undefined
>(undefined);

const sessionStorageKey = 'activeRegistrationSession';

export const RegistrationSessionProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const activeSession = useRef<ReturnType<typeof setTimeout>>(null);
  const router = useRouter();

  const [showNewSessionAlert, setShowNewSessionAlert] = useState(false);
  const [hasConfirmedSeedPhrase, setHasConfirmedSeedPhrase] = useState(false);
  const {
    seedPhrase,
    bitcoinAddress,
    proofData,
    pqAddresses,
    clearSensitiveState,
    setSeedPhrase,
    setBitcoinAddress,
    clearSeedPhrase,
    setProofData,
    setPqAddresses
  } = useSensitiveState();
  const generateAddressesTaskRef = useRef(createGenerateAddressesTask());

  const startRegistrationSession = useCallback(async () => {
    activeSession.current = setTimeout(
      () => {
        clearSensitiveState();
        router.replace('/session-expired');
      },
      1000 * 60 * 30 // 30 minute session expiry
    );

    sessionStorage.setItem(sessionStorageKey, '1');

    const seedPhrase = generateSeedPhrase();
    setSeedPhrase(seedPhrase);

    generateAddressesTaskRef.current.start({ mnemonic24: seedPhrase });

    const pqAddresses = await generateAddressesTaskRef.current.waitForResult();

    if (pqAddresses) {
      setPqAddresses(pqAddresses);
    }
  }, [router, setSeedPhrase, clearSensitiveState, setPqAddresses]);

  const endRegistrationSession = useCallback(() => {
    if (activeSession.current) {
      clearTimeout(activeSession.current);
      activeSession.current = null;
    }
    generateAddressesTaskRef.current.terminate();
    sessionStorage.removeItem(sessionStorageKey);
    setHasConfirmedSeedPhrase(false);
    setShowNewSessionAlert(false);
  }, []);

  const handleSessionRedirects = useCallback(() => {
    if (activeSession.current) return;

    const hasPreviousSession = !!sessionStorage.getItem(sessionStorageKey);

    if (hasPreviousSession) {
      router.replace('/register/step-1');
    } else {
      router.replace('/');
    }
  }, [router]);

  const onLoadStep1Route = useCallback(() => {
    if (!activeSession.current) {
      clearSensitiveState();

      const hasPreviousSession = !!sessionStorage.getItem(sessionStorageKey);

      if (hasPreviousSession) {
        setShowNewSessionAlert(true);
      }

      startRegistrationSession();
    }
  }, [clearSensitiveState, startRegistrationSession]);

  const onLoadStep2Route = useCallback(() => {
    handleSessionRedirects();
  }, [handleSessionRedirects]);

  const onLoadStep3Route = useCallback(() => {
    handleSessionRedirects();

    if (activeSession.current) {
      setHasConfirmedSeedPhrase(true);
    }
  }, [handleSessionRedirects]);

  const onLoadCompletionRoute = useCallback(() => {
    handleSessionRedirects();
    endRegistrationSession();
    clearSeedPhrase();
  }, [handleSessionRedirects, endRegistrationSession, clearSeedPhrase]);

  const onLoadNonRegistrationRoute = useCallback(() => {
    endRegistrationSession();
    clearSensitiveState();
  }, [endRegistrationSession, clearSensitiveState]);

  const onLoadSessionExpiredRoute = useCallback(() => {
    if (!activeSession.current) {
      router.replace('/');
    }

    endRegistrationSession();
    clearSensitiveState();
  }, [endRegistrationSession, clearSensitiveState, router]);

  useEffect(() => {
    window.addEventListener('beforeunload', clearSensitiveState);

    return function cleanup() {
      window.removeEventListener('beforeunload', clearSensitiveState);
    };
  }, [clearSensitiveState]);

  useEffect(() => {
    switch (pathname) {
      case '/register/step-1':
        onLoadStep1Route();
        break;
      case '/register/step-2':
        onLoadStep2Route();
        break;
      case '/register/step-3':
        onLoadStep3Route();
        break;
      case '/registration-complete':
        onLoadCompletionRoute();
        break;
      case '/session-expired':
        onLoadSessionExpiredRoute();
        break;
      default:
        onLoadNonRegistrationRoute();
    }
  }, [
    pathname,
    onLoadStep1Route,
    onLoadStep2Route,
    onLoadStep3Route,
    onLoadCompletionRoute,
    onLoadSessionExpiredRoute,
    onLoadNonRegistrationRoute
  ]);

  return (
    <RegistrationSessionContext.Provider
      value={{
        bitcoinAddress,
        setBitcoinAddress,
        seedPhrase,
        showNewSessionAlert,
        hasConfirmedSeedPhrase,
        setShowNewSessionAlert,
        proofData,
        pqAddresses,
        setProofData
      }}
    >
      {children}
    </RegistrationSessionContext.Provider>
  );
};

export const useRegistrationSessionContext = () => {
  const context = useContext(RegistrationSessionContext);
  if (!context) {
    throw new Error(
      'useRegistrationSessionContext must be used within a RegistrationSessionProvider'
    );
  }
  return context;
};

const useSensitiveState = () => {
  const [seedPhrase, setSeedPhrase] =
    useState<RegistrationSessionContextType['seedPhrase']>();
  const [bitcoinAddress, setBitcoinAddress] =
    useState<RegistrationSessionContextType['bitcoinAddress']>();
  const [proofData, setProofData] = useState<string>();
  const [pqAddresses, setPqAddresses] =
    useState<RegistrationSessionContextType['pqAddresses']>();

  const clearSeedPhrase = useCallback(() => {
    setSeedPhrase(undefined);
  }, []);

  const clearSensitiveState = useCallback(() => {
    setSeedPhrase(undefined);
    setBitcoinAddress(undefined);
    setProofData(undefined);
    setPqAddresses(undefined);
  }, []);

  useEffect(() => {
    return function cleanup() {
      clearSensitiveState();
    };
  }, [clearSensitiveState]);

  return {
    seedPhrase,
    bitcoinAddress,
    proofData,
    pqAddresses,
    setPqAddresses,
    clearSensitiveState,
    clearSeedPhrase,
    setSeedPhrase,
    setBitcoinAddress,
    setProofData
  };
};
