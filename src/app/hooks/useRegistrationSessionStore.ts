import { useCallback } from 'react';

const registrationProgressKey = 'registrationProgress';

export const useRegistrationSessionStore = () => {
  const saveRegistrationProgress = useCallback(() => {
    sessionStorage.setItem(registrationProgressKey, '1');
  }, []);

  const hasExistingRegistrationProgress = useCallback(() => {
    return !!sessionStorage.getItem(registrationProgressKey);
  }, []);

  const clearRegistrationSessionStore = useCallback(() => {
    sessionStorage.removeItem(registrationProgressKey);
  }, []);

  return {
    saveRegistrationProgress,
    clearRegistrationSessionStore,
    hasExistingRegistrationProgress
  };
};
