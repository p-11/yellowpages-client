'use client';

import { searchYellowpagesByBtcAddress } from '@/core/api';
import React, { createContext, useContext, useEffect, useState } from 'react';

type SearchContextType = {
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

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [result, setResult] = useState<SearchContextType['result']>();
  const [bitcoinAddress, setBitcoinAddress] = useState('');

  useEffect(() => {
    return function cleanup() {
      setResult(undefined);
      setBitcoinAddress('');
    };
  }, []);

  return (
    <SearchContext.Provider
      value={{
        result,
        setResult,
        bitcoinAddress,
        setBitcoinAddress
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
};
