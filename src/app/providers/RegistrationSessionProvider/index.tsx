'use client';

import { useRouter } from 'next/navigation';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import { generateSeedPhrase, type Mnemonic24 } from '@/core/cryptography';
import { createGenerateAddressesTask } from '@/core/cryptographyInWorkers';

type RegistrationSessionContextType = {
  showNewSessionAlert: boolean;
  hasConfirmedSeedPhrase: boolean;
  generateAddressesTaskRef: React.RefObject<
    ReturnType<typeof createGenerateAddressesTask>
  >;
  seedPhrase?: Mnemonic24;
  pqAddresses?: Awaited<
    ReturnType<ReturnType<typeof createGenerateAddressesTask>['waitForResult']>
  >;
  setShowNewSessionAlert: (_value: boolean) => void;
  setHasConfirmedSeedPhrase: (_value: boolean) => void;
  setPqAddresses: (
    _value: Awaited<
      ReturnType<
        ReturnType<typeof createGenerateAddressesTask>['waitForResult']
      >
    >
  ) => void;
};

const RegistrationSessionContext = createContext<
  RegistrationSessionContextType | undefined
>(undefined);

const sessionStorageKey = 'activeRegistrationSession';

/*
 * Manages the lifecycle and data of a registration session.
 */
export const RegistrationSessionProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();

  const activeSession = useRef<ReturnType<typeof setTimeout>>(null);
  const generateAddressesTaskRef = useRef(createGenerateAddressesTask());

  const [showNewSessionAlert, setShowNewSessionAlert] = useState(false);
  const [hasConfirmedSeedPhrase, setHasConfirmedSeedPhrase] = useState(false);

  const {
    seedPhrase,
    pqAddresses,
    setSeedPhrase,
    setPqAddresses,
    clearSensitiveState
  } = useSensitiveState();

  const endRegistrationSession = useCallback(() => {
    if (activeSession.current) {
      clearTimeout(activeSession.current);
    }

    activeSession.current = null;

    clearSensitiveState();

    generateAddressesTaskRef.current.terminate();

    window.removeEventListener('beforeunload', endRegistrationSession);
  }, [clearSensitiveState]);

  useEffect(
    function startRegistrationSession() {
      // redirect when step 2 or 3 are directly navigated to
      router.replace('/register/step-1');

      activeSession.current = setTimeout(
        () => {
          endRegistrationSession();
          router.replace('/session-expired');
        },
        1000 * 60 * 30 // 30 minute session expiry
      );

      const hasPreviousSession = !!sessionStorage.getItem(sessionStorageKey);

      if (hasPreviousSession) {
        setShowNewSessionAlert(true);
      }

      sessionStorage.setItem(sessionStorageKey, '1');

      const seedPhrase = generateSeedPhrase();
      setSeedPhrase(seedPhrase);

      generateAddressesTaskRef.current.start({
        mnemonic24: seedPhrase
      });

      window.addEventListener('beforeunload', endRegistrationSession);

      return function cleanup() {
        sessionStorage.removeItem(sessionStorageKey);

        endRegistrationSession();
      };
    },
    [router, setSeedPhrase, endRegistrationSession]
  );

  return (
    <RegistrationSessionContext.Provider
      value={{
        seedPhrase,
        pqAddresses,
        showNewSessionAlert,
        hasConfirmedSeedPhrase,
        generateAddressesTaskRef,
        setShowNewSessionAlert,
        setHasConfirmedSeedPhrase,
        setPqAddresses
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
  const [pqAddresses, setPqAddresses] =
    useState<RegistrationSessionContextType['pqAddresses']>();

  const clearSensitiveState = useCallback(() => {
    setSeedPhrase(undefined);
    setPqAddresses(undefined);
  }, []);

  useEffect(() => {
    return function cleanup() {
      clearSensitiveState();
    };
  }, [clearSensitiveState]);

  return {
    seedPhrase,
    pqAddresses,
    setSeedPhrase,
    setPqAddresses,
    clearSensitiveState
  };
};
