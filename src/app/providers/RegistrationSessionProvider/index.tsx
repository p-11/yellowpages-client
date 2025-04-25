'use client';

import { registrationData } from '@/core/registrationData';
import { usePathname, useRouter } from 'next/navigation';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';

type RegistrationSessionContextType = {
  showNewSessionAlert: boolean;
  setShowNewSessionAlert: (value: boolean) => void;
  hasConfirmedSeedPhrase: boolean;
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
  const activeSession = useRef(false);
  const router = useRouter();

  const [showNewSessionAlert, setShowNewSessionAlert] = useState(false);
  const [hasConfirmedSeedPhrase, setHasConfirmedSeedPhrase] = useState(false);

  const startRegistrationSession = useCallback(() => {
    activeSession.current = true;
    sessionStorage.setItem(sessionStorageKey, '1');
  }, []);

  const endRegistrationSession = useCallback(() => {
    registrationData.clearSeedPhrase();
    activeSession.current = false;
    sessionStorage.removeItem(sessionStorageKey);
    setHasConfirmedSeedPhrase(false);
    setShowNewSessionAlert(false);
  }, []);

  const onLoadStep1Route = useCallback(() => {
    if (!activeSession.current) {
      startRegistrationSession();
    }
  }, [startRegistrationSession]);

  const handleRedirects = useCallback(() => {
    if (activeSession.current) return;

    const hasPreviousSession = !!sessionStorage.getItem(sessionStorageKey);

    if (hasPreviousSession) {
      setShowNewSessionAlert(true);
      router.replace('/register/step-1');
    } else {
      router.replace('/');
    }
  }, [router]);

  const onLoadStep2Route = useCallback(() => {
    handleRedirects();
  }, [handleRedirects]);

  const onLoadStep3Route = useCallback(() => {
    handleRedirects();
    setHasConfirmedSeedPhrase(true);
  }, [handleRedirects]);

  const onLoadCompletionRoute = useCallback(() => {
    handleRedirects();
    endRegistrationSession();
  }, [handleRedirects, endRegistrationSession]);

  const onLoadNonRegistrationRoute = useCallback(() => {
    endRegistrationSession();
    registrationData.clearBitcoinAddress();
    registrationData.clearPqAddress();
  }, [endRegistrationSession]);

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
      default:
        onLoadNonRegistrationRoute();
    }
  }, [
    pathname,
    onLoadStep1Route,
    onLoadStep2Route,
    onLoadStep3Route,
    onLoadCompletionRoute,
    onLoadNonRegistrationRoute
  ]);

  return (
    <RegistrationSessionContext.Provider
      value={{
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
