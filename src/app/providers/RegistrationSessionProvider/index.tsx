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
  generateSeedPhrase,
  generateSignedMessages
} from '@/core/cryptography';

type RegistrationSessionContextType = {
  showNewSessionAlert: boolean;
  setShowNewSessionAlert: (_value: boolean) => void;
  hasConfirmedSeedPhrase: boolean;
  seedPhrase: string;
  bitcoinAddress: string;
  setBitcoinAddress: (_value: string) => void;
  signedMessages: ReturnType<typeof generateSignedMessages> | undefined;
  setSignedMessages: (
    _value: ReturnType<typeof generateSignedMessages>
  ) => void;
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
    signedMessages,
    setSignedMessages,
    clearSensitiveState,
    setSeedPhrase,
    setBitcoinAddress,
    clearSeedPhrase
  } = useSensitiveState();

  const startRegistrationSession = useCallback(() => {
    activeSession.current = setTimeout(
      () => {
        clearSensitiveState();
        router.replace('/session-expired');
      },
      1000 * 60 * 30 // 30 minute session expiry
    );

    sessionStorage.setItem(sessionStorageKey, '1');

    setSeedPhrase(generateSeedPhrase());
  }, [router, setSeedPhrase, clearSensitiveState]);

  const endRegistrationSession = useCallback(() => {
    if (activeSession.current) {
      clearTimeout(activeSession.current);
      activeSession.current = null;
    }
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
      const hasPreviousSession = !!sessionStorage.getItem(sessionStorageKey);

      if (hasPreviousSession) {
        setShowNewSessionAlert(true);
      }

      startRegistrationSession();
    }
  }, [startRegistrationSession]);

  const onLoadStep2Route = useCallback(() => {
    handleSessionRedirects();
  }, [handleSessionRedirects]);

  const onLoadStep3Route = useCallback(() => {
    handleSessionRedirects();
    setHasConfirmedSeedPhrase(true);
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
        signedMessages,
        setSignedMessages,
        bitcoinAddress,
        setBitcoinAddress,
        seedPhrase,
        showNewSessionAlert,
        hasConfirmedSeedPhrase,
        setShowNewSessionAlert
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
  const [seedPhrase, setSeedPhrase] = useState('');
  const [bitcoinAddress, setBitcoinAddress] = useState('');
  const [signedMessages, setSignedMessages] =
    useState<ReturnType<typeof generateSignedMessages>>();

  const clearSeedPhrase = useCallback(() => {
    setSeedPhrase('');
  }, []);

  const clearSensitiveState = useCallback(() => {
    setSeedPhrase('');
    setBitcoinAddress('');
    setSignedMessages(undefined);
  }, []);

  useEffect(() => {
    return function cleanup() {
      clearSensitiveState();
    };
  }, [clearSensitiveState]);

  return {
    seedPhrase,
    bitcoinAddress,
    signedMessages,
    clearSensitiveState,
    clearSeedPhrase,
    setSeedPhrase,
    setBitcoinAddress,
    setSignedMessages
  };
};
