import { useEffect } from 'react';
import { useRegistrationProgressContext } from '@/app/providers/RegistrationProgressProvider';
import { useRouter } from 'next/navigation';
import { useRegistrationSessionStore } from './useRegistrationSessionStore';

export const useProtectRegistrationRouteAccess = () => {
  const { isRegistrationInProgress } = useRegistrationProgressContext();
  const router = useRouter();
  const { hasExistingRegistrationProgress } = useRegistrationSessionStore();

  useEffect(() => {
    if (!isRegistrationInProgress) {
      if (hasExistingRegistrationProgress()) {
        router.replace('/register/step-1');
      } else {
        router.replace('/');
      }
    }
  }, [router, isRegistrationInProgress, hasExistingRegistrationProgress]);
};
