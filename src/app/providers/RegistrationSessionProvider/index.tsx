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
  const activeSession = useRef<ReturnType<typeof setTimeout>>(null);
  const router = useRouter();

  const [showNewSessionAlert, setShowNewSessionAlert] = useState(false);
  const [hasConfirmedSeedPhrase, setHasConfirmedSeedPhrase] = useState(false);

  const startRegistrationSession = useCallback(() => {
    activeSession.current = setTimeout(
      () => {
        router.replace('/session-expired');
      },
      1000 * 60 * 30 // 30 minute session expiry
    );

    sessionStorage.setItem(sessionStorageKey, '1');
  }, [router]);

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

  const clearRegistrationData = useCallback(() => {
    registrationData.clearSeedPhrase();
    registrationData.clearBitcoinAddress();
    registrationData.clearPqAddress();
  }, []);

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
    registrationData.clearSeedPhrase();
  }, [handleSessionRedirects, endRegistrationSession]);

  const onLoadNonRegistrationRoute = useCallback(() => {
    endRegistrationSession();
    clearRegistrationData();
  }, [endRegistrationSession, clearRegistrationData]);

  const onLoadSessionExpiredRoute = useCallback(() => {
    if (!activeSession.current) {
      router.replace('/');
    }

    endRegistrationSession();
    clearRegistrationData();
  }, [endRegistrationSession, clearRegistrationData, router]);

  useEffect(() => {
    window.addEventListener('beforeunload', clearRegistrationData);

    return function cleanup() {
      window.removeEventListener('beforeunload', clearRegistrationData);
    };
  }, [clearRegistrationData]);

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
