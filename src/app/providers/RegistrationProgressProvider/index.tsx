'use client';

import React, { createContext, useContext, useState } from 'react';

type RegistrationProgressContextType = {
  isRegistrationInProgress: boolean;
  setIsRegistrationInProgress: (value: boolean) => void;
  showCompletedConfirmationStep: boolean;
  setShowCompletedConfirmationStep: (value: boolean) => void;
};

const RegistrationProgressContext = createContext<
  RegistrationProgressContextType | undefined
>(undefined);

export const RegistrationProgressProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [isRegistrationInProgress, setIsRegistrationInProgress] =
    useState(false);
  const [showCompletedConfirmationStep, setShowCompletedConfirmationStep] =
    useState(false);

  return (
    <RegistrationProgressContext.Provider
      value={{
        isRegistrationInProgress,
        showCompletedConfirmationStep,
        setIsRegistrationInProgress,
        setShowCompletedConfirmationStep
      }}
    >
      {children}
    </RegistrationProgressContext.Provider>
  );
};

export const useRegistrationProgressContext = () => {
  const context = useContext(RegistrationProgressContext);
  if (!context) {
    throw new Error(
      'useRegistrationProgressContext must be used within a RegistrationProgressProvider'
    );
  }
  return context;
};
