'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function SharePageRedirection() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null;
}
