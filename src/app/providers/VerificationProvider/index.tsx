'use client';

import { searchYellowpagesByBtcAddress } from '@/core/api';
import React, { createContext, useContext, useEffect, useState } from 'react';

type VerificationContextType = {
  result:
    | Awaited<ReturnType<typeof searchYellowpagesByBtcAddress>>
    | null
    | undefined;
  bitcoinAddress: string;
  setResult: (
    _value:
      | Awaited<ReturnType<typeof searchYellowpagesByBtcAddress>>
      | null
      | undefined
  ) => void;
  setBitcoinAddress: (_value: string) => void;
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
