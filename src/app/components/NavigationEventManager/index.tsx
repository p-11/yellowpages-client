'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { registrationData } from '@/core/registrationData';

const registrationPathnames = [
  '/register/step-1',
  '/register/step-2',
  '/register/step-3'
];
const registrationCompletePathname = '/registration-complete';

export function NavigationEventManager({
  children
}: {
  children: React.ReactNode;
}) {
  const currentPathname = usePathname();

  useEffect(() => {
    if (!registrationPathnames.includes(currentPathname)) {
      registrationData.clearSeedPhrase();

      if (currentPathname !== registrationCompletePathname) {
        registrationData.clearBitcoinAddress();
        registrationData.clearPqAddress();
      }
    }
  }, [currentPathname]);

  return children;
}
