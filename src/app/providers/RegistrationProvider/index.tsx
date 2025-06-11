'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';
import { Proof } from '@/core/api';

type RegistrationContextType = {
  proof?: Proof;
  setProof: (_value: Proof) => void;
};

const RegistrationContext = createContext<RegistrationContextType | undefined>(
  undefined
);

/*
 * Manages data required for the '/registration-complete' route.
 */
export const RegistrationProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const { proof, setProof } = useSensitiveState();

  return (
    <RegistrationContext.Provider
      value={{
        proof,
        setProof
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};

export const useRegistrationContext = () => {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error(
      'useRegistrationContext must be used within a RegistrationProvider'
    );
  }
  return context;
};

const useSensitiveState = () => {
  const [proof, setProof] = useState<Proof>();

  const clearSensitiveState = useCallback(() => {
    setProof(undefined);
  }, []);

  useEffect(() => {
    return function cleanup() {
      clearSensitiveState();
    };
  }, [clearSensitiveState]);

  return {
    proof,
    setProof,
    clearSensitiveState
  };
};
