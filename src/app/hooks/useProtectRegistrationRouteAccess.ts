import { useEffect } from 'react';
import { useRegistrationProgressContext } from '@/app/providers/RegistrationProgressProvider';
import { useRouter } from 'next/navigation';

export const useProtectRegistrationRouteAccess = () => {
  const { isRegistrationInProgress } = useRegistrationProgressContext();
  const router = useRouter();

  useEffect(() => {
    if (!isRegistrationInProgress) {
      router.replace('/');
    }
  }, [router, isRegistrationInProgress]);
};
