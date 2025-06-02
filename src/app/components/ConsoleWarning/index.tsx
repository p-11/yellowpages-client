'use client';

import { useEffect } from 'react';

export function ConsoleWarning() {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.warn(
      '\n%cSecurity Warning\n\n%cThis browser feature is intended for developers. Pasting unknown code here can be dangerous.',
      'color:rgb(234, 209, 41); font-weight: bold; font-size: 16px;',
      'color:rgb(234, 209, 41); font-size: 14px;'
    );
  }, []);

  return null;
}
