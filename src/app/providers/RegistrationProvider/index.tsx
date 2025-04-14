'use client';

import { mockSeedPhrase } from '@/mock-data';
import React, { createContext, useCallback, useContext, useState } from 'react';

type RegistrationContextType = {
  seedPhrase: string;
  generateSeedPhrase: () => void;
};

const RegistrationContext = createContext<RegistrationContextType | undefined>(
  undefined
);

export const RegistrationProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [seedPhrase, setSeedPhrase] = useState('');

  const generateSeedPhrase = useCallback(
    () => setSeedPhrase(mockSeedPhrase),
    []
  );

  return (
    <RegistrationContext.Provider value={{ seedPhrase, generateSeedPhrase }}>
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
