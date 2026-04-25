'use client';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="skillarena-theme">
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </ThemeProvider>
    </SessionProvider>
  );
}
