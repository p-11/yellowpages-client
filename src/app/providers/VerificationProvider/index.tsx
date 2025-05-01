'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type VerificationContextType = {
  result: { pqAddress: string; createdAt: string } | null | undefined;
  bitcoinAddress: string;
  setResult: (
    value: { pqAddress: string; createdAt: string } | null | undefined
  ) => void;
  setBitcoinAddress: (value: string) => void;
};

const VerificationContext = createContext<VerificationContextType | undefined>(
  undefined
);

export const VerificationProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [result, setResult] = useState<VerificationContextType['result']>();
  const [bitcoinAddress, setBitcoinAddress] = useState('');

  useEffect(() => {
    return function cleanup() {
      setResult(undefined);
      setBitcoinAddress('');
    };
  }, []);

  return (
    <VerificationContext.Provider
      value={{
        result,
        setResult,
        bitcoinAddress,
        setBitcoinAddress
      }}
    >
      {children}
    </VerificationContext.Provider>
  );
};

export const useVerificationContext = () => {
  const context = useContext(VerificationContext);
  if (!context) {
    throw new Error(
      'useVerificationContext must be used within a VerificationProvider'
    );
  }
  return context;
};
