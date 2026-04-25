'use client';

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

export function SessionProviderWrapper({ children }: { children: ReactNode }): JSX.Element {
  return <SessionProvider>{children}</SessionProvider>;
}
